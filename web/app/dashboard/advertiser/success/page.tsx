"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function BookingSuccess() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Small delay for visual feedback, then show success
        const t = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(t);
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="h-16 w-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4" />
                <p className="text-gray-500 text-sm">Confirming your payment...</p>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto text-center py-12">
            {/* Success icon */}
            <div className="mb-6 flex justify-center">
                <div className="bg-green-100 p-4 rounded-full">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Booking Confirmed! 🎉
            </h1>
            <p className="text-gray-600 mb-8">
                Your payment was successful and your campaign is now{" "}
                <span className="font-semibold text-green-600">active</span>. The screen
                owner has been notified.
            </p>

            {sessionId && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 text-left">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                        Payment Reference
                    </div>
                    <div className="text-sm text-gray-700 font-mono break-all">
                        {sessionId}
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3">
                <button
                    onClick={() => router.push("/dashboard/advertiser")}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium flex items-center justify-center gap-2 transition-colors"
                >
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                </button>
                <button
                    onClick={() => router.push("/dashboard/advertiser/book")}
                    className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                    Book Another Screen
                </button>
            </div>
        </div>
    );
}
