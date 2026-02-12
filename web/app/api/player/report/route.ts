import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/player/report - Receive proof-of-play logs
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { logs } = body;

        if (!Array.isArray(logs) || logs.length === 0) {
            return NextResponse.json({ message: "No logs to process" });
        }

        const supabase = await createClient();

        // Logs structure expected:
        // { screenId, bookingId, timestamp, duration }

        // Map to DB insert format
        const inserts = logs.map((log: any) => ({
            screen_id: log.screenId,
            booking_id: log.bookingId,
            played_at: log.timestamp || new Date().toISOString(),
            duration_played: log.duration || 10,
            metadata: { source: "web-player", ip: "unknown" } // Could capture IP from headers
        }));

        // @ts-ignore
        const { error } = await (supabase
            .from("playback_logs") as any)
            .insert(inserts);

        if (error) {
            console.error("Playback log insert error:", error);
            return NextResponse.json({ error: "Failed to save logs" }, { status: 500 });
        }

        return NextResponse.json({ success: true, count: inserts.length });

    } catch (error: any) {
        console.error("Report API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
