import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Typed response interfaces
interface CampaignRow {
    id: string;
    name: string;
    status: string;
    budget: number;
    start_date: string | null;
    end_date: string | null;
}

interface AvailableScreenRow {
    id: string;
    screen_name: string;
    location: string;
    rate: number;
    screen_type: string;
}

interface AdvertiserDashboardResponse {
    totalCampaigns: number;
    totalBookings: number;
    totalSpend: number;
    campaigns: CampaignRow[];
    availableScreens: AvailableScreenRow[];
}

// GET /api/advertiser/dashboard - Secure Advertiser Dashboard API
export async function GET() {
    try {
        const supabase = await createClient();

        // ─── 1. AUTHENTICATE ───
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("Advertiser dashboard: auth failed", userError?.message);
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
            console.error("Advertiser dashboard: profile not found", profileError?.message);
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

        if (profileData.role !== "advertiser") {
            return NextResponse.json(
                { error: "Forbidden - Advertiser access only" },
                { status: 403 }
            );
        }

        // ─── 3. FETCH CAMPAIGNS ───
        const { data: campaigns, error: campaignsError } = await supabase
            .from("campaigns")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (campaignsError) {
            console.error("Advertiser dashboard: campaigns error", campaignsError.message);
            return NextResponse.json(
                { error: `Failed to load campaigns: ${campaignsError.message}` },
                { status: 500 }
            );
        }

        const campaignList = campaigns || [];

        // Format campaigns for response
        const formattedCampaigns: CampaignRow[] = campaignList.map((c: any) => ({
            id: c.id,
            name: c.name || "Unnamed Campaign",
            status: c.status || "draft",
            budget: Number(c.budget) || 0,
            start_date: c.start_date || null,
            end_date: c.end_date || null,
        }));

        // ─── 4. FETCH BOOKINGS & CALCULATE SPEND ───
        let totalBookings = 0;
        let totalSpend = 0;
        const campaignIds = campaignList.map((c: any) => c.id);

        if (campaignIds.length > 0) {
            const { data: bookings, error: bookingsError } = await supabase
                .from("bookings")
                .select("id, total_price")
                .in("campaign_id", campaignIds)
                .in("status", ["pending", "booked", "running", "finished"]);

            if (bookingsError) {
                console.error("Advertiser dashboard: bookings error", bookingsError.message);
                // Don't fail — just return 0
            } else {
                const bookingList = bookings || [];
                totalBookings = bookingList.length;
                totalSpend = bookingList.reduce(
                    (sum: number, b: any) => sum + (Number(b.total_price) || 0),
                    0
                );
            }
        }

        // ─── 5. FETCH AVAILABLE SCREENS ───
        const { data: screens, error: screensError } = await supabase
            .from("screens")
            .select("id, name, location, price_per_day, type")
            .eq("availability", true)
            .order("created_at", { ascending: false })
            .limit(20);

        if (screensError) {
            console.error("Advertiser dashboard: screens error", screensError.message);
            // Don't fail — return empty array
        }

        const formattedScreens: AvailableScreenRow[] = (screens || []).map((s: any) => ({
            id: s.id,
            screen_name: s.name || "Unnamed Screen",
            location: s.location || "Unknown",
            rate: Number(s.price_per_day) || 0,
            screen_type: s.type || "digital",
        }));

        // ─── 6. RETURN STRUCTURED RESPONSE ───
        const response: AdvertiserDashboardResponse = {
            totalCampaigns: formattedCampaigns.length,
            totalBookings,
            totalSpend,
            campaigns: formattedCampaigns,
            availableScreens: formattedScreens,
        };

        return NextResponse.json(response, {
            status: 200,
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate",
            },
        });
    } catch (error: any) {
        console.error("Advertiser dashboard: unexpected error", error?.message || error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
