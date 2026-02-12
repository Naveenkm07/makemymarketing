"use client";

import { useEffect, useState } from "react";
import { Check, X, MapPin } from "lucide-react";

type Screen = {
    id: string;
    name: string;
    location: string;
    type: string;
    price_per_day: number;
    is_verified: boolean;
    owner: { name: string; email: string };
    // image_url currently not in type definition, but ideally we show something?
    // We'll skip image for now or use a placeholder if not in DB.
};

export default function ScreensPage() {
    const [screens, setScreens] = useState<Screen[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("pending");

    const fetchScreens = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/screens?filter=${filter}`);
            const data = await res.json();
            if (data.screens) setScreens(data.screens);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScreens();
    }, [filter]);

    const handleAction = async (screenId: string, status: "approve" | "reject") => {
        try {
            const res = await fetch("/api/admin/screens", {
                method: "POST",
                body: JSON.stringify({ screenId, status }),
            });
            if (res.ok) fetchScreens();
        } catch (err) {
            alert("Error processing screen");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Screen Approvals</h1>
                <select
                    className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg text-sm focus:outline-none"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="pending">Pending Review</option>
                    <option value="verified">Verified</option>
                    <option value="all">All Screens</option>
                </select>
            </div>

            {loading ? (
                <div className="text-gray-400 text-center py-10">Loading screens...</div>
            ) : screens.length === 0 ? (
                <div className="text-gray-400 text-center py-10 bg-gray-900 rounded-xl border border-gray-800">
                    No screens found for this filter.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {screens.map(screen => (
                        <div key={screen.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
                            <div className="h-40 bg-gray-800 flex items-center justify-center text-gray-600">
                                {/* Placeholder for screen image */}
                                <span className="text-xs font-mono uppercase">Screen Preview</span>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-white text-lg">{screen.name}</h3>
                                    <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300 capitalize">{screen.type}</span>
                                </div>

                                <div className="flex items-center text-gray-400 text-sm mb-4">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {screen.location || "No Location"}
                                </div>

                                <div className="text-xs text-gray-500 mb-4 border-t border-gray-800 pt-3">
                                    <div className="flex justify-between mb-1">
                                        <span>Owner:</span>
                                        <span className="text-gray-300">{screen.owner?.name || "Unknown"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Price:</span>
                                        <span className="text-gray-300">₹{screen.price_per_day}/day</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {screen.is_verified ? (
                                        <button
                                            onClick={() => handleAction(screen.id, "reject")} // Un-verify
                                            className="w-full py-2 bg-gray-800 text-gray-400 text-xs rounded hover:bg-gray-700 transition"
                                        >
                                            Revoke Approval
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleAction(screen.id, "reject")}
                                                className="flex-1 py-2 border border-red-500/30 text-red-400 text-xs rounded hover:bg-red-500/10 transition flex items-center justify-center"
                                            >
                                                <X className="w-3 h-3 mr-1" /> Reject
                                            </button>
                                            <button
                                                onClick={() => handleAction(screen.id, "approve")}
                                                className="flex-1 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition flex items-center justify-center"
                                            >
                                                <Check className="w-3 h-3 mr-1" /> Approve
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
