import { prisma } from "@/lib/prisma";
import { publish } from "@/lib/realtimeBus";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    threadId: string;
    senderId: string;
    content: string;
  };

  const message = await prisma.chatMessage.create({
    data: {
      threadId: body.threadId,
      senderId: body.senderId,
      content: body.content,
    },
  });

  publish({ topic: "chat", type: "message_created", data: message });

  return Response.json({ ok: true, message });
}
