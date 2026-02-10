import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = await createClient();

  const body = (await req.json()) as {
    email: string;
    password: string;
  };

  if (!body.email || !body.password) {
    return Response.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();

  // Sign in with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password: body.password,
  });

  if (authError) {
    console.error("Supabase login error:", authError);
    return Response.json({ ok: false, error: "Invalid email or password" }, { status: 401 });
  }

  if (!authData.user) {
    return Response.json({ ok: false, error: "Authentication failed" }, { status: 401 });
  }

  // Get user profile from profiles table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, email, role, company, phone, is_verified, is_blocked")
    .eq("id", authData.user.id)
    .single();

  if (profileError) {
    console.error("Profile fetch error:", profileError);
  }

  // Check if user is blocked
  if (profile?.is_blocked) {
    await supabase.auth.signOut();
    return Response.json({ ok: false, error: "Account has been blocked" }, { status: 403 });
  }

  return Response.json({
    ok: true,
    user: {
      id: authData.user.id,
      email: authData.user.email,
      name: profile?.name || "",
      role: profile?.role || "advertiser",
      company: profile?.company || "",
      phone: profile?.phone || "",
      isVerified: profile?.is_verified || false,
    },
  });
}
