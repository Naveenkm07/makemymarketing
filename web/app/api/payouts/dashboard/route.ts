import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/payouts/dashboard - Owner Payout Dashboard Data
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Fetch payouts summary
        const { data: payouts, error } = await supabase
            .from("payouts")
            .select("*")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Payouts fetch error:", error);
            return NextResponse.json({ error: "Failed to fetch payouts" }, { status: 500 });
        }

        // Calculate stats
        const list = payouts || [];
        const availableBalance = list
            .filter((p: any) => p.status === "pending")
            .reduce((sum: number, p: any) => sum + Number(p.net_amount), 0);

        const totalPaid = list
            .filter((p: any) => p.status === "paid")
            .reduce((sum: number, p: any) => sum + Number(p.net_amount), 0);

        const commissionPaid = list
            .reduce((sum: number, p: any) => sum + Number(p.commission), 0);

        // Fetch bank status
        // @ts-ignore
        const { data: bank } = await (supabase
            .from("owner_bank_accounts") as any)
            .select("verified, bank_name, account_last4")
            .eq("owner_id", user.id)
            .single();

        return NextResponse.json({
            stats: {
                availableBalance,
                totalPaid,
                commissionPaid,
                totalPayouts: list.length
            },
            payouts: list,
            bankStatus: bank ? {
                setup: true,
                verified: bank.verified,
                details: `${bank.bank_name} •••• ${bank.account_last4}`
            } : {
                setup: false,
                verified: false,
                details: null
            }
        });

    } catch (error: any) {
        console.error("Payouts dashboard error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
