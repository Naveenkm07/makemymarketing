import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Typed response interface
interface OwnerDashboardResponse {
    totalRevenue: number;
    activeScreens: number;
    screens: {
        id: string;
        screen_name: string;
        location: string;
        status: "active" | "inactive";
        rate: number;
    }[];
}

// GET /api/owner/dashboard - Secure Owner Dashboard API
export async function GET() {
    try {
        const supabase = await createClient();

        // ─── 1. AUTHENTICATE ───
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("Owner dashboard: auth failed", userError?.message);
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        // ─── 2. VERIFY ROLE ───
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role, is_blocked")
            .eq("id", user.id)
            .single();

        if (profileError || !profile) {
            console.error("Owner dashboard: profile not found", profileError?.message);
            return NextResponse.json(
                { error: "Profile not found" },
                { status: 404 }
            );
        }

        const profileData = profile as any;

        if (profileData.is_blocked) {
            return NextResponse.json(
                { error: "Account is blocked. Contact support." },
                { status: 403 }
            );
        }

        if (profileData.role !== "owner") {
            return NextResponse.json(
                { error: "Forbidden - Owner access only" },
                { status: 403 }
            );
        }

        // ─── 3. FETCH SCREENS ───
        const { data: screens, error: screensError } = await supabase
            .from("screens")
            .select("id, name, location, availability, price_per_day")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: false });

        if (screensError) {
            console.error("Owner dashboard: screens fetch error", screensError.message);
            return NextResponse.json(
                { error: "Failed to load screens" },
                { status: 500 }
            );
        }

        const screenList = screens || [];

        // Map screens to response format
        const formattedScreens = screenList.map((s: any) => ({
            id: s.id,
            screen_name: s.name || "Unnamed Screen",
            location: s.location || "Unknown",
            status: s.availability ? ("active" as const) : ("inactive" as const),
            rate: Number(s.price_per_day) || 0,
        }));

        const activeScreens = formattedScreens.filter(
            (s) => s.status === "active"
        ).length;

        // ─── 4. FETCH BOOKINGS & CALCULATE REVENUE ───
        let totalRevenue = 0;
        const screenIds = screenList.map((s: any) => s.id);

        if (screenIds.length > 0) {
            const { data: bookings, error: bookingsError } = await supabase
                .from("bookings")
                .select("total_price")
                .in("screen_id", screenIds)
                .in("status", ["booked", "running", "finished"]);

            if (bookingsError) {
                console.error("Owner dashboard: bookings fetch error", bookingsError.message);
                // Don't fail the whole request — just return 0 revenue
            } else {
                totalRevenue = (bookings || []).reduce(
                    (sum: number, b: any) => sum + (Number(b.total_price) || 0),
                    0
                );
            }
        }

        // ─── 5. RETURN STRUCTURED RESPONSE ───
        const response: OwnerDashboardResponse = {
            totalRevenue,
            activeScreens,
            screens: formattedScreens,
        };

        return NextResponse.json(response, {
            status: 200,
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate",
            },
        });
    } catch (error: any) {
        console.error("Owner dashboard: unexpected error", error?.message || error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
