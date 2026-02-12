import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkSystemHealth } from "@/lib/monitoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/system — Dashboard Data
export async function GET(req: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // 1. Run Health Check
        const health = await checkSystemHealth();

        // 2. Fetch Active Users Count
        const { count: activeUsers } = await supabase
            .from("profiles")
            .select("id", { count: 'exact', head: true });

        // 3. Fetch Recent Audit Logs (Errors)
        const { data: recentErrors } = await supabase
            .from("admin_audit_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5);

        // 4. API Latency Check (Self-simulation)
        const start = Date.now();
        // Database ping
        await supabase.from("profilestest").select("id").limit(1).maybeSingle();
        const dbLatency = Date.now() - start;

        return NextResponse.json({
            health,
            metrics: {
                activeUsers,
                dbLatency,
                uptime: process.uptime() // Node process uptime
            },
            recentLogs: recentErrors
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
