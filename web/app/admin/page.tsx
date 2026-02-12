"use client";
import { useEffect, useState } from "react";
import { Users, Monitor, Megaphone, DollarSign, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/metrics")
            .then((res) => res.json())
            .then((data) => {
                if (data.stats) setStats(data.stats);
                setLoading(false);
            })
            .catch((err) => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center text-gray-400">
                Loading metrics...
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex h-full items-center justify-center text-red-500">
                Failed to load metrics.
            </div>
        );
    }

    const cards = [
        {
            title: "Total Users",
            value: stats.totalUsers,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            title: "Active Screens",
            value: stats.activeScreens,
            icon: Monitor,
            color: "text-green-500",
            bg: "bg-green-500/10",
        },
        {
            title: "Active Campaigns",
            value: stats.activeCampaigns,
            icon: Megaphone,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        },
        {
            title: "Total Revenue",
            value: `₹${stats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
        },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-white">Platform Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {cards.map((card, idx) => (
                    <div
                        key={idx}
                        className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-gray-700 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${card.bg} ${card.color}`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-gray-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">
                            {card.value}
                        </h3>
                        <p className="text-sm text-gray-400">{card.title}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Placeholder Charts */}
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl h-64 flex flex-col items-center justify-center text-gray-600">
                    <span className="font-mono text-sm">REVENUE CHART</span>
                    <span className="text-xs mt-2">Coming Soon</span>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl h-64 flex flex-col items-center justify-center text-gray-600">
                    <span className="font-mono text-sm">USER GROWTH</span>
                    <span className="text-xs mt-2">Coming Soon</span>
                </div>
            </div>
        </div>
    );
}
