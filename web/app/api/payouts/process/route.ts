import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendEmail, EmailTemplates } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/payouts/process - Process a pending payout (Admin or triggered by owner for MVP)
export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { payout_id } = body;

        if (!payout_id) return NextResponse.json({ error: "Missing payout_id" }, { status: 400 });

        // Fetch payout
        const { data: payout } = await (supabase
            .from("payouts") as any)
            .select("*")
            .eq("id", payout_id)
            .single();

        if (!payout) return NextResponse.json({ error: "Payout not found" }, { status: 404 });

        // Verify ownership (for MVP triggering)
        if (payout.owner_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        if (payout.status !== "pending") {
            return NextResponse.json({ error: "Payout is not pending" }, { status: 400 });
        }

        // Verify bank account
        const { data: bank } = await (supabase
            .from("owner_bank_accounts") as any)
            .select("verified")
            .eq("owner_id", user.id)
            .single();

        if (!bank) {
            return NextResponse.json({ error: "No bank account linked" }, { status: 400 });
        }

        // In production, enforce bank.verified === true. For MVP, we allow unverified but mark as processing.

        // ─── EXECUTE TRANSFER ───
        // Connect to Stripe/Razorpay here.
        // For MVP, we'll simulate a successful transfer after a delay.

        const transactionId = `tx_${Date.now()}_${Math.random().toString(36).slice(2)}`;

        // Update to 'paid'
        const { error: updateError } = await (supabase
            .from("payouts") as any)
            .update({
                status: "paid",
                paid_at: new Date().toISOString(),
                provider_ref: transactionId
            })
            .eq("id", payout_id);

        if (updateError) throw updateError;

        // Send Email
        if (user.email) {
            await sendEmail({
                to: user.email,
                subject: "Payout Processed 💸",
                html: EmailTemplates.payoutProcessed(payout.amount, transactionId)
            });
        }

        return NextResponse.json({ success: true, transactionId });

    } catch (error: any) {
        console.error("Payout process error:", error);
        return NextResponse.json({ error: "Process failed" }, { status: 500 });
    }
}
