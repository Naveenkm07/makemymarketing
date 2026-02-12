"use client";

import { Search, MapPin, BarChart3, IndianRupee, Megaphone } from "lucide-react";
import { useEffect, useState } from "react";

// Matches /api/advertiser/dashboard response format
type CampaignRow = {
  id: string;
  name: string;
  status: string;
  budget: number;
  start_date: string | null;
  end_date: string | null;
};

type AvailableScreenRow = {
  id: string;
  screen_name: string;
  location: string;
  rate: number;
  screen_type: string;
};

type AdvertiserDashboardResponse = {
  totalCampaigns: number;
  totalBookings: number;
  totalSpend: number;
  campaigns: CampaignRow[];
  availableScreens: AvailableScreenRow[];
};

// Legacy type for booking modal (still uses /api/screens)
type InventoryItem = {
  id: string;
  name: string;
  location: string;
  type: string;
  pricePerSlot: number;
  owner: { id: string; name: string | null; companyName: string | null };
};

// Skeleton components
function SkeletonCard() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-8 bg-gray-200 rounded w-32" />
        </div>
        <div className="h-12 w-12 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
      <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded-full w-16" /></td>
    </tr>
  );
}

function SkeletonScreenCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-36 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-28 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-20 mb-4" />
      <div className="flex justify-between items-center">
        <div className="h-5 bg-gray-200 rounded w-24" />
        <div className="h-8 bg-gray-200 rounded w-20" />
      </div>
    </div>
  );
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "active": return "bg-green-100 text-green-800";
    case "completed": return "bg-blue-100 text-blue-800";
    case "cancelled": return "bg-red-100 text-red-800";
    default: return "bg-yellow-100 text-yellow-800";
  }
}

