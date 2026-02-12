import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/iot/register — New Device Handshake
export async function POST(req: Request) {
    // 1. Service Role Client (to bypass RLS for unregistered devices)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        const body = await req.json();
        let { deviceId } = body;

        // If no deviceId provided, generates one
        if (!deviceId) {
            deviceId = crypto.randomUUID();
        }

        // Check if exists
        const { data: existing } = await supabase
            .from("devices")
            .select("*")
            .eq("device_id", deviceId)
            .single();

        if (existing) {
            // Already registered
            return NextResponse.json({
                success: true,
                device: existing,
                message: "Device already registered"
            });
        }

        // Create new device record
        const pairingCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit

        const { data: newDevice, error } = await supabase
            .from("devices")
            .insert({
                device_id: deviceId,
                pairing_code: pairingCode,
                status: "pending",
                last_seen: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            device: newDevice,
            pairingCode // Send this back to show on TV screen
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
