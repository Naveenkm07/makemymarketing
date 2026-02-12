import { requireAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/metrics - Dashboard Analytics
export async function GET() {
    const { error, supabase } = await requireAdmin();
    if (error) return error;

    try {
        // Parallel queries for speed
        const [
            { count: usersCount },
            { count: activeScreens },
            { count: activeCampaigns },
            { data: revenueData } // Payment sum needs raw query or calculation
        ] = await Promise.all([
            supabase.from("profiles").select("*", { count: "exact", head: true }),
            supabase.from("screens").select("*", { count: "exact", head: true }).eq("availability", true),
            supabase.from("campaigns").select("*", { count: "exact", head: true }).eq("status", "active"),
            (supabase.from("payments") as any).select("amount").eq("status", "completed")
        ]);

        // Calculate total revenue
        const totalRevenue = (revenueData || []).reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

        // Monthly growth (mock for MVP or calculate from created_at)
        // We'll return basic stats first

        return NextResponse.json({
            stats: {
                totalUsers: usersCount || 0,
                activeScreens: activeScreens || 0,
                activeCampaigns: activeCampaigns || 0,
                totalRevenue: totalRevenue / 100 // Convert paise to currency
            }
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
