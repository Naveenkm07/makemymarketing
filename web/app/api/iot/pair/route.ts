import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/iot/pair — Admin/Owner enters code to link screen
export async function POST(req: Request) {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { pairingCode, screenId } = body;

        if (!pairingCode || !screenId) {
            return NextResponse.json({ error: "Missing code or screenId" }, { status: 400 });
        }

        // Verify screen ownership
        const { data: screen } = await (supabase
            .from("screens") as any)
            .select("owner_id")
            .eq("id", screenId)
            .single();

        if (!screen || screen.owner_id !== user.id) {
            // Allow admin bypass? For now, stick to owner.
            return NextResponse.json({ error: "Screen not found or unauthorized" }, { status: 403 });
        }

        // Find device by code
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data: device } = await adminSupabase
            .from("devices")
            .select("*")
            .eq("pairing_code", pairingCode)
            .eq("status", "pending")
            .single();

        if (!device) {
            return NextResponse.json({ error: "Invalid or expired code" }, { status: 404 });
        }

        // Link it!
        // Generate a secure token for the device
        const deviceToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');

        const { error: updateError } = await adminSupabase
            .from("devices")
            .update({
                screen_id: screenId,
                pairing_code: null, // Clear code
                status: "active",
                token: deviceToken,
                updated_at: new Date().toISOString()
            } as any)
            .eq("id", device.id);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, message: "Device paired successfully" });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