export default function AdvertiserDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdvertiserDashboardResponse | null>(null);
  const [q, setQ] = useState("");

  const [campaignError, setCampaignError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");

  const [showBook, setShowBook] = useState(false);
  const [bookingScreen, setBookingScreen] = useState<InventoryItem | null>(null);
  const [bookingStart, setBookingStart] = useState("");
  const [bookingEnd, setBookingEnd] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string | null; role: string } | null>(null);
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  const [showChat, setShowChat] = useState(false);
  const [chatThreads, setChatThreads] = useState<any[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatMessageInput, setChatMessageInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/advertiser/dashboard", { cache: "no-store" });

      if (res.status === 401 || res.status === 403) {
        console.warn("Advertiser dashboard: not authorized");
        setData(null);
        return;
      }

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        console.error("Advertiser dashboard API error:", json?.error);
        setError(json?.error || "Failed to load dashboard");
        return;
      }

      const json = (await res.json()) as AdvertiserDashboardResponse;
      setData(json);
    } catch (err) {
      console.error("Advertiser dashboard load error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  // loadCampaigns is no longer needed — unified into load() via /api/advertiser/dashboard

  async function loadCurrentUser() {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const json = (await res.json()) as any;
      if (res.ok && json?.ok) {
        setCurrentUser(json.user);
      }
    } catch {
      // ignore
    }
  }

  async function loadChatThreads() {
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat/threads", { cache: "no-store" });
      const json = (await res.json()) as any;
      if (res.ok && json?.ok) {
        setChatThreads(json.threads ?? []);
      } else {
        setChatThreads([]);
      }
    } catch {
      setChatThreads([]);
    } finally {
      setChatLoading(false);
    }
  }

  async function openChatThread(threadId: string) {
    setSelectedThreadId(threadId);
    setChatMessages([]);
    try {
      const res = await fetch(`/api/messages?threadId=${encodeURIComponent(threadId)}`, { cache: "no-store" });
      const json = (await res.json()) as any;
      if (res.ok && json?.ok) {
        setChatMessages(json.messages ?? []);
      }
    } catch {
      setChatMessages([]);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedThreadId || !chatMessageInput.trim()) return;
    setSendingMessage(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: selectedThreadId,
          content: chatMessageInput.trim(),
        }),
      });
      const json = (await res.json()) as any;
      if (res.ok && json?.ok) {
        setChatMessageInput("");
        await openChatThread(selectedThreadId);
        await loadChatThreads();
      } else {
        setCampaignError(json?.error ?? "Failed to send message");
      }
    } catch {
      setCampaignError("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  }

  async function startChatWithOwner(screenId: string) {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/chat/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          screenId,
          initialMessage: "Hi, I’m interested in this screen.",
        }),
      });
      const json = (await res.json()) as any;
      if (res.ok && json?.ok) {
        await loadChatThreads();
        setSelectedThreadId(json.thread.id);
        await openChatThread(json.thread.id);
        setShowChat(true);
      } else {
        setCampaignError(json?.error ?? "Failed to start chat");
      }
    } catch {
      setCampaignError("Failed to start chat");
    }
  }

  async function loadAnalytics() {
    setAnalyticsLoading(true);
    try {
      const res = await fetch("/api/analytics", { cache: "no-store" });
      const json = (await res.json()) as any;
      if (res.ok && json?.ok) {
        setAnalytics(json.data);
      } else {
        setAnalytics(null);
      }
    } catch {
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  }

  async function createCampaign(e: React.FormEvent) {
    e.preventDefault();
    setCampaignError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campaignName,
          startDate,
          endDate,
          budget: Number(budget),
        }),
      });
      const json = (await res.json()) as any;
      if (!res.ok || !json?.ok) {
        setCampaignError(json?.error ?? "Failed to create campaign");
        return;
      }

      setShowCreate(false);
      setCampaignName("");
      setStartDate("");
      setEndDate("");
      setBudget("");
      await load();
    } catch {
      setCampaignError("Failed to create campaign");
    } finally {
      setCreating(false);
    }
  }

  function openBooking(screen: InventoryItem) {
    setBookingScreen(screen);
    setBookingStart("");
    setBookingEnd("");
    setShowBook(true);
  }

  async function submitBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingScreen || !currentUser) return;
    setCampaignError(null);
    setBookingLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advertiserId: currentUser.id,
          screenId: bookingScreen.id,
          startTime: bookingStart,
          endTime: bookingEnd,
          totalPrice: bookingScreen.pricePerSlot,
        }),
      });
      const json = (await res.json()) as any;
      if (!res.ok || !json?.ok) {
        setCampaignError(json?.error ?? "Failed to book screen");
        return;
      }

      setShowBook(false);
      setBookingScreen(null);
      setBookingStart("");
      setBookingEnd("");
    } catch {
      setCampaignError("Failed to book screen");
    } finally {
      setBookingLoading(false);
    }
  }

  useEffect(() => {
    void load();
    void loadCurrentUser();
    void loadChatThreads();
    void loadScreens();
  }, []);

  useEffect(() => {
    const es = new EventSource("/api/realtime?topics=bookings,availability,chat");
    const onEvt = () => {
      void load();
      void loadChatThreads();
    };
    es.addEventListener("bookings", onEvt);
    es.addEventListener("availability", onEvt);
    es.addEventListener("chat", onEvt);
    return () => {
      try {
        es.close();
      } catch {
        // ignore
      }
    };
  }, []);

  async function loadScreens() {
    try {
      const screensRes = await fetch("/api/screens", { cache: "no-store" });
      const screensJson = (await screensRes.json()) as any;
      if (screensRes.ok && screensJson?.ok) {
        setInventory(screensJson.screens || []);
      } else {
        setInventory([]);
      }
    } catch {
      setInventory([]);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Advertiser Dashboard</h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowAnalytics(true);
              void loadAnalytics();
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"
          >
            Analytics
          </button>
          <button
            onClick={() => setShowChat(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
          >
            Chat
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
          >
            Create New Campaign
          </button>
        </div>
      </div>

      {showCreate ? (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Create Campaign</h2>
            <button
              onClick={() => setShowCreate(false)}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
              type="button"
            >
              Close
            </button>
          </div>

          <form onSubmit={createCampaign} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Campaign name</label>
              <input
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Launch Week Offer"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Start date</label>
              <input
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                type="date"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">End date</label>
              <input
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                type="date"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Budget (₹)</label>
              <input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                type="number"
                min={1}
                step="1"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="50000"
                required
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create Campaign"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {campaignError && (
        <div className="mb-4 bg-red-50 text-red-700 p-4 rounded-lg text-sm">
          {campaignError}
        </div>
      )}

      {showBook && bookingScreen ? (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Book Screen</h2>
            <button
              onClick={() => setShowBook(false)}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
              type="button"
            >
              Close
            </button>
          </div>

          <div className="mt-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900">Screen: {bookingScreen.name}</p>
              <p className="text-sm text-gray-500">{bookingScreen.location}</p>
              <p className="text-sm text-gray-500">Rate: ₹{Math.round(bookingScreen.pricePerSlot).toLocaleString("en-IN")}/slot</p>
            </div>

            <form onSubmit={submitBooking} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date & Time</label>
                <input
                  value={bookingStart}
                  onChange={(e) => setBookingStart(e.target.value)}
                  type="datetime-local"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">End Date & Time</label>
                <input
                  value={bookingEnd}
                  onChange={(e) => setBookingEnd(e.target.value)}
                  type="datetime-local"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBook(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-60"
                >
                  {bookingLoading ? "Booking..." : "Book Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showChat && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Messages</h2>
            <button
              onClick={() => setShowChat(false)}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
              type="button"
            >
              Close
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Conversations</h3>
              {chatLoading ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : chatThreads.length === 0 ? (
                <div className="text-sm text-gray-500">No conversations yet.</div>
              ) : (
                <ul className="space-y-2">
                  {chatThreads.map((thread) => (
                    <li key={thread.id}>
                      <button
                        onClick={() => void openChatThread(thread.id)}
                        className={`w-full text-left p-2 rounded border ${selectedThreadId === thread.id
                          ? "bg-indigo-50 border-indigo-300"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          }`}
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {thread.participants.find((p: any) => p.id !== currentUser?.id)?.name ||
                            thread.participants.find((p: any) => p.id !== currentUser?.id)?.companyName}
                        </div>
                        {thread.messages[0] && (
                          <div className="text-xs text-gray-500 truncate">
                            {thread.messages[0].content}
                          </div>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="md:col-span-2">
              {selectedThreadId ? (
                <>
                  <div className="border rounded p-4 h-64 overflow-y-auto bg-gray-50 mb-3">
                    {chatMessages.length === 0 ? (
                      <div className="text-sm text-gray-500">No messages yet.</div>
                    ) : (
                      <ul className="space-y-2">
                        {chatMessages.map((msg) => (
                          <li
                            key={msg.id}
                            className={`text-sm ${msg.senderId === currentUser?.id ? "text-right" : "text-left"
                              }`}
                          >
                            <div
                              className={`inline-block px-3 py-2 rounded-lg ${msg.senderId === currentUser?.id
                                ? "bg-indigo-100 text-indigo-900"
                                : "bg-white text-gray-900"
                                }`}
                            >
                              {msg.content}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <form onSubmit={sendMessage} className="flex gap-2">
                    <input
                      value={chatMessageInput}
                      onChange={(e) => setChatMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <button
                      type="submit"
                      disabled={sendingMessage}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-60"
                    >
                      {sendingMessage ? "Sending..." : "Send"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-sm text-gray-500">Select a conversation to view messages.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {showAnalytics && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Analytics</h2>
            <button
              onClick={() => setShowAnalytics(false)}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
              type="button"
            >
              Close
            </button>
          </div>

          {analyticsLoading ? (
            <div className="text-sm text-gray-500">Loading analytics...</div>
          ) : analytics ? (
            <div className="mt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm font-medium text-gray-500">Total Spend</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{Math.round(analytics.totalSpend).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalBookings}</p>
                </div>
              </div>

              {analytics.spendOverTime && analytics.spendOverTime.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Spend Over Time</h3>
                  <div className="h-40 bg-gray-50 rounded p-2">
                    <svg viewBox="0 0 400 100" className="w-full h-full">
                      {analytics.spendOverTime.map((item: any, i: number) => {
                        const max = Math.max(...analytics.spendOverTime.map((d: any) => d.spend));
                        const x = (i / (analytics.spendOverTime.length - 1)) * 380 + 10;
                        const y = 90 - (item.spend / max) * 70;
                        return (
                          <g key={i}>
                            <circle cx={x} cy={y} r={3} fill="#6366f1" />
                            {i > 0 && (
                              <line
                                x1={(i - 1) / (analytics.spendOverTime.length - 1) * 380 + 10}
                                y1={90 - (analytics.spendOverTime[i - 1].spend / max) * 70}
                                x2={x}
                                y2={y}
                                stroke="#6366f1"
                                strokeWidth={2}
                              />
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No analytics data available.</div>
          )}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Find Screens</h2>
        <div className="flex flex-col gap-4 mb-4 md:flex-row md:gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by location, screen name, or type..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Available From</label>
            <input
              type="datetime-local"
              value={filterStart}
              onChange={(e) => setFilterStart(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Available Until</label>
            <input
              type="datetime-local"
              value={filterEnd}
              onChange={(e) => setFilterEnd(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* ─── ERROR BANNER ─── */}
      {error && !loading ? (
        <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
          <button onClick={() => void load()} className="ml-auto text-red-600 hover:text-red-800 underline text-xs">
            Retry
          </button>
        </div>
      ) : null}

      {/* ─── STAT CARDS ─── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Campaigns</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {data?.totalCampaigns ?? 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Megaphone className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Spend</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ₹{Math.round(data?.totalSpend ?? 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <IndianRupee className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {data?.totalBookings ?? 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── CAMPAIGNS TABLE ─── */}
      <h2 className="text-lg font-medium text-gray-900 mb-4">Your Campaigns</h2>
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden mb-8">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <>
                <SkeletonTableRow />
                <SkeletonTableRow />
                <SkeletonTableRow />
              </>
            ) : data && data.campaigns.length > 0 ? (
              data.campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {c.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {c.start_date ? new Date(c.start_date).toLocaleDateString() : "—"}
                    {" – "}
                    {c.end_date ? new Date(c.end_date).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{Math.round(c.budget).toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeClass(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={4}>
                  <div className="flex flex-col items-center">
                    <Megaphone className="h-8 w-8 text-gray-300 mb-2" />
                    <p>No campaigns yet.</p>
                    <p className="text-xs mt-1">Click &quot;Create New Campaign&quot; to get started.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── AVAILABLE SCREENS GRID ─── */}
      <h2 className="text-lg font-medium text-gray-900 mb-4">Available Screens</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <>
            <SkeletonScreenCard />
            <SkeletonScreenCard />
            <SkeletonScreenCard />
            <SkeletonScreenCard />
            <SkeletonScreenCard />
            <SkeletonScreenCard />
          </>
        ) : data && data.availableScreens.length > 0 ? (
          data.availableScreens.map((s) => (
            <div key={s.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="w-full">
                  <h3 className="text-base font-medium text-gray-900">{s.screen_name}</h3>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    {s.location}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">{s.screen_type}</div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-indigo-600 font-bold">
                      ₹{Math.round(s.rate).toLocaleString("en-IN")}
                      <span className="text-gray-500 font-normal text-xs">/day</span>
                    </span>
                    <button
                      onClick={() => openBooking({ id: s.id, name: s.screen_name, location: s.location, type: s.screen_type, pricePerSlot: s.rate, owner: { id: '', name: null, companyName: null } })}
                      className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md hover:bg-indigo-100"
                    >
                      Book Now
                    </button>
                  </div>
                  <button
                    onClick={() => void startChatWithOwner(s.id)}
                    className="mt-2 w-full text-sm bg-gray-50 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100"
                  >
                    Chat with Owner
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-8 text-center">
            <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No screens available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
