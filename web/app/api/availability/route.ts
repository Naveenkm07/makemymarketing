import { prisma } from "@/lib/prisma";
import { publish } from "@/lib/realtimeBus";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    screenId: string;
    startTime: string;
    endTime: string;
    reason?: string;
  };

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
