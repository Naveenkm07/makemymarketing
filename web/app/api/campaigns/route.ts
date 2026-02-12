import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// GET /api/campaigns - Fetch user's campaigns
export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    // Fetch campaigns for this user
    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch campaigns error:", error);
      return Response.json({ ok: false, error: "Failed to load campaigns" }, { status: 500 });
    }

    return Response.json({ ok: true, campaigns: campaigns || [] });

  } catch (error: any) {
    console.error("Campaigns API error:", error);
    return Response.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/campaigns - Create new campaign
export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { name, description, start_date, end_date, budget, target_locations } = body;

    // Validate required fields
    if (!name?.trim()) {
      return Response.json({ ok: false, error: "Campaign name is required" }, { status: 400 });
    }

    // Create campaign
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .insert({
        user_id: user.id,
        name: name.trim(),
        description,
        start_date,
        end_date,
        budget: budget || 0,
        target_locations: target_locations || [],
        status: "draft"
      } as any)
      .select()
      .single();

    if (error) {
      console.error("Create campaign error:", error);
      return Response.json({ ok: false, error: "Failed to create campaign" }, { status: 500 });
    }

    return Response.json({ ok: true, campaign, message: "Campaign created successfully" });

  } catch (error: any) {
    console.error("Create campaign API error:", error);
    return Response.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
