import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// GET /api/dashboard/owner - Get owner dashboard stats
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }
    
    // Get user profile and verify role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, is_blocked")
      .eq("id", user.id)
      .single();
    
    if (profileError || !profile) {
      return Response.json({ ok: false, error: "Profile not found" }, { status: 404 });
    }
    
    if (profile.is_blocked) {
      return Response.json({ ok: false, error: "Account blocked" }, { status: 403 });
    }
    
    if (profile.role !== "owner") {
      return Response.json({ ok: false, error: "Forbidden - Owner access only" }, { status: 403 });
    }
    
    // Get owner's screens
    const { data: screens, error: screensError } = await supabase
      .from("screens")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    
    if (screensError) {
      console.error("Screens fetch error:", screensError);
    }
    
    const totalScreens = screens?.length || 0;
    const activeScreens = screens?.filter(s => s.availability).length || 0;
    
    // Get revenue from bookings for owner's screens
    const screenIds = screens?.map(s => s.id) || [];
    let totalRevenue = 0;
    
    if (screenIds.length > 0) {
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("total_price")
        .in("screen_id", screenIds)
        .in("status", ["booked", "running", "finished"]);
      
      if (bookingsError) {
        console.error("Bookings fetch error:", bookingsError);
      }
      
      totalRevenue = bookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
    }
    
    return Response.json({
      ok: true,
      stats: {
        totalRevenue,
        activeScreens,
        totalScreens
      },
      screens: screens || []
    });
    
  } catch (error: any) {
    console.error("Owner dashboard API error:", error);
    return Response.json({ ok: false, error: "Failed to load dashboard" }, { status: 500 });
  }
}

// POST /api/dashboard/owner - Create new screen
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }
    
    // Verify owner role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, is_blocked")
      .eq("id", user.id)
      .single();
    
    if (profileError || !profile || profile.role !== "owner") {
      return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    
    if (profile.is_blocked) {
      return Response.json({ ok: false, error: "Account blocked" }, { status: 403 });
    }
    
    const body = await req.json();
    const { name, location, type, price_per_day, specs } = body;
    
    if (!name?.trim() || !location?.trim()) {
      return Response.json({ ok: false, error: "Name and location are required" }, { status: 400 });
    }
    
    // Create screen
    const { data: screen, error } = await supabase
      .from("screens")
      .insert({
        owner_id: user.id,
        name: name.trim(),
        location: location.trim(),
        type: type || "digital",
        price_per_day: price_per_day || 0,
        specs: specs || {},
        availability: true
      })
      .select()
      .single();
    
    if (error) {
      console.error("Create screen error:", error);
      return Response.json({ ok: false, error: "Failed to create screen" }, { status: 500 });
    }
    
    return Response.json({ ok: true, screen, message: "Screen created successfully" });
    
  } catch (error: any) {
    console.error("Create screen API error:", error);
    return Response.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
