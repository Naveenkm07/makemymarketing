import { getPrisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const prisma = getPrisma();
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) {
    return Response.json({ ok: false, error: "Invalid session" }, { status: 401 });
  }

  return Response.json({ ok: true, user });
}
