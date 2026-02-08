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

  if (user.role !== "OWNER") {
    return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const [activeScreens, screens, bookingAgg] = await Promise.all([
    prisma.screen.count({ where: { ownerId: userId } }),
    prisma.screen.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        location: true,
        type: true,
        pricePerSlot: true,
        createdAt: true,
      },
    }),
    prisma.booking.aggregate({
      where: { screen: { ownerId: userId }, status: { in: ["APPROVED", "COMPLETED"] } },
      _sum: { totalPrice: true },
    }),
  ]);

  const totalRevenue = bookingAgg._sum.totalPrice ?? 0;

  return Response.json({
    ok: true,
    stats: {
      totalRevenue,
      activeScreens,
    },
    screens,
  });
}
