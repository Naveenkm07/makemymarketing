import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const body = (await req.json()) as {
      email: string;
      password: string;
      name?: string;
      company?: string;
      phone?: string;
      role: "advertiser" | "owner";
    };

    if (!body.email || !body.password || !body.role) {
      return Response.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    const email = body.email.trim().toLowerCase();
    const name = body.name?.trim() || "";
    const company = body.company?.trim() || "";
    const phone = body.phone?.trim() || "";

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: body.password,
      options: {
        data: {
          name,
          company,
          phone,
          role: body.role,
        },
      },
    });

    if (authError) {
      console.error("Supabase signup error:", authError);
      
      // Handle specific error cases
      if (authError.message.includes("User already registered")) {
        return Response.json({ ok: false, error: "Email already exists" }, { status: 409 });
      }
      
      return Response.json({ ok: false, error: authError.message }, { status: 500 });
    }

    if (!authData.user) {
      return Response.json({ ok: false, error: "Failed to create user" }, { status: 500 });
    }

    // Return success - profile is created automatically via trigger
    return Response.json({ 
      ok: true, 
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name,
        role: body.role,
        company,
        phone,
      },
      message: "Please check your email to verify your account."
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return Response.json({ 
      ok: false, 
      error: error.message || "Internal server error" 
    }, { status: 500 });
  }
}
