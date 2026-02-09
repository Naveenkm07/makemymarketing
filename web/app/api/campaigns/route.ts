import { getPrisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const prisma = getPrisma();
  const prismaAny = prisma as any;
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

  const campaigns = await prismaAny.campaign.findMany({
    where: { advertiserId: userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      budget: true,
      status: true,
      createdAt: true,
    },
  });

  return Response.json({ ok: true, campaigns });
}

export async function POST(req: Request) {
  const prisma = getPrisma();
  const prismaAny = prisma as any;
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

  const body = (await req.json()) as {
    name?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
  };

  const name = body.name?.trim();
  const budget = Number(body.budget);
  const start = body.startDate ? new Date(body.startDate) : null;
  const end = body.endDate ? new Date(body.endDate) : null;

  if (!name || !Number.isFinite(budget) || budget <= 0 || !start || !end) {
    return Response.json({ ok: false, error: "Missing or invalid fields" }, { status: 400 });
  }

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end.getTime() < start.getTime()) {
    return Response.json({ ok: false, error: "Invalid date range" }, { status: 400 });
  }

  const campaign = await prismaAny.campaign.create({
    data: {
      advertiserId: userId,
      name,
      startDate: start,
      endDate: end,
      budget,
      status: "DRAFT",
    },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      budget: true,
      status: true,
      createdAt: true,
    },
  });

  return Response.json({ ok: true, campaign });
}
