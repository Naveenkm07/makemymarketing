import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function requireAdmin() {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null, supabase };
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const p = profile as any;
    if (!p || p.role !== "admin") {
        return { error: NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 }), user: null, supabase };
    }

    return { error: null, user, supabase };
}

export async function logAdminAction(supabase: any, adminId: string, action: string, targetType: string, targetId: string | null = null, details: any = null) {
    try {
        // @ts-ignore
        await (supabase.from("admin_audit_logs") as any).insert({
            admin_id: adminId,
            action,
            target_type: targetType,
            target_id: targetId,
            details,
            ip_address: "unknown" // Would need headers to get real IP
        });
    } catch (err) {
        console.error("Failed to log admin action:", err);
    }
}
