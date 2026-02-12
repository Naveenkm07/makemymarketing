"use client";

import { useEffect, useState } from "react";
import { MapPin, Monitor } from "lucide-react";
import { useRouter } from "next/navigation";

type ScreenItem = {
    id: string;
    name: string;
    location: string;
    type: string;
    price_per_day: number;
    availability: boolean;
};

function SkeletonCard() {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-36 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-28 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-20 mb-4" />
            <div className="flex justify-between items-center">
                <div className="h-5 bg-gray-200 rounded w-24" />
                <div className="h-9 bg-gray-200 rounded w-28" />
            </div>
        </div>
    );
}

export default function BookScreenSelection() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [screens, setScreens] = useState<ScreenItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadScreens() {
            try {
                const res = await fetch("/api/screens", { cache: "no-store" });
                const json = (await res.json()) as any;
                if (res.ok && json?.ok) {
                    setScreens(json.screens || []);
                } else {
                    setError(json?.error || "Failed to load screens");
                }
            } catch {
                setError("Network error loading screens");
            } finally {
                setLoading(false);
            }
        }
        void loadScreens();
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Book a Screen</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Select a screen to start your campaign booking
                    </p>
                </div>
                <button
                    onClick={() => router.push("/dashboard/advertiser")}
                    className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                >
                    ← Back to Dashboard
                </button>
            </div>

            {error && !loading ? (
                <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3">
                    ⚠️ {error}
                </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : screens.length > 0 ? (
                    screens.map((s) => (
                        <div
                            key={s.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <h3 className="text-lg font-semibold text-gray-900">{s.name}</h3>
                            <div className="flex items-center mt-2 text-sm text-gray-500">
                                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                                {s.location || "Unknown location"}
                            </div>
                            <div className="mt-1 text-xs text-gray-400">{s.type || "Digital"}</div>

                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-indigo-600 font-bold text-lg">
                                    ₹{Math.round(s.price_per_day).toLocaleString("en-IN")}
                                    <span className="text-gray-400 font-normal text-xs">/day</span>
                                </span>
                                <button
                                    onClick={() => router.push(`/dashboard/advertiser/book/${s.id}`)}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors"
                                >
                                    Select Screen
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center">
                        <Monitor className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No screens available at the moment.</p>
                        <p className="text-xs text-gray-400 mt-1">
                            Check back later or contact support.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
