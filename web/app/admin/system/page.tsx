"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle, Server, Users, DollarSign } from "lucide-react";

export default function SystemHealthPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchHealth = async () => {
        try {
            const res = await fetch("/api/admin/system");
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        // Poll every 30s
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="text-white p-8">Loading System Health...</div>;
    if (!data) return <div className="text-red-500 p-8">Failed to load system data.</div>;

    const { health, metrics, recentLogs } = data;
    const statusColor = health.status === 'healthy' ? 'text-green-500' : health.status === 'warning' ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">System Status</h1>
                    <div className="flex items-center gap-2">
                        <Activity className={`w-5 h-5 ${statusColor}`} />
                        <span className={`uppercase font-bold ${statusColor}`}>{health.status}</span>
                        <span className="text-gray-500 text-sm ml-4">Last updated: {new Date(health.timestamp).toLocaleTimeString()}</span>
                    </div>
                </div>
                <button
                    onClick={fetchHealth}
                    className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
                >
                    Refresh Now
                </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Active Users */}
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                            <Users className="w-6 h-6 text-blue-500" />
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Total</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{metrics.activeUsers}</div>
                    <div className="text-sm text-gray-400">Registered Accounts</div>
                </div>

                {/* Offline Devices */}
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-lg ${health.offlineDevicesCount > 0 ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                            <Server className={`w-6 h-6 ${health.offlineDevicesCount > 0 ? 'text-red-500' : 'text-green-500'}`} />
                        </div>
                        {health.offlineDevicesCount > 0 && (
                            <span className="text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded animate-pulse">Action Needed</span>
                        )}
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{health.offlineDevicesCount}</div>
                    <div className="text-sm text-gray-400">Offline Devices ({'>'}1h)</div>
                </div>

                {/* DB Latency */}
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-lg">
                            <Activity className="w-6 h-6 text-purple-500" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{metrics.dbLatency}ms</div>
                    <div className="text-sm text-gray-400">Database Latency</div>
                </div>

                {/* Failed Payments */}
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-lg ${health.failedPaymentsCount > 0 ? 'bg-orange-500/10' : 'bg-gray-800'}`}>
                            <AlertTriangle className={`w-6 h-6 ${health.failedPaymentsCount > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{health.failedPaymentsCount}</div>
                    <div className="text-sm text-gray-400">Failed Payments (24h)</div>
                </div>
            </div>

            {/* Recent Logs / Alerts */}
            <h2 className="text-xl font-bold text-white mb-4">System Event Log</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-gray-800 text-gray-200 uppercase font-mono text-xs">
                        <tr>
                            <th className="px-6 py-3">Timestamp</th>
                            <th className="px-6 py-3">Action</th>
                            <th className="px-6 py-3">Details</th>
                            <th className="px-6 py-3">Admin</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {recentLogs?.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-4 text-center">No recent critical events</td></tr>
                        ) : (
                            recentLogs?.map((log: any) => (
                                <tr key={log.id} className="hover:bg-gray-800/50 transition">
                                    <td className="px-6 py-4 font-mono text-xs">{new Date(log.created_at).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-white font-medium">{log.action}</td>
                                    <td className="px-6 py-4 truncate max-w-xs">{JSON.stringify(log.details)}</td>
                                    <td className="px-6 py-4">{log.admin_id}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
