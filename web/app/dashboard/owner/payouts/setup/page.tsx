"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Save, ArrowLeft, ShieldCheck } from "lucide-react";

export default function BankSetup() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [ifsc, setIfsc] = useState("");
    const [upiId, setUpiId] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/payouts/bank");
                const json = await res.json();
                if (res.ok && json.bank) {
                    setBankName(json.bank.bank_name);
                    setAccountNumber("****" + json.bank.account_last4);
                    setIfsc(json.bank.ifsc);
                    setUpiId(json.bank.upi_id || "");
                }
            } catch {
                // ignore error on load
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);

        // Basic validation
        // If account number is masked (starts with ****), meaningful update only if user changed it.
        // For MVP, we send it as is - the backend should handle "starts with ****" logic if needed, 
        // but typically we'd force user to clear it if they want to update.
        // Actually, let's simplistic check:
        if (accountNumber.startsWith("****") && accountNumber.length === 8) {
            // User didn't change it, so we probably shouldn't send it unless strict update needed
            // But backend expects full number to extract last 4. 
            // Let's prompt user if they submit masked number.
            setError("Please enter the full account number to update details.");
            setSaving(false);
            return;
        }

        try {
            const res = await fetch("/api/payouts/bank", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bank_name: bankName,
                    account_number: accountNumber,
                    ifsc,
                    upi_id: upiId
                })
            });

            const json = await res.json();

            if (!res.ok) throw new Error(json.error || "Failed to save");

            router.push("/dashboard/owner/payouts");
            router.refresh();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="p-8 text-center animate-pulse">Loading bank details...</div>;

    return (
        <div className="max-w-xl mx-auto py-8">
            <button
                onClick={() => router.back()}
                className="text-sm text-gray-500 hover:text-gray-900 flex items-center mb-6"
            >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Payouts
            </button>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-50 rounded-full">
                        <Building2 className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Bank Account Details</h1>
                        <p className="text-sm text-gray-500">Securely linked for automated payouts</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bank Name
                        </label>
                        <input
                            type="text"
                            required
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="e.g. HDFC Bank"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account Number
                        </label>
                        <input
                            type="text"
                            required
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder="Enter full account number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {accountNumber.startsWith("****") && (
                            <p className="mt-1 text-xs text-gray-500">Enter new number to update.</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                IFSC Code
                            </label>
                            <input
                                type="text"
                                required
                                value={ifsc}
                                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                                placeholder="HDFC0001234"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                UPI ID (Optional)
                            </label>
                            <input
                                type="text"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="username@bank"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                            <ShieldCheck className="h-4 w-4 text-green-600 mr-1" />
                            Encrypted & Secure
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? "Saving..." : "Save Details"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
