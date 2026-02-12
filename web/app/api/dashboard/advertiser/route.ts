import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, is_blocked")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return Response.json(
        { ok: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    if ((profile as any).is_blocked) {
      return Response.json(
        { ok: false, error: "Account blocked" },
        { status: 403 }
      );
    }

    // Get campaign stats
    const { data: campaigns, error: campaignsError } = await supabase
      .from("campaigns")
      .select("id, status, budget")
      .eq("user_id", user.id);

    if (campaignsError) {
      console.error("Campaigns fetch error:", campaignsError);
    }

    const totalCampaigns = campaigns?.length || 0;
    const activeCampaigns = campaigns?.filter((c: any) => c.status === "active").length || 0;
    const totalBudget = campaigns?.reduce((sum: number, c: any) => sum + (c.budget || 0), 0) || 0;

    // Get bookings count
    const { count: totalBookings, error: bookingsCountError } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("campaigns.user_id", user.id);

    if (bookingsCountError) {
      console.error("Bookings count error:", bookingsCountError);
    }

    // Get available screens count
    const { count: availableScreens, error: screensError } = await supabase
      .from("screens")
      .select("*", { count: "exact", head: true })
      .eq("availability", true);

    if (screensError) {
      console.error("Screens fetch error:", screensError);
    }

    // Get recent campaigns with bookings
    const { data: recentCampaigns, error: recentError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentError) {
      console.error("Recent campaigns error:", recentError);
    }

    return Response.json({
      ok: true,
      stats: {
        totalCampaigns,
        activeCampaigns,
        totalBudget,
        totalBookings: totalBookings || 0,
        availableScreens: availableScreens || 0,
        recentCampaigns: recentCampaigns || []
      }
    });

  } catch (error: any) {
    console.error("Dashboard API error:", error);
    return Response.json(
      { ok: false, error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
