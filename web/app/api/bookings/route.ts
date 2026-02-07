import { prisma } from "@/lib/prisma";
import { publish } from "@/lib/realtimeBus";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    advertiserId: string;
    screenId: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
  };

  const booking = await prisma.booking.create({
    data: {
      advertiserId: body.advertiserId,
      screenId: body.screenId,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      totalPrice: body.totalPrice,
      status: "PENDING",
      paymentStatus: "PENDING",
    },
  });

  publish({ topic: "bookings", type: "booking_created", data: booking });

  return Response.json({ ok: true, booking });
}
