import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/iot/status — Check if device is paired and claim token
export async function POST(req: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        const body = await req.json();
        const { deviceId } = body;

        if (!deviceId) return NextResponse.json({ error: "Missing deviceId" }, { status: 400 });

        const { data: device } = await supabase
            .from("devices")
            .select("status, token")
            .eq("device_id", deviceId)
            .single();

        if (!device) return NextResponse.json({ error: "Device not found" }, { status: 404 });

        if (device.status === 'active' && device.token) {
            return NextResponse.json({
                status: 'active',
                token: device.token
            });
        }

        return NextResponse.json({ status: device.status }); // likely 'pending'

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
