import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/iot/heartbeat — Device checks in, gets schedule
export async function POST(req: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        const body = await req.json();
        const { deviceId, token } = body;

        // Auto-register check? No, must be registered.
        if (!deviceId || !token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // auth device
        const { data: device } = await supabase
            .from("devices")
            .select("*, screen:screens(id, name, type)")
            .eq("device_id", deviceId)
            .eq("token", token)
            .single();

        if (!device) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        if (device.status === 'blocked') {
            return NextResponse.json({ status: 'blocked' });
        }

        // Update last_seen
        await supabase
            .from("devices")
            .update({ last_seen: new Date().toISOString() } as any)
            .eq("id", device.id);

        // Fetch Schedule for this screen
        // Active bookings falling in valid range
        const now = new Date().toISOString();
        const { data: bookings } = await (supabase
            .from("bookings") as any)
            .select(`
                id, start_time, end_time, status,
                campaign:campaigns(
                   name, description, moderation_status
                )
            `)
            .eq("screen_id", device.screen_id!)
            .eq("status", "booked") // or 'running'
            .gte("end_time", now) // not expired
            .eq("campaign.moderation_status", "approved");

        // Filter valid ones locally if join filter is tricky
        const validSchedule = bookings?.filter((b: any) =>
            b.campaign?.moderation_status === 'approved'
        ).map((b: any) => ({
            id: b.id,
            url: b.campaign.description, // Assuming description holds the media URL
            duration: 10, // Default duration if not specified
            type: 'image', // Detect from URL extension in client
            start_time: b.start_time,
            end_time: b.end_time
        })) || [];

        return NextResponse.json({
            status: "active",
            screen: device.screen,
            schedule: validSchedule,
            config: {
                loop_interval: 60,
                report_interval: 30
            }
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
