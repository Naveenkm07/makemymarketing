"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ArrowUpRight, Clock, CheckCircle } from "lucide-react";

export default function FinancePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/finance")
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    if (loading) return <div className="text-gray-400">Loading finance data...</div>;
    if (!data) return <div className="text-red-400">Error loading data.</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">Finance Monitor</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
                    <div className="text-gray-400 text-sm mb-1">Total Payouts</div>
                    <div className="text-2xl font-bold text-white">₹{(data.stats?.totalPayouts || 0).toLocaleString()}</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
                    <div className="text-gray-400 text-sm mb-1">Platform Revenue (Commission)</div>
                    <div className="text-2xl font-bold text-green-400">₹{(data.stats?.totalCommission || 0).toLocaleString()}</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
                    <div className="text-gray-400 text-sm mb-1">Pending Payouts</div>
                    <div className="text-2xl font-bold text-yellow-400">{data.stats?.pendingCount || 0}</div>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800 font-semibold text-white">Recent Payouts</div>
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-gray-950 uppercase font-medium">
                        <tr>
                            <th className="px-6 py-3">Owner</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Requested</th>
                            <th className="px-6 py-3 text-right">Reference</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {data.payouts?.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center">No payouts found</td></tr>
                        ) : (
                            data.payouts.map((p: any) => (
                                <tr key={p.id}>
                                    <td className="px-6 py-4">
                                        <div className="text-white">{p.owner?.name}</div>
                                        <div className="text-xs">{p.owner?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-white">
                                        ₹{p.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {p.status === 'paid' ? (
                                            <span className="flex items-center text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded w-fit">
                                                <CheckCircle className="w-3 h-3 mr-1" /> Paid
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-yellow-400 text-xs bg-yellow-500/10 px-2 py-1 rounded w-fit">
                                                <Clock className="w-3 h-3 mr-1" /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {format(new Date(p.created_at), "MMM d, HH:mm")}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-xs text-gray-500">
                                        {p.provider_ref || "-"}
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
