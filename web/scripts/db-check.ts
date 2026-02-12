
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load .env.local and .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Env Check:", {
    URL: !!supabaseUrl,
    SERVICE_KEY: !!supabaseKey,
    ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
});

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Env Vars. Keys found:", Object.keys(process.env).filter(k => k.includes("SUPABASE")));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    try {
        console.log("Querying campaigns table...");
        const { data, error } = await supabase.from("campaigns").select("*").limit(1);

        if (error) {
            console.error("Error querying campaigns:", error.message);
            console.error("Full Error:", error);
        } else {
            console.log("Success! Campaigns found:", data);
        }
    } catch (err: any) {
        console.error("Unexpected error:", err.message);
    }
}

check();
