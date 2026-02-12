"use client";

import { useEffect, useState } from "react";
import { Play, Pause, Ban, Eye } from "lucide-react";
import { format } from "date-fns";

type Campaign = {
    id: string;
    name: string;
    status: string;
    moderation_status: string;
    start_date: string;
    end_date: string;
    budget: number;
    user: { name: string; email: string };
    description: string; // media url
};

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/campaigns");
            const data = await res.json();
            if (data.campaigns) setCampaigns(data.campaigns);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleAction = async (campaignId: string, action: "pause" | "resume" | "cancel") => {
        if (!confirm(`Are you sure you want to ${action} this campaign?`)) return;
        try {
            const res = await fetch("/api/admin/campaigns", {
                method: "POST",
                body: JSON.stringify({ campaignId, action }),
            });
            if (res.ok) fetchCampaigns();
        } catch (err) {
            alert("Error");
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">Campaign Moderation</h1>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-gray-950 text-gray-200 uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">Campaign</th>
                            <th className="px-6 py-4">Advertiser</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Duration</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center">Loading campaigns...</td></tr>
                        ) : campaigns.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center">No campaigns found</td></tr>
                        ) : (
                            campaigns.map(Layout => (
                                <tr key={Layout.id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{Layout.name}</div>
                                        <div className="text-xs flex items-center mt-1">
                                            <a href={Layout.description} target="_blank" className="text-indigo-400 hover:underline flex items-center">
                                                <Eye className="w-3 h-3 mr-1" /> View Creative
                                            </a>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-white">{Layout.user?.name || "Unknown"}</div>
                                        <div className="text-xs">{Layout.user?.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${Layout.status === 'active' && Layout.moderation_status !== 'rejected'
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                : Layout.status === 'cancelled' || Layout.moderation_status === 'rejected'
                                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                            }`}>
                                            {Layout.moderation_status === 'rejected' ? 'PAUSED (ADMIN)' : Layout.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {format(new Date(Layout.start_date), "MMM d")} - {format(new Date(Layout.end_date), "MMM d, yyyy")}
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        {Layout.status !== 'cancelled' && (
                                            <>
                                                {Layout.moderation_status === 'rejected' ? (
                                                    <button
                                                        onClick={() => handleAction(Layout.id, "resume")}
                                                        className="text-xs px-3 py-1.5 rounded border border-green-500/30 text-green-400 hover:bg-green-500/10 flex items-center"
                                                    >
                                                        <Play className="w-3 h-3 mr-1" /> Resume
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAction(Layout.id, "pause")}
                                                        className="text-xs px-3 py-1.5 rounded border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 flex items-center"
                                                    >
                                                        <Pause className="w-3 h-3 mr-1" /> Pause
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleAction(Layout.id, "cancel")}
                                                    className="text-xs px-3 py-1.5 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center"
                                                >
                                                    <Ban className="w-3 h-3 mr-1" /> Cancel
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
