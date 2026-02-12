import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/player/playlist?screenId=...
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const screenId = searchParams.get("screenId");

        if (!screenId) {
            return NextResponse.json({ error: "Missing screenId" }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Verify Screen Exists
        // @ts-ignore
        const { data: screen } = await (supabase
            .from("screens") as any)
            .select("id, name")
            .eq("id", screenId)
            .single();

        if (!screen) {
            return NextResponse.json({ error: "Screen not found" }, { status: 404 });
        }

        // 2. Fetch Active Bookings
        // We fetch bookings where:
        // - screen_id matches
        // - status is 'booked' or 'running'
        // - associated campaign is 'active'

        // Supabase join query
        // @ts-ignore
        const { data: bookings, error } = await (supabase
            .from("bookings") as any)
            .select(`
            id,
            start_time,
            end_time,
            campaign:campaigns (
                id,
                name,
                status,
                description, 
                start_date, 
                end_date
            )
        `)
            .eq("screen_id", screenId)
            .in("status", ["booked", "running"]);

        if (error) {
            console.error("Playlist fetch error:", error);
            return NextResponse.json({ error: "Failed to fetch playlist" }, { status: 500 });
        }

        const playlist = [];
        const now = new Date();
        const today = now.toISOString().split("T")[0];

        for (const b of (bookings || [])) {
            const campaign = b.campaign as any; // Cast for easier access

            // Check if campaign is active and dates are valid
            if (campaign && campaign.status === "active") {

                // Check dates (simple day-level check)
                // Ideally we check time too, but Booking start_time/end_time are dates in our schema currently?
                // Let's check schema: columns start_time, end_time are text (from previous steps).
                // Actually in `create-checkout`, we passed startDate (YYYY-MM-DD) to start_time.

                const start = new Date(b.start_time);
                const end = new Date(b.end_time);

                // Allow if today is within range [start, end]
                // We strip time for comparison
                const current = new Date(today);
                const s = new Date(start.toISOString().split("T")[0]);
                const e = new Date(end.toISOString().split("T")[0]);

                if (current >= s && current <= e) {
                    // Push to playlist
                    // We use campaign.description as the media URL (hack from checkout flow)
                    if (campaign.description) {
                        playlist.push({
                            bookingId: b.id,
                            campaignId: campaign.id,
                            mediaUrl: campaign.description,
                            duration: 10, // Default 10s duration (since we didn't store duration in DB)
                            type: campaign.description.endsWith(".mp4") ? "video" : "image"
                        });
                    }
                }
            }
        }

        return NextResponse.json({
            screen: screen.name,
            timestamp: new Date().toISOString(),
            playlist
        });

    } catch (error: any) {
        console.error("Playlist API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
