import { getPrisma } from "@/lib/prisma";
import { publish } from "@/lib/realtimeBus";
import { getUserIdFromRequest } from "@/lib/session";

export const runtime = "nodejs";

// GET: fetch availability blocks for a screen (owner or advertiser)
export async function GET(req: Request) {
  const prisma = getPrisma();
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const url = new URL(req.url);
  const screenId = url.searchParams.get("screenId");
  if (!screenId) {
    return Response.json({ ok: false, error: "screenId required" }, { status: 400 });
  }

  // Verify user owns the screen or is an advertiser (read-only access)
  const screen = await prisma.screen.findUnique({ where: { id: screenId } });
  if (!screen) {
    return Response.json({ ok: false, error: "Screen not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return Response.json({ ok: false, error: "Invalid session" }, { status: 401 });
  }

  if (screen.ownerId !== userId && user.role !== "ADVERTISER") {
    return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const blocks = await prisma.screenAvailabilityBlock.findMany({
    where: { screenId },
    orderBy: { startTime: "asc" },
  });

  return Response.json({ ok: true, blocks });
}

// POST: add an availability block (owner only)
export async function POST(req: Request) {
  const prisma = getPrisma();
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json()) as {
    screenId: string;
    startTime: string;
    endTime: string;
    reason?: string;
  };

  // Verify user owns the screen
  const screen = await prisma.screen.findUnique({ where: { id: body.screenId } });
  if (!screen || screen.ownerId !== userId) {
    return Response.json({ ok: false, error: "Screen not found or forbidden" }, { status: 404 });
  }

  const block = await prisma.screenAvailabilityBlock.create({
    data: {
      screenId: body.screenId,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      reason: body.reason,
    },
  });

  publish({ topic: "availability", type: "availability_block_created", data: block });

  return Response.json({ ok: true, block });
}

// DELETE: remove an availability block (owner only)
export async function DELETE(req: Request) {
  const prisma = getPrisma();
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const url = new URL(req.url);
  const blockId = url.searchParams.get("blockId");
  if (!blockId) {
    return Response.json({ ok: false, error: "blockId required" }, { status: 400 });
  }

  const block = await prisma.screenAvailabilityBlock.findUnique({ where: { id: blockId } });
  if (!block) {
    return Response.json({ ok: false, error: "Availability block not found" }, { status: 404 });
  }

  // Verify user owns the screen
  const screen = await prisma.screen.findUnique({ where: { id: block.screenId } });
  if (!screen || screen.ownerId !== userId) {
    return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  await prisma.screenAvailabilityBlock.delete({ where: { id: blockId } });

  publish({ topic: "availability", type: "availability_block_deleted", data: { blockId } });

  return Response.json({ ok: true });
}
