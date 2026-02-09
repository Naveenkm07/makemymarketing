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
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");

  const where = q
    ? {
        OR: [
          { location: { contains: q, mode: "insensitive" as const } },
          { name: { contains: q, mode: "insensitive" as const } },
          { type: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  // If date filters are provided, exclude screens that have availability blocks overlapping the requested range
  let screenIdsToExclude: string[] = [];
  if (start || end) {
    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;
    const blocks = await prisma.screenAvailabilityBlock.findMany({
      where: {
        OR: [
          // Block starts before requested end and ends after requested start -> overlap
          {
            startTime: { lte: endDate ?? new Date("2100-01-01") },
            endTime: { gte: startDate ?? new Date("1970-01-01") },
          },
        ],
      },
      select: { screenId: true },
    });
    screenIdsToExclude = [...new Set(blocks.map((b) => b.screenId))];
  }

  const finalWhere = screenIdsToExclude.length > 0
    ? { ...where, id: { notIn: screenIdsToExclude } }
    : where;

  const [inventory, myBookingsAgg] = await Promise.all([
    prisma.screen.findMany({
      where: finalWhere,
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
