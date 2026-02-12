import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/stripe/create-checkout — Create Stripe Checkout session for a booking
export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // ─── 1. AUTHENTICATE ───
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        // ─── 2. VERIFY ROLE ───
        const { data: profile } = await supabase
            .from("profiles")
            .select("role, is_blocked")
            .eq("id", user.id)
            .single();

        const profileData = profile as any;
        if (!profileData || profileData.is_blocked) {
            return NextResponse.json(
                { error: "Account blocked or not found" },
                { status: 403 }
            );
        }
        if (profileData.role !== "advertiser") {
            return NextResponse.json(
                { error: "Advertiser access only" },
                { status: 403 }
            );
        }

        // ─── 3. PARSE & VALIDATE REQUEST ───
        const body = await req.json();
        const {
            screenId,
            campaignName,
            startDate,
            endDate,
            creativePath,
        } = body;

        if (!screenId || !campaignName?.trim() || !startDate || !endDate) {
            return NextResponse.json(
                { error: "Missing required fields: screenId, campaignName, startDate, endDate" },
                { status: 400 }
            );
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
            return NextResponse.json(
                { error: "Invalid date range. End date must be after start date." },
                { status: 400 }
            );
        }

        // ─── 4. VALIDATE SCREEN EXISTS & IS AVAILABLE ───
        const { data: screen, error: screenError } = await supabase
            .from("screens")
            .select("id, name, price_per_day, availability, location")
            .eq("id", screenId)
            .single();

        if (screenError || !screen) {
            return NextResponse.json(
                { error: "Screen not found" },
                { status: 404 }
            );
        }

        const screenData = screen as any;
        if (!screenData.availability) {
            return NextResponse.json(
                { error: "Screen is currently unavailable" },
                { status: 400 }
            );
        }

        // ─── 5. CHECK FOR OVERLAPPING BOOKINGS ───
        const { data: overlapping } = await supabase
            .from("bookings")
            .select("id")
            .eq("screen_id", screenId)
            .in("status", ["pending", "booked", "running"])
            .lt("start_time", endDate)
            .gt("end_time", startDate)
            .limit(1);

        if (overlapping && overlapping.length > 0) {
            return NextResponse.json(
                { error: "This screen is already booked for the selected dates" },
                { status: 409 }
            );
        }

        // ─── 6. SERVER-SIDE PRICE CALCULATION ───
        const totalDays = Math.ceil(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );
        const rate = Number(screenData.price_per_day) || 0;
        const totalPrice = rate * totalDays;

        if (totalPrice <= 0) {
            return NextResponse.json(
                { error: "Invalid price calculation" },
                { status: 400 }
            );
        }

        // ─── 7. CREATE CAMPAIGN (pending) ───
        const { data: campaign, error: campaignError } = await supabase
            .from("campaigns")
            .insert({
                user_id: user.id,
                name: campaignName.trim(),
                start_date: startDate,
                end_date: endDate,
                budget: totalPrice,
                status: "draft",
                description: creativePath || null,
            } as any)
            .select()
            .single();

        if (campaignError || !campaign) {
            console.error("Create campaign error:", campaignError?.message);
            return NextResponse.json(
                { error: "Failed to create campaign" },
                { status: 500 }
            );
        }

        const campaignData = campaign as any;

        // ─── 8. CREATE BOOKING (pending) ───
        const { data: booking, error: bookingError } = await supabase
            .from("bookings")
            .insert({
                campaign_id: campaignData.id,
                screen_id: screenId,
                start_time: startDate,
                end_time: endDate,
                total_price: totalPrice,
                status: "pending",
            } as any)
            .select()
            .single();

        if (bookingError || !booking) {
            console.error("Create booking error:", bookingError?.message);
            // Cleanup: delete the campaign we just created
            await supabase.from("campaigns").delete().eq("id", campaignData.id);
            return NextResponse.json(
                { error: "Failed to create booking" },
                { status: 500 }
            );
        }

        const bookingData = booking as any;

        // ─── 9. CREATE STRIPE CHECKOUT SESSION ───
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: `DOOH Booking: ${campaignName.trim()}`,
                            description: `Screen: ${screenData.name} | ${screenData.location} | ${totalDays} day(s)`,
                        },
                        unit_amount: Math.round(totalPrice * 100), // Stripe uses paise
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${appUrl}/dashboard/advertiser/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/dashboard/advertiser/book/${screenId}?cancelled=true`,
            metadata: {
                campaign_id: campaignData.id,
                booking_id: bookingData.id,
                user_id: user.id,
                screen_id: screenId,
            },
        });

        return NextResponse.json({
            checkoutUrl: session.url,
        });
    } catch (error: any) {
        console.error("Stripe checkout error:", error?.message || error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
