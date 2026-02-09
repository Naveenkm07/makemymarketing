import { getPrisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/session";
import { publish } from "@/lib/realtimeBus";

export const runtime = "nodejs";

// GET: list messages for a thread
export async function GET(req: Request) {
  const prisma = getPrisma();
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const url = new URL(req.url);
  const threadId = url.searchParams.get("threadId");
  if (!threadId) {
    return Response.json({ ok: false, error: "threadId required" }, { status: 400 });
  }

  // Verify user is a participant in the thread
  const thread = await prisma.chatThread.findFirst({
    where: { id: threadId, participants: { some: { id: userId } } },
  });
  if (!thread) {
    return Response.json({ ok: false, error: "Thread not found or forbidden" }, { status: 404 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
    select: { id: true, content: true, createdAt: true, senderId: true },
  });

  return Response.json({ ok: true, messages });
}

// POST: send a message in a thread
export async function POST(req: Request) {
  const prisma = getPrisma();
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json()) as {
    threadId: string;
    content: string;
  };

  // Verify user is a participant in the thread
  const thread = await prisma.chatThread.findFirst({
    where: { id: body.threadId, participants: { some: { id: userId } } },
  });
  if (!thread) {
    return Response.json({ ok: false, error: "Thread not found or forbidden" }, { status: 404 });
  }

  const message = await prisma.chatMessage.create({
    data: {
      threadId: body.threadId,
      senderId: userId,
      content: body.content,
    },
    select: { id: true, content: true, createdAt: true, senderId: true },
  });

  // Update thread updatedAt
  await prisma.chatThread.update({
    where: { id: body.threadId },
    data: { updatedAt: new Date() },
  });

  // Publish realtime update
  publish({ topic: "chat", type: "new_message", data: { threadId: body.threadId, message } });

  return Response.json({ ok: true, message });
}
