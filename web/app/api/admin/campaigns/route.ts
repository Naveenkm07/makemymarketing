import { requireAdmin, logAdminAction } from "@/lib/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/campaigns - List campaigns
export async function GET(req: Request) {
    const { error, supabase } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // active, draft, etc.

    let query = supabase
        .from("campaigns")
        .select("*, user:profiles(name, email)")
        .order("created_at", { ascending: false });

    if (status) {
        query = query.eq("status", status);
    }

    const { data: campaigns, error: listError } = await query.limit(50); // Pagination needed later

    if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });
    return NextResponse.json({ campaigns });
}

// POST /api/admin/campaigns - Moderate
export async function POST(req: Request) {
    const { error, user: admin, supabase } = await requireAdmin();
    if (error) return error;

    try {
        const body = await req.json();
        const { campaignId, action } = body; // pause, resume, cancel

        if (!campaignId || !["pause", "resume", "cancel"].includes(action)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        let newStatus = "";
        if (action === "pause") newStatus = "paused_by_admin"; // Enum might fail if strict
        // If strict enum, we might need 'cancelled' or custom field 'moderation_status'.
        // Let's us 'moderation_status' field we added!

        let updates: any = {};
        if (action === "pause") updates.moderation_status = "rejected"; // Effectively pauses in refined queries
        if (action === "resume") updates.moderation_status = "approved";
        if (action === "cancel") updates.status = "cancelled";

        const { error: updateError } = await (supabase
            .from("campaigns") as any)
            .update(updates)
            .eq("id", campaignId);

        if (updateError) throw updateError;

        await logAdminAction(supabase, admin.id, `CAMPAIGN_${action.toUpperCase()}`, "campaign", campaignId);

        return NextResponse.json({ success: true });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
