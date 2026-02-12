import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/iot/logs — Sync logs from device
export async function POST(req: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        const body = await req.json();
        const { deviceId, token, logs } = body;

        if (!deviceId || !token || !Array.isArray(logs)) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // 1. Auth Device
        const { data: device } = await supabase
            .from("devices")
            .select("id")
            .eq("device_id", deviceId)
            .eq("token", token)
            .single();

        if (!device) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Batch Insert Logs
        // Map incoming logs to DB schema
        const logsToInsert = logs.map((log: any) => ({
            device_id: device.id,
            level: log.level || 'info',
            message: log.type === 'playback'
                ? `Played booking ${log.bookingId}`
                : log.message,
            metadata: log,
            created_at: log.timestamp || new Date().toISOString()
        }));

        // Insert Device Logs
        const { error: logError } = await supabase
            .from("device_logs")
            .insert(logsToInsert);

        if (logError) throw logError;

        // 3. Update Prood-of-Play (playback_logs table) if it's a playback event
        const playbackLogs = logs
            .filter((l: any) => l.type === 'playback' && l.bookingId)
            .map((l: any) => ({
                booking_id: l.bookingId,
                screen_id: l.screenId, // Verify matches device.screen_id?
                played_at: l.timestamp || new Date().toISOString(),
                duration_played: l.duration || 10,
                metadata: { device_id: deviceId }
            }));

        if (playbackLogs.length > 0) {
            const { error: popError } = await supabase
                .from("playback_logs")
                .insert(playbackLogs);

            if (popError) console.error("PoP Error:", popError);
        }

        return NextResponse.json({ success: true, count: logs.length });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
