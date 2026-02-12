import { requireAdmin, logAdminAction } from "@/lib/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/users - List users
export async function GET(req: Request) {
    const { error, supabase } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data: users, count, error: listError } = await supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(start, end);

    if (listError) {
        return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    return NextResponse.json({ users, count, page, totalPages: Math.ceil((count || 0) / limit) });
}

// POST /api/admin/users - Actions (Block/Unblock)
export async function POST(req: Request) {
    const { error, user: admin, supabase } = await requireAdmin();
    if (error) return error;

    try {
        const body = await req.json();
        const { userId, action } = body; // action: 'block' | 'unblock'

        if (!userId || !["block", "unblock"].includes(action)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        // Prevent blocking self
        if (userId === admin.id) {
            return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });
        }

        const updates = { is_blocked: action === "block" };

        const { error: updateError } = await (supabase
            .from("profiles") as any)
            .update(updates)
            .eq("id", userId);

        if (updateError) throw updateError;

        // Log action
        await logAdminAction(supabase, admin.id, `USER_${action.toUpperCase()}`, "user", userId);

        return NextResponse.json({ success: true });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
