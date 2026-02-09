import { getPrisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/session";

export const runtime = "nodejs";

// GET: list chat threads for the current user (advertiser or owner)
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

  const threads = await prisma.chatThread.findMany({
    where: {
      participants: { some: { id: userId } },
    },
    include: {
      participants: { select: { id: true, name: true, companyName: true, role: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true, senderId: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return Response.json({ ok: true, threads });
}

// POST: start a new chat thread (advertiser initiates with a screen owner)
export async function POST(req: Request) {
  const prisma = getPrisma();
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json()) as {
    screenId: string;
    initialMessage?: string;
  };

  // Verify the user is an advertiser and the screen exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADVERTISER") {
    return Response.json({ ok: false, error: "Only advertisers can start chats" }, { status: 403 });
  }

  const screen = await prisma.screen.findUnique({ where: { id: body.screenId } });
  if (!screen) {
    return Response.json({ ok: false, error: "Screen not found" }, { status: 404 });
  }

  // Check if a thread already exists between these users for this screen
  const existing = await prisma.chatThread.findFirst({
    where: {
      participants: { every: { id: { in: [userId, screen.ownerId] } } },
    },
  });
  if (existing) {
    return Response.json({ ok: true, thread: existing });
  }

  // Create new thread
  const thread = await prisma.chatThread.create({
    data: {
      participants: { connect: [{ id: userId }, { id: screen.ownerId }] },
      ...(body.initialMessage
        ? {
            messages: {
              create: {
                senderId: userId,
                content: body.initialMessage,
              },
            },
          }
        : {}),
    },
    include: {
      participants: { select: { id: true, name: true, companyName: true, role: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, content: true, createdAt: true, senderId: true },
      },
    },
  });

  return Response.json({ ok: true, thread });
}
