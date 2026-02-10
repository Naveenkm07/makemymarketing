import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// GET /api/screens - Fetch available screens
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }
    
    // Fetch available screens
    const { data: screens, error } = await supabase
      .from("screens")
      .select("*")
      .eq("availability", true)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Fetch screens error:", error);
      return Response.json({ ok: false, error: "Failed to load screens" }, { status: 500 });
    }
    
    return Response.json({ ok: true, screens: screens || [] });
    
  } catch (error: any) {
    console.error("Screens API error:", error);
    return Response.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
