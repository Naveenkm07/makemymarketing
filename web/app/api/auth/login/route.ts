import { getPrisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const prisma = getPrisma();

  const body = (await req.json()) as {
    email: string;
    password: string;
  };

  if (!body.email || !body.password) {
    return Response.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return Response.json({ ok: false, error: "Invalid email or password" }, { status: 401 });
  }

  const ok = verifyPassword(body.password, user.passwordHash);
  if (!ok) {
    return Response.json({ ok: false, error: "Invalid email or password" }, { status: 401 });
  }

  return Response.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
