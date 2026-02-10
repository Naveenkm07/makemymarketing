import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = await createClient();

  const body = (await req.json()) as {
    email: string;
  };

  if (!body.email) {
    return Response.json({ ok: false, error: "Email is required" }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();

  // Send password reset email
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://makemymarket.netlify.app"}/reset-password`,
  });

  if (error) {
    console.error("Password reset error:", error);
    return Response.json(
      { ok: false, error: "Failed to send reset email. Please try again." },
      { status: 500 }
    );
  }

  return Response.json({
    ok: true,
    message: "Password reset link sent! Check your email.",
  });
}
