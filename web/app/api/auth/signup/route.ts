import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Check if Prisma is available (not during build time)
  if (!prisma) {
    return Response.json({ ok: false, error: "Database not available" }, { status: 503 });
  }

  const body = (await req.json()) as {
    email: string;
    password: string;
    name?: string;
    role: "OWNER" | "ADVERTISER";
  };

  if (!body.email || !body.password || !body.role) {
    return Response.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ ok: false, error: "Email already exists" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: body.name?.trim() || null,
      role: body.role,
      passwordHash: hashPassword(body.password),
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return Response.json({ ok: true, user });
}
