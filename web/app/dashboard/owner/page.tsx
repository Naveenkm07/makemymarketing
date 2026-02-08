"use client";

import { Plus, BarChart, Monitor } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type OwnerScreenRow = {
  id: string;
  name: string;
  location: string;
  type: string;
  pricePerSlot: number;
  createdAt: string;
};

type OwnerDashboardResponse = {
  ok: true;
  stats: {
    totalRevenue: number;
    activeScreens: number;
  };
  screens: OwnerScreenRow[];
};

export default function OwnerDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OwnerDashboardResponse | null>(null);

  async function load() {
    setError(null);
    try {
      const res = await fetch("/api/dashboard/owner", { cache: "no-store" });
      const json = (await res.json()) as any;
      if (!res.ok || !json?.ok) {
        setError(json?.error ?? "Failed to load dashboard");
        setData(null);
        return;
      }
      setData(json as OwnerDashboardResponse);
    } catch {
      setError("Failed to load dashboard");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const es = new EventSource("/api/realtime?topics=bookings,availability");
    const onEvt = () => {
      void load();
    };
    es.addEventListener("bookings", onEvt);
    es.addEventListener("availability", onEvt);
    return () => {
      try {
        es.close();
      } catch {
        // ignore
      }
    };
  }, []);

  const totalRevenue = useMemo(() => {
    const v = data?.stats.totalRevenue ?? 0;
    return v;
  }, [data]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center">
          <Plus className="mr-2 h-5 w-5" />
          Add New Screen
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? "—" : `₹${Math.round(totalRevenue).toLocaleString("en-IN")}`}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <BarChart className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Screens</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? "—" : (data?.stats.activeScreens ?? 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Monitor className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      ) : null}

      <h2 className="text-lg font-medium text-gray-900 mb-4">My Screens</h2>
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Screen Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td className="px-6 py-6 text-sm text-gray-500" colSpan={4}>
                  Loading...
                </td>
              </tr>
            ) : data && data.screens.length > 0 ? (
              data.screens.map((s) => (
                <tr key={s.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {s.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {s.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{Math.round(s.pricePerSlot).toLocaleString("en-IN")}/slot
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-6 text-sm text-gray-500" colSpan={4}>
                  No screens yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
