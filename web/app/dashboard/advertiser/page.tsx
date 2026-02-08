"use client";

import { MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type InventoryItem = {
  id: string;
  name: string;
  location: string;
  type: string;
  pricePerSlot: number;
  owner: {
    id: string;
    name: string | null;
    companyName: string | null;
  };
};

type AdvertiserDashboardResponse = {
  ok: true;
  stats: {
    totalBookings: number;
    totalSpend: number;
  };
  inventory: InventoryItem[];
};

export default function AdvertiserDashboard() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdvertiserDashboardResponse | null>(null);

  async function load(query: string) {
    setError(null);
    try {
      const url = query.trim()
        ? `/api/dashboard/advertiser?q=${encodeURIComponent(query.trim())}`
        : "/api/dashboard/advertiser";
      const res = await fetch(url, { cache: "no-store" });
      const json = (await res.json()) as any;
      if (!res.ok || !json?.ok) {
        setError(json?.error ?? "Failed to load dashboard");
        setData(null);
        return;
      }
      setData(json as AdvertiserDashboardResponse);
    } catch {
      setError("Failed to load dashboard");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      void load(q);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    void load("");
  }, []);

  useEffect(() => {
    const es = new EventSource("/api/realtime?topics=bookings,availability");
    const onEvt = () => {
      void load(q);
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
  }, [q]);

  const inventory = useMemo(() => data?.inventory ?? [], [data]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Advertiser Dashboard</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          Create New Campaign
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Find Screens</h2>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search by location (e.g. Koramangala)"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Filters
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      ) : null}

      <h2 className="text-lg font-medium text-gray-900 mb-4">Available Inventory</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-sm text-gray-500">Loading...</div>
        ) : inventory.length > 0 ? (
          inventory.map((s) => (
            <div key={s.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Screen Image Preview</span>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">{s.name}</h3>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {s.location}
                </div>
                <div className="mt-2 text-xs text-gray-500">{s.type}</div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-indigo-600 font-bold">
                    ₹{Math.round(s.pricePerSlot).toLocaleString("en-IN")}
                    <span className="text-gray-500 font-normal text-xs">/slot</span>
                  </span>
                  <button className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md hover:bg-indigo-100">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-sm text-gray-500">No screens found.</div>
        )}
      </div>
    </div>
  );
}
