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
    
    // Check for specific error messages
    if (error.message.includes("User not found") || error.message.includes("not found")) {
      return Response.json(
        { ok: false, error: "No account found with this email address." },
        { status: 404 }
      );
    }
    
    if (error.message.includes("rate limit") || error.message.includes("rateLimit")) {
      return Response.json(
        { ok: false, error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }
    
    return Response.json(
      { ok: false, error: error.message || "Failed to send reset email. Please try again." },
      { status: 500 }
    );
  }

  return Response.json({
    ok: true,
    message: "Password reset link sent! Check your email.",
  });
}
