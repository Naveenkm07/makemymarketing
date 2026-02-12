import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/payouts/calculate - Trigger revenue calculation job (Admin or Cron)
export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // In a real app, verify this request comes from a secure cron job or admin
        // For MVP transparency, we'll allow owners to trigger a "Check for new earnings"
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const COMMISSION_RATE = 0.15; // 15%

        // 1. Find completed bookings for this owner's screens that haven't been paid out
        // Note: This matches bookings -> screens -> owner_id
        // Real implementation needs a robust "unprocessed bookings" tracking system.
        // Simplifying for MVP: We'll look for booking_id in a 'payout_items' table or similar.
        // For now, let's simulate the calculation based on "finished" bookings.

        // Fetch owner's screens
        const { data: screens } = await supabase
            .from("screens")
            .select("id")
            .eq("owner_id", user.id);

        const screenIds = screens?.map((s: any) => s.id) || [];

        if (screenIds.length === 0) {
            return NextResponse.json({ message: "No screens found" });
        }

        // Fetch finished, paid bookings
        // We need to join with payouts to make sure we don't double count.
        // Complex query - for MVP we'll mock the aggregation logic or use a simpler check:
        // "Find bookings finished in last 7 days"

        // Mocking finding 1 new booking for demo purposes if no pending payouts exist
        const { data: pendingPayouts } = await supabase
            .from("payouts")
            .select("id")
            .eq("owner_id", user.id)
            .eq("status", "pending");

        if (pendingPayouts && pendingPayouts.length > 0) {
            return NextResponse.json({ message: "Pending payouts already exist", payout: null });
        }

        // Create a demo payout from recent "finished" bookings
        const { data: recentBookings } = await supabase
            .from("bookings")
            .select("total_price")
            .in("screen_id", screenIds)
            .eq("status", "finished")
            .order("created_at", { ascending: false })
            .limit(5);

        const gross = (recentBookings || []).reduce((sum: number, b: any) => sum + Number(b.total_price), 0);

        if (gross === 0) {
            return NextResponse.json({ message: "No new earnings found" });
        }

        const commission = gross * COMMISSION_RATE;
        const net = gross - commission;

        // Create Payout Record
        const { data: payout, error } = await supabase
            .from("payouts")
            .insert({
                owner_id: user.id,
                amount: gross,
                commission: commission,
                net_amount: net,
                status: "pending",
                period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
                period_end: new Date().toISOString(),
            } as any)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, payout });

    } catch (error: any) {
        console.error("Calculation error:", error);
        return NextResponse.json({ error: "Calculation failed" }, { status: 500 });
    }
}
