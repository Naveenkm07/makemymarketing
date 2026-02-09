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

  let data: any = {};

  if (user.role === "OWNER") {
    // Owner analytics: revenue per screen, total revenue, bookings per screen
    const [ownerScreens, bookings] = await Promise.all([
      prisma.screen.findMany({ where: { ownerId: userId }, select: { id: true, name: true } }),
      prisma.booking.findMany({
        where: { screen: { ownerId: userId } },
        include: { screen: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const revenueByScreen = ownerScreens.map((screen) => ({
      screenName: screen.name,
      revenue: bookings
        .filter((b) => b.screenId === screen.id)
        .reduce((sum, b) => sum + (b.totalPrice ?? 0), 0),
      bookingsCount: bookings.filter((b) => b.screenId === screen.id).length,
    }));

    const revenueOverTime = bookings.reduce((acc: any[], b) => {
      const day = b.createdAt.toISOString().slice(0, 10);
      const existing = acc.find((item) => item.date === day);
      if (existing) {
        existing.revenue += b.totalPrice ?? 0;
      } else {
        acc.push({ date: day, revenue: b.totalPrice ?? 0 });
      }
      return acc;
    }, []);

    data = {
      role: "OWNER",
      totalRevenue: bookings.reduce((sum, b) => sum + (b.totalPrice ?? 0), 0),
      totalBookings: bookings.length,
      revenueByScreen,
      revenueOverTime: revenueOverTime.sort((a, b) => a.date.localeCompare(b.date)),
    };
  } else if (user.role === "ADVERTISER") {
    // Advertiser analytics: total spend, total bookings, spend over time
    const bookings = await prisma.booking.findMany({
      where: { advertiserId: userId },
      include: { screen: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    const spendOverTime = bookings.reduce((acc: any[], b: any) => {
      const day = b.createdAt.toISOString().slice(0, 10);
      const existing = acc.find((item: any) => item.date === day);
      if (existing) {
        existing.spend += b.totalPrice ?? 0;
      } else {
        acc.push({ date: day, spend: b.totalPrice ?? 0 });
      }
      return acc;
    }, []);

    data = {
      role: "ADVERTISER",
      totalSpend: bookings.reduce((sum: number, b: any) => sum + (b.totalPrice ?? 0), 0),
      totalBookings: bookings.length,
      spendOverTime: spendOverTime.sort((a: any, b: any) => a.date.localeCompare(b.date)),
    };
  }

  return Response.json({ ok: true, data });
}
