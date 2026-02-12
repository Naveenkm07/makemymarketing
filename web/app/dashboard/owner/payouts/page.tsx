"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Building2,
    CreditCard,
    History,
    Wallet,
    AlertCircle,
    CheckCircle2,
    ArrowRight
} from "lucide-react";

type PayoutStat = {
    availableBalance: number;
    totalPaid: number;
    commissionPaid: number;
    totalPayouts: number;
};

type PayoutRecord = {
    id: string;
    amount: number;
    commission: number;
    net_amount: number;
    status: "pending" | "processing" | "paid" | "failed";
    period_start: string;
    period_end: string;
    paid_at: string | null;
    provider_ref: string | null;
    created_at: string;
};

type BankStatus = {
    setup: boolean;
    verified: boolean;
    details: string | null;
};

function SkeletonCard() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-32" />
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "paid": return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Paid</span>;
        case "pending": return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Pending</span>;
        case "processing": return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Processing</span>;
        case "failed": return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Failed</span>;
        default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">{status}</span>;
    }
}

export default function PayoutDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<PayoutStat | null>(null);
    const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
    const [bank, setBank] = useState<BankStatus | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/payouts/dashboard", { cache: "no-store" });
                const json = await res.json();

                if (res.ok) {
                    setStats(json.stats);
                    setPayouts(json.payouts || []);
                    setBank(json.bankStatus);
                } else {
                    setError(json.error || "Failed to load dashboard");
                }
            } catch {
                setError("Network error");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    async function triggerCalculation() {
        // For MVP demo: trigger calculation manually
        try {
            await fetch("/api/payouts/calculate", { method: "POST" });
            window.location.reload();
        } catch {
            alert("Failed to calculate earnings");
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payouts & Earnings</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Track your revenue, history, and manage bank details
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Admin/Debug trigger */}
                    <button
                        onClick={triggerCalculation}
                        className="text-xs text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded border border-indigo-200"
                    >
                        Check for New Earnings
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Balance Card */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Available Balance</p>
                                <div className="mt-2 text-3xl font-bold text-gray-900">
                                    ₹{stats?.availableBalance.toLocaleString("en-IN") ?? 0}
                                </div>
                            </div>
                            <div className="p-3 bg-indigo-100 rounded-full">
                                <Wallet className="h-6 w-6 text-indigo-600" />
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-gray-500">
                            Pending payout processing
                        </div>
                    </div>

                    {/* Paid Card */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Paid Out</p>
                                <div className="mt-2 text-2xl font-bold text-gray-900">
                                    ₹{stats?.totalPaid.toLocaleString("en-IN") ?? 0}
                                </div>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    {/* Commission Card */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Platform Fees</p>
                                <div className="mt-2 text-2xl font-bold text-gray-900">
                                    ₹{stats?.commissionPaid.toLocaleString("en-IN") ?? 0}
                                </div>
                            </div>
                            <div className="p-3 bg-gray-100 rounded-full">
                                <Building2 className="h-6 w-6 text-gray-600" />
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-gray-500">
                            15% commission rate
                        </div>
                    </div>
                </div>
            )}

            {/* Bank Account Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-full">
                            <CreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Bank Account</h3>
                            {loading ? (
                                <div className="h-4 bg-gray-200 rounded w-32 mt-1" />
                            ) : bank?.setup ? (
                                <p className="text-sm text-gray-600 mt-1">
                                    {bank.details}
                                    {bank.verified ? (
                                        <span className="ml-2 text-green-600 text-xs bg-green-50 px-2 py-0.5 rounded-full">Verified</span>
                                    ) : (
                                        <span className="ml-2 text-yellow-600 text-xs bg-yellow-50 px-2 py-0.5 rounded-full">Verification Pending</span>
                                    )}
                                </p>
                            ) : (
                                <p className="text-sm text-gray-500 mt-1">No bank account linked yet</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => router.push("/dashboard/owner/payouts/setup")}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                        {bank?.setup ? "Manage Details" : "Setup Bank Account"}
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Payout History */}
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <History className="h-5 w-5 text-gray-500" />
                Payout History
            </h2>

            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {loading ? (
                            [1, 2, 3].map((i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                                </tr>
                            ))
                        ) : payouts.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    No payouts yet. Your earnings will appear here.
                                </td>
                            </tr>
                        ) : (
                            payouts.map((p) => (
                                <tr key={p.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(p.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">₹{p.net_amount.toLocaleString("en-IN")}</div>
                                        <div className="text-xs text-gray-500">Gross: ₹{p.amount.toLocaleString("en-IN")}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={p.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                        {p.provider_ref || "—"}
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
