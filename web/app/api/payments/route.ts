import { createClient } from "@/lib/supabase/server";
import type { PaymentInsert, PaymentUpdate } from "@/lib/types/database.types";

export const runtime = "nodejs";

// GET /api/payments - Fetch user's payments
export async function GET(req: Request) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });
        }

        // Get booking_id from query params if provided
        const { searchParams } = new URL(req.url);
        const bookingId = searchParams.get('booking_id');

        // Build query
        let query = supabase
            .from("payments")
            .select(`
        *,
        bookings:booking_id (
          id,
          campaign_id,
          screen_id,
          start_time,
          end_time,
          total_price,
          status
        )
      `)
            .order("created_at", { ascending: false });

        if (bookingId) {
            query = query.eq("booking_id", bookingId);
        }

        const { data: payments, error } = await query;

        if (error) {
            console.error("Fetch payments error:", error);
            return Response.json({ ok: false, error: "Failed to load payments" }, { status: 500 });
        }

        return Response.json({ ok: true, payments: payments || [] });

    } catch (error: any) {
        console.error("Payments API error:", error);
        return Response.json({ ok: false, error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/payments - Create new payment
export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });
        }

        // Parse request body
        const body = await req.json();
        const { booking_id, amount, payment_method, transaction_id } = body;

        // Validate required fields
        if (!booking_id || !amount) {
            return Response.json({
                ok: false,
                error: "Booking ID and amount are required"
            }, { status: 400 });
        }

        // Verify the booking belongs to the user's campaign
        const { data: booking, error: bookingError } = await supabase
            .from("bookings")
            .select(`
        id,
        campaign_id,
        campaigns:campaign_id (
          user_id
        )
      `)
            .eq("id", booking_id)
            .single();

        if (bookingError || !booking) {
            return Response.json({
                ok: false,
                error: "Booking not found"
            }, { status: 404 });
        }

        // Check if user owns the campaign
        const campaign = (booking as any).campaigns as any;
        if (campaign?.user_id !== user.id) {
            return Response.json({
                ok: false,
                error: "Unauthorized to create payment for this booking"
            }, { status: 403 });
        }

        // Create payment
        const paymentData: PaymentInsert = {
            booking_id,
            amount: parseFloat(amount),
            status: 'pending',
            payment_method: payment_method || null,
            transaction_id: transaction_id || null,
            paid_at: null
        };

        const { data: payment, error } = await supabase
            .from("payments")
            .insert(paymentData as any)
            .select()
            .single();

        if (error) {
            console.error("Create payment error:", error);
            return Response.json({ ok: false, error: "Failed to create payment" }, { status: 500 });
        }

        return Response.json({
            ok: true,
            payment,
            message: "Payment created successfully"
        });

    } catch (error: any) {
        console.error("Create payment API error:", error);
        return Response.json({ ok: false, error: "Internal server error" }, { status: 500 });
    }
}

// PATCH /api/payments - Update payment status
export async function PATCH(req: Request) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });
        }

        // Parse request body
        const body = await req.json();
        const { payment_id, status, transaction_id } = body;

        if (!payment_id || !status) {
            return Response.json({
                ok: false,
                error: "Payment ID and status are required"
            }, { status: 400 });
        }

        // Prepare update data
        const updateData: PaymentUpdate = {
            status,
            ...(transaction_id && { transaction_id }),
            ...(status === 'completed' && { paid_at: new Date().toISOString() })
        };

        // Update payment
        const { data: payment, error } = await ((supabase
            .from("payments") as any)
            .update(updateData)
            .eq("id", payment_id)
            .select()
            .single());

        if (error) {
            console.error("Update payment error:", error);
            return Response.json({ ok: false, error: "Failed to update payment" }, { status: 500 });
        }

        return Response.json({
            ok: true,
            payment,
            message: "Payment updated successfully"
        });

    } catch (error: any) {
        console.error("Update payment API error:", error);
        return Response.json({ ok: false, error: "Internal server error" }, { status: 500 });
    }
}
