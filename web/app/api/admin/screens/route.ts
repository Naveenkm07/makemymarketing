import { requireAdmin, logAdminAction } from "@/lib/admin";
import { NextResponse } from "next/server";
import { sendEmail, EmailTemplates } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/screens - List screens
export async function GET(req: Request) {
    const { error, supabase } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "pending"; // pending, verified, all

    let query = supabase.from("screens").select("*, owner:profiles(name, email)", { count: "exact" });

    if (filter === "pending") {
        query = query.eq("is_verified", false);
    } else if (filter === "verified") {
        query = query.eq("is_verified", true);
    }

    const { data: screens, error: listError } = await query.order("created_at", { ascending: false });

    if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });
    return NextResponse.json({ screens });
}

// POST /api/admin/screens - Approve/Reject
export async function POST(req: Request) {
    const { error, user: admin, supabase } = await requireAdmin();
    if (error) return error;

    try {
        const body = await req.json();
        const { screenId, status } = body; // status: 'approve' | 'reject'

        if (!screenId || !["approve", "reject"].includes(status)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const isVerified = status === "approve";

        // Update screen
        // @ts-ignore
        const { error: updateError } = await (supabase
            .from("screens") as any)
            .update({ is_verified: isVerified } as any)
            .eq("id", screenId);

        if (updateError) throw updateError;

        // Send Email if Approved
        if (isVerified) {
            // @ts-ignore
            const { data: screen } = await (supabase
                .from("screens") as any)
                .select("*, owner:profiles(email)")
                .eq("id", screenId)
                .single();

            // @ts-ignore
            if (screen?.owner?.email) {
                await sendEmail({
                    // @ts-ignore
                    to: screen.owner.email,
                    subject: "Screen Approved! 🚀",
                    html: EmailTemplates.screenApproved(screen.name)
                });
            }
        }

        // Log
        await logAdminAction(supabase, admin.id, `SCREEN_${status.toUpperCase()}`, "screen", screenId);

        return NextResponse.json({ success: true });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
