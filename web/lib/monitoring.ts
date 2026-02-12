import { createClient } from "@supabase/supabase-js";
import { sendEmail, EmailTemplates } from "./email";

// Helper for System Health Checks & Alerting

export async function checkSystemHealth() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Check Offline Devices (> 1 hr since last_seen)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // We want devices that are 'active' but haven't been seen in 1 hour
    const { data: offlineDevices, error: devError } = await supabase
        .from("devices")
        .select("id, screen_id, last_seen, screen:screens(name, owner:profiles(email))")
        .eq("status", "active")
        .lt("last_seen", oneHourAgo);

    if (offlineDevices && offlineDevices.length > 0) {
        console.warn(`[Monitoring] ${offlineDevices.length} devices offline.`);
        // Trigger alerts? 
        // We probably don't want to spam, so we need a way to track if we already alerted.
        // For MVP, we'll log it and maybe alert the System Admin?
        // Or alert the Screen Owner?

        // Alert Owner(s) - simplified loop
        for (const dev of offlineDevices) {
            // @ts-ignore
            const ownerEmail = dev.screen?.owner?.email;
            // @ts-ignore
            const screenName = dev.screen?.name || "Unknown Screen";

            if (ownerEmail) {
                // To avoid spam, we'd ideally check 'last_alerted_at'. Skipping for MVP complexity.
                // console.log(`Alerting ${ownerEmail} about ${screenName}`);
            }
        }
    }

    // 2. Check Failed Payments (Last 24h)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: failedPayments } = await supabase
        .from("payments")
        .select("id", { count: 'exact', head: true })
        .eq("status", "failed")
        .gte("created_at", twentyFourHoursAgo);

    // 3. Queue Size (Pending Payouts)
    const { count: pendingPayouts } = await supabase
        .from("payouts")
        .select("id", { count: 'exact', head: true })
        .eq("status", "pending");

    return {
        timestamp: new Date().toISOString(),
        offlineDevicesCount: offlineDevices?.length || 0,
        failedPaymentsCount: failedPayments || 0,
        pendingPayoutsCount: pendingPayouts || 0,
        status: (failedPayments || 0) > 5 ? 'critical' : (offlineDevices?.length || 0) > 0 ? 'warning' : 'healthy'
    };
}
