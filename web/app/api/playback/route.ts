import { createClient } from "@/lib/supabase/server";
import type { PlaybackLogInsert } from "@/lib/types/database.types";

export const runtime = "nodejs";

// GET /api/playback - Fetch playback logs
export async function GET(req: Request) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });
        }

        // Get query params
        const { searchParams } = new URL(req.url);
        const bookingId = searchParams.get('booking_id');
        const screenId = searchParams.get('screen_id');
        const limit = parseInt(searchParams.get('limit') || '100');

        // Build query
        let query = supabase
            .from("playback_logs")
            .select(`
        *,
        bookings:booking_id (
          id,
          campaign_id,
          screen_id,
          start_time,
          end_time
        ),
        screens:screen_id (
          id,
          name,
          location
        )
      `)
            .order("played_at", { ascending: false })
            .limit(limit);

        if (bookingId) {
            query = query.eq("booking_id", bookingId);
        }

        if (screenId) {
            query = query.eq("screen_id", screenId);
        }

        const { data: logs, error } = await query;

        if (error) {
            console.error("Fetch playback logs error:", error);
            return Response.json({ ok: false, error: "Failed to load playback logs" }, { status: 500 });
        }

        return Response.json({ ok: true, logs: logs || [] });

    } catch (error: any) {
        console.error("Playback logs API error:", error);
        return Response.json({ ok: false, error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/playback - Log a playback event (proof of play)
export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });
        }

        // Parse request body
        const body = await req.json();
        const { booking_id, screen_id, duration_played, metadata } = body;

        // Validate required fields
        if (!booking_id || !screen_id) {
            return Response.json({
                ok: false,
                error: "Booking ID and screen ID are required"
            }, { status: 400 });
        }

        // Verify the screen belongs to the user (only owners can log playback)
        const { data: screen, error: screenError } = await supabase
            .from("screens")
            .select("id, owner_id")
            .eq("id", screen_id)
            .single();

        if (screenError || !screen) {
            return Response.json({
                ok: false,
                error: "Screen not found"
            }, { status: 404 });
        }

        if ((screen as any).owner_id !== user.id) {
            return Response.json({
                ok: false,
                error: "Unauthorized to log playback for this screen"
            }, { status: 403 });
        }

        // Verify booking exists
        const { data: booking, error: bookingError } = await supabase
            .from("bookings")
            .select("id")
            .eq("id", booking_id)
            .single();

        if (bookingError || !booking) {
            return Response.json({
                ok: false,
                error: "Booking not found"
            }, { status: 404 });
        }

        // Create playback log
        const logData: PlaybackLogInsert = {
            booking_id,
            screen_id,
            duration_played: duration_played || null,
            metadata: metadata || null,
            played_at: new Date().toISOString()
        };

        const { data: log, error } = await supabase
            .from("playback_logs")
            .insert(logData as any)
            .select()
            .single();

        if (error) {
            console.error("Create playback log error:", error);
            return Response.json({ ok: false, error: "Failed to log playback" }, { status: 500 });
        }

        return Response.json({
            ok: true,
            log,
            message: "Playback logged successfully"
        });

    } catch (error: any) {
        console.error("Create playback log API error:", error);
        return Response.json({ ok: false, error: "Internal server error" }, { status: 500 });
    }
}
