import { getPrisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
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

  const body = (await req.json()) as {
    name?: string;
    location?: string;
    type?: string;
    pricePerSlot?: number;
    dimension?: string;
    supportedFormats?: string;
  };

  const name = body.name?.trim();
  const location = body.location?.trim();
  const type = body.type?.trim();
  const pricePerSlot = Number(body.pricePerSlot);

  if (!name || !location || !type || !Number.isFinite(pricePerSlot) || pricePerSlot <= 0) {
    return Response.json({ ok: false, error: "Missing or invalid fields" }, { status: 400 });
  }

  const screen = await prisma.screen.create({
    data: {
      name,
      location,
      type,
      pricePerSlot,
      dimension: body.dimension?.trim() || null,
      supportedFormats: body.supportedFormats?.trim() || null,
      ownerId: userId,
    },
    select: {
      id: true,
      name: true,
      location: true,
      type: true,
      pricePerSlot: true,
      createdAt: true,
    },
  });

  return Response.json({ ok: true, screen });
}

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
