import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/finance - Payouts Overview
export async function GET() {
    const { error, supabase } = await requireAdmin();
    if (error) return error;

    // Fetch recent payouts
    const { data: payouts, error: listError } = await supabase
        .from("payouts")
        .select("*, owner:profiles(name, email)")
        .order("created_at", { ascending: false })
        .limit(50);

    if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });

    // Calculate totals
    const totalPayouts = payouts.reduce((sum, p: any) => sum + Number(p.amount), 0);
    const totalCommission = payouts.reduce((sum, p: any) => sum + Number(p.commission), 0);

    return NextResponse.json({
        payouts,
        stats: {
            totalPayouts,
            totalCommission,
            pendingCount: payouts.filter((p: any) => p.status === 'pending').length
        }
    });
}
