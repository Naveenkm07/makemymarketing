import { getPrisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const prisma = getPrisma();

  const body = (await req.json()) as {
    email: string;
    password: string;
    name?: string;
    company?: string;
    phone?: string;
    role: "OWNER" | "ADVERTISER";
  };

  if (!body.email || !body.password || !body.role) {
    return Response.json({ ok: false, error: "Missing required fields" }, { status: 400 });
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
      companyName: body.company?.trim() || null,
      phoneNumber: body.phone?.trim() || null,
    },
    select: { id: true, email: true, name: true, role: true, companyName: true, phoneNumber: true, createdAt: true },
  });

  return Response.json({ ok: true, user });
}
