import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendEmail, EmailTemplates } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Disable Next.js body parsing — Stripe needs the raw body for signature verification
export const config = {
    api: {
        bodyParser: false,
    },
};

// POST /api/stripe/webhook — Handle Stripe webhook events
export async function POST(req: Request) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error("Stripe webhook: STRIPE_WEBHOOK_SECRET not configured");
        return NextResponse.json(
            { error: "Webhook not configured" },
            { status: 500 }
        );
    }

    // ─── 1. VERIFY SIGNATURE ───
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json(
            { error: "Missing stripe-signature header" },
            { status: 400 }
        );
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error("Stripe webhook signature error:", err.message);
        return NextResponse.json(
            { error: `Webhook signature verification failed: ${err.message}` },
            { status: 400 }
        );
    }

    // ─── 2. HANDLE checkout.session.completed ───
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const metadata = session.metadata;

        if (!metadata?.campaign_id || !metadata?.booking_id) {
            console.error("Stripe webhook: missing metadata", metadata);
            return NextResponse.json(
                { error: "Missing metadata" },
                { status: 400 }
            );
        }

        const { campaign_id, booking_id, user_id } = metadata;

        // Use service role client for webhook (no user session available)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error("Stripe webhook: Supabase config missing");
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        try {
            // Update campaign → active
            const { error: campaignError } = await (supabase
                .from("campaigns") as any)
                .update({ status: "active" })
                .eq("id", campaign_id);

            if (campaignError) {
                console.error("Webhook: campaign update error", campaignError.message);
            }

            // Update booking → booked
            const { error: bookingError } = await (supabase
                .from("bookings") as any)
                .update({ status: "booked" })
                .eq("id", booking_id);

            if (bookingError) {
                console.error("Webhook: booking update error", bookingError.message);
            }

            // Insert payment record
            const amountTotal = session.amount_total
                ? session.amount_total / 100 // Convert from paise to rupees
                : 0;

            const { error: paymentError } = await supabase
                .from("payments")
                .insert({
                    booking_id,
                    amount: amountTotal,
                    status: "completed",
                    payment_method: "stripe",
                    transaction_id: session.payment_intent as string || session.id,
                    paid_at: new Date().toISOString(),
                } as any);

            if (paymentError) {
                console.error("Webhook: payment insert error", paymentError.message);
            }

            console.log(
                `✅ Webhook: Payment confirmed for campaign ${campaign_id}, booking ${booking_id}, amount ₹${amountTotal}`
            );

            // Send Email Notification
            try {
                const { data: bookingData } = await (supabase
                    .from("bookings") as any)
                    .select("*, screen:screens(name)")
                    .eq("id", booking_id)
                    .single();

                const userEmail = session.customer_details?.email || session.customer_email;

                if (bookingData && userEmail) {
                    await sendEmail({
                        to: userEmail,
                        subject: "Booking Confirmed - Make My Marketing",
                        html: EmailTemplates.bookingConfirmation(
                            booking_id,
                            amountTotal,
                            bookingData.screen?.name || "Unknown Screen"
                        )
                    });
                }
            } catch (emailErr) {
                console.error("Failed to send booking email:", emailErr);
            }
        } catch (dbError: any) {
            console.error("Webhook: DB update error", dbError?.message);
            // Return 200 anyway — Stripe will retry on 5xx
            return NextResponse.json({ success: true, warning: "Partial update" });
        }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ success: true });
}
