"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { MapPin, Upload, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ScreenDetail = {
    id: string;
    name: string;
    location: string;
    type: string;
    price_per_day: number;
    availability: boolean;
};

import { Suspense } from "react";

function BookingFormContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const screenId = params.screenId as string;
    const wasCancelled = searchParams.get("cancelled") === "true";

    const [screen, setScreen] = useState<ScreenDetail | null>(null);
    const [screenLoading, setScreenLoading] = useState(true);
    const [screenError, setScreenError] = useState<string | null>(null);

    // Form
    const [campaignName, setCampaignName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [creativeFile, setCreativeFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Fetch screen details
    useEffect(() => {
        async function fetchScreen() {
            try {
                const res = await fetch("/api/screens", { cache: "no-store" });
                const json = (await res.json()) as any;
                if (res.ok && json?.ok) {
                    const found = (json.screens || []).find(
                        (s: any) => s.id === screenId
                    );
                    if (found) {
                        setScreen(found);
                    } else {
                        setScreenError("Screen not found");
                    }
                } else {
                    setScreenError("Failed to load screen details");
                }
            } catch {
                setScreenError("Network error");
            } finally {
                setScreenLoading(false);
            }
        }
        void fetchScreen();
    }, [screenId]);

    // Price calculation
    const totalDays =
        startDate && endDate
            ? Math.max(
                1,
                Math.ceil(
                    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
            )
            : 0;
    const totalPrice = screen ? (screen.price_per_day || 0) * totalDays : 0;

    // Creative upload to Supabase Storage
    async function uploadCreative(): Promise<string | null> {
        if (!creativeFile) return null;

        // Validate file type
        const allowed = ["image/jpeg", "image/png", "image/webp", "video/mp4"];
        if (!allowed.includes(creativeFile.type)) {
            setUploadError("Only JPG, PNG, WebP, or MP4 files are allowed.");
            return null;
        }

        // Validate size (50MB max)
        if (creativeFile.size > 50 * 1024 * 1024) {
            setUploadError("File must be under 50MB.");
            return null;
        }

        setUploading(true);
        setUploadError(null);

        try {
            const supabase = createClient();
            const ext = creativeFile.name.split(".").pop() || "bin";
            const filePath = `${screenId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

            const { data, error } = await supabase.storage
                .from("campaign-creatives")
                .upload(filePath, creativeFile, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (error) {
                console.error("Creative upload error:", error.message);
                setUploadError(`Upload failed: ${error.message}`);
                return null;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from("campaign-creatives")
                .getPublicUrl(data.path);

            return urlData.publicUrl;
        } catch {
            setUploadError("Upload failed. Try again.");
            return null;
        } finally {
            setUploading(false);
        }
    }

    // Submit booking
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitError(null);

        if (!campaignName.trim() || !startDate || !endDate) {
            setSubmitError("Please fill in all required fields.");
            return;
        }

        if (new Date(endDate) <= new Date(startDate)) {
            setSubmitError("End date must be after start date.");
            return;
        }

        setSubmitting(true);

        try {
            // Upload creative if provided
            const creativePath = await uploadCreative();

            // Create checkout session
            const res = await fetch("/api/stripe/create-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    screenId,
                    campaignName: campaignName.trim(),
                    startDate,
                    endDate,
                    creativePath,
                }),
            });

            const json = await res.json();

            if (!res.ok) {
                setSubmitError(json?.error || "Failed to create checkout session");
                return;
            }

            if (json.checkoutUrl) {
                // Redirect to Stripe Checkout
                window.location.href = json.checkoutUrl;
            } else {
                setSubmitError("No checkout URL received");
            }
        } catch {
            setSubmitError("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    // Today's date for min attribute
    const today = new Date().toISOString().split("T")[0];

    if (screenLoading) {
        return (
            <div className="max-w-2xl mx-auto animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
                <div className="bg-white rounded-lg border p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-36" />
                    <div className="h-4 bg-gray-200 rounded w-52" />
                    <div className="h-10 bg-gray-200 rounded w-full" />
                    <div className="h-10 bg-gray-200 rounded w-full" />
                    <div className="h-10 bg-gray-200 rounded w-full" />
                </div>
            </div>
        );
    }

    if (screenError || !screen) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
                <p className="text-gray-700 font-medium">
                    {screenError || "Screen not found"}
                </p>
                <button
                    onClick={() => router.push("/dashboard/advertiser/book")}
                    className="mt-4 text-indigo-600 hover:underline text-sm"
                >
                    ← Back to screen selection
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Book Screen</h1>
                <button
                    onClick={() => router.push("/dashboard/advertiser/book")}
                    className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                >
                    ← Change Screen
                </button>
            </div>

            {wasCancelled && (
                <div className="mb-6 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-4 py-3">
                    Payment was cancelled. You can try again below.
                </div>
            )}

            {/* Screen info card */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-900">{screen.name}</h2>
                <div className="flex items-center mt-1 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {screen.location || "Unknown"}
                </div>
                <div className="mt-1 text-xs text-gray-500">{screen.type}</div>
                <div className="mt-2 text-indigo-700 font-bold">
                    ₹{Math.round(screen.price_per_day).toLocaleString("en-IN")}/day
                </div>
            </div>

            {/* Booking form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Campaign Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="My Summer Campaign"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            min={today}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            min={startDate || today}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                </div>

                {/* Price preview */}
                {totalDays > 0 && totalPrice > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Rate per day</span>
                            <span>₹{Math.round(screen.price_per_day).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mt-1">
                            <span>Duration</span>
                            <span>{totalDays} day{totalDays !== 1 ? "s" : ""}</span>
                        </div>
                        <hr className="my-2 border-gray-200" />
                        <div className="flex justify-between text-lg font-bold text-gray-900">
                            <span>Total</span>
                            <span className="text-indigo-600">
                                ₹{Math.round(totalPrice).toLocaleString("en-IN")}
                            </span>
                        </div>
                    </div>
                )}

                {/* Creative upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Creative (optional)
                    </label>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer bg-gray-50 border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                            <Upload className="h-4 w-4" />
                            {creativeFile ? creativeFile.name : "Choose file"}
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp,.mp4"
                                className="hidden"
                                onChange={(e) => setCreativeFile(e.target.files?.[0] || null)}
                            />
                        </label>
                        {creativeFile && (
                            <button
                                type="button"
                                onClick={() => setCreativeFile(null)}
                                className="text-xs text-red-500 hover:text-red-700"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        Supported: JPG, PNG, WebP, MP4. Max 50MB.
                    </p>
                    {uploadError && (
                        <p className="text-xs text-red-600 mt-1">{uploadError}</p>
                    )}
                </div>

                {/* Error */}
                {submitError && (
                    <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{submitError}</span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => router.push("/dashboard/advertiser/book")}
                        className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || uploading || totalPrice <= 0}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-60 font-medium transition-colors"
                    >
                        {submitting
                            ? "Redirecting to payment..."
                            : `Pay ₹${totalPrice > 0 ? Math.round(totalPrice).toLocaleString("en-IN") : "0"}`}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function BookingForm() {
    return (
        <Suspense fallback={<div className="max-w-2xl mx-auto py-12 text-center">Loading booking form...</div>}>
            <BookingFormContent />
        </Suspense>
    );
}
