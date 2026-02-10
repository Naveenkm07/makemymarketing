import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, message: "Logged out successfully" });
}
