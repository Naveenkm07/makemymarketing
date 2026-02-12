import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/payouts/bank - Fetch owner's bank account details
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { data: bank, error } = await supabase
            .from("owner_bank_accounts")
            .select("*")
            .eq("owner_id", user.id)
            .single();

        if (error && error.code !== "PGRST116") { // PGRST116 = no rows returned
            console.error("Bank fetch error:", error);
            // @ts-ignore
            return NextResponse.json({ error: "Failed to fetch bank details" }, { status: 500 });
        }

        return NextResponse.json({ bank: bank || null }); // Return null if not set up
    } catch (error: any) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/payouts/bank - Save or update bank details
export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Role check
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if ((profile as any)?.role !== "owner") {
            return NextResponse.json({ error: "Owner access only" }, { status: 403 });
        }

        const body = await req.json();
        const { bank_name, account_number, ifsc, upi_id } = body;

        if (!bank_name || !account_number || !ifsc) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Mask account number (keep last 4 digits)
        const last4 = account_number.slice(-4);

        // Check if exists
        const { data: existing } = await supabase
            .from("owner_bank_accounts")
            .select("id")
            .eq("owner_id", user.id)
            .single();

        let error;
        if (existing) {
            // Update
            const { error: updateError } = await (supabase
                .from("owner_bank_accounts") as any)
                .update({
                    bank_name,
                    account_last4: last4,
                    ifsc,
                    upi_id,
                    verified: false,
                    updated_at: new Date().toISOString()
                })
                .eq("owner_id", user.id);
            error = updateError;
        } else {
            // Insert
            const { error: insertError } = await (supabase
                .from("owner_bank_accounts") as any)
                .insert({
                    owner_id: user.id,
                    bank_name,
                    account_last4: last4,
                    ifsc,
                    upi_id,
                    verified: false
                });
            error = insertError;
        }

        if (error) {
            console.error("Bank save error:", error);
            return NextResponse.json({ error: "Failed to save bank details" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Bank API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
