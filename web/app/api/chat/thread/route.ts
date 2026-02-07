import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    participantIds: string[];
  };

  const thread = await prisma.chatThread.create({
    data: {
      participants: {
        connect: body.participantIds.map((id) => ({ id })),
      },
    },
    include: { participants: true },
  });

  return Response.json({ ok: true, thread });
}
