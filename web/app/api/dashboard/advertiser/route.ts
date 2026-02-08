import { getPrisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const prisma = getPrisma();
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return Response.json({ ok: false, error: "Invalid session" }, { status: 401 });
  }

  if (user.role !== "ADVERTISER") {
    return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();

  const where = q
    ? {
        OR: [
          { location: { contains: q, mode: "insensitive" as const } },
          { name: { contains: q, mode: "insensitive" as const } },
          { type: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [inventory, myBookingsAgg] = await Promise.all([
    prisma.screen.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        name: true,
        location: true,
        type: true,
        pricePerSlot: true,
        owner: { select: { id: true, name: true, companyName: true } },
      },
    }),
    prisma.booking.aggregate({
      where: { advertiserId: userId },
      _count: { id: true },
      _sum: { totalPrice: true },
    }),
  ]);

  return Response.json({
    ok: true,
    stats: {
      totalBookings: myBookingsAgg._count.id,
      totalSpend: myBookingsAgg._sum.totalPrice ?? 0,
    },
    inventory,
  });
}
