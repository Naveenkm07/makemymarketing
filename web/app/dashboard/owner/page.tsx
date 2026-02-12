"use client";

import { Plus, BarChart, Monitor } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// Matches /api/owner/dashboard response format
type OwnerScreenRow = {
  id: string;
  screen_name: string;
  location: string;
  status: "active" | "inactive";
  rate: number;
};

type OwnerDashboardResponse = {
  totalRevenue: number;
  activeScreens: number;
  screens: OwnerScreenRow[];
};

// Skeleton loader component
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
      <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded-full w-16" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
    </tr>
  );
}

export default function OwnerDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OwnerDashboardResponse | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [pricePerSlot, setPricePerSlot] = useState("");
  const [dimension, setDimension] = useState("");
  const [supportedFormats, setSupportedFormats] = useState("");

  const [showAvailability, setShowAvailability] = useState(false);
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [availabilityBlocks, setAvailabilityBlocks] = useState<any[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [newBlockStart, setNewBlockStart] = useState("");
  const [newBlockEnd, setNewBlockEnd] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");
  const [addingBlock, setAddingBlock] = useState(false);

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
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string | null; role: string } | null>(null);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/owner/dashboard", { cache: "no-store" });

      if (res.status === 401 || res.status === 403) {
        // Auth/role issues - don't show as dashboard error
        console.warn("Owner dashboard: not authorized");
        setData(null);
        return;
      }

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        console.error("Owner dashboard API error:", json?.error);
        setError(json?.error || "Failed to load dashboard");
        return;
      }

      const json = (await res.json()) as OwnerDashboardResponse;
      setData(json);
    } catch (err) {
      console.error("Owner dashboard load error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailability(screenId: string) {
    setAvailabilityLoading(true);
    try {
      const res = await fetch(`/api/availability?screenId=${encodeURIComponent(screenId)}`, { cache: "no-store" });
      const json = (await res.json()) as any;
      if (res.ok && json?.ok) {
        setAvailabilityBlocks(json.blocks ?? []);
      } else {
        setAvailabilityBlocks([]);
      }
    } catch {
      setAvailabilityBlocks([]);
    } finally {
      setAvailabilityLoading(false);
    }
  }

  async function addAvailabilityBlock(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedScreenId) return;
    setAddingBlock(true);
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          screenId: selectedScreenId,
          startTime: newBlockStart,
          endTime: newBlockEnd,
          reason: newBlockReason,
        }),
      });
      const json = (await res.json()) as any;
      if (res.ok && json?.ok) {
        setNewBlockStart("");
        setNewBlockEnd("");
        setNewBlockReason("");
        await loadAvailability(selectedScreenId);
      } else {
        setError(json?.error ?? "Failed to add availability block");
      }
    } catch {
      setError("Failed to add availability block");
    } finally {
      setAddingBlock(false);
    }
  }

  async function deleteAvailabilityBlock(blockId: string) {
    try {
      const res = await fetch(`/api/availability?blockId=${encodeURIComponent(blockId)}`, { method: "DELETE" });
      const json = (await res.json()) as any;
      if (res.ok && json?.ok) {
        await loadAvailability(selectedScreenId!);
      } else {
        setError(json?.error ?? "Failed to delete availability block");
      }
    } catch {
      setError("Failed to delete availability block");
    }
  }

  function openAvailability(screenId: string) {
    setSelectedScreenId(screenId);
    setShowAvailability(true);
    void loadAvailability(screenId);
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
        setError(json?.error ?? "Failed to send message");
      }
    } catch {
      setError("Failed to send message");
    } finally {
      setSendingMessage(false);
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

  useEffect(() => {
    void load();
    void loadChatThreads();
    void loadCurrentUser();
  }, []);

  async function createScreen(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/dashboard/owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          location,
          type,
          pricePerSlot: Number(pricePerSlot),
          dimension,
          supportedFormats,
        }),
      });
      const json = (await res.json()) as any;
      if (!res.ok || !json?.ok) {
        setError(json?.error ?? "Failed to add screen");
        return;
      }

      setShowAdd(false);
      setName("");
      setLocation("");
      setType("");
      setPricePerSlot("");
      setDimension("");
      setSupportedFormats("");
      await load();
    } catch {
      setError("Failed to add screen");
    } finally {
      setCreating(false);
    }
  }

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

  const totalRevenue = data?.totalRevenue ?? 0;
  const activeScreenCount = data?.activeScreens ?? 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
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
            onClick={() => setShowAvailability(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
          >
            <Plus className="mr-2 h-5 w-5" />
            Manage Availability
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New Screen
          </button>
        </div>
      </div>

      {showAdd ? (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Add Screen</h2>
            <button
              onClick={() => setShowAdd(false)}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
              type="button"
            >
              Close
            </button>
          </div>

          <form onSubmit={createScreen} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Screen name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Forum Mall Entrance"
                required
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Koramangala, Bengaluru"
                required
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <input
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="MALL_DISPLAY"
                required
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Price per slot (₹)</label>
              <input
                value={pricePerSlot}
                onChange={(e) => setPricePerSlot(e.target.value)}
                type="number"
                min={1}
                step="1"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="3000"
                required
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Dimension (optional)</label>
              <input
                value={dimension}
                onChange={(e) => setDimension(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="1920x1080"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Supported formats (optional)</label>
              <input
                value={supportedFormats}
                onChange={(e) => setSupportedFormats(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="IMAGE,VIDEO"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-60"
              >
                {creating ? "Adding..." : "Add Screen"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {showAvailability && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Manage Availability</h2>
            <button
              onClick={() => setShowAvailability(false)}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
              type="button"
            >
              Close
            </button>
          </div>

          <div className="mt-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Select Screen</label>
              <select
                value={selectedScreenId || ""}
                onChange={(e) => {
                  setSelectedScreenId(e.target.value);
                  if (e.target.value) void loadAvailability(e.target.value);
                }}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Choose a screen</option>
                {data?.screens.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.screen_name} – {s.location}
                  </option>
                ))}
              </select>
            </div>

            {selectedScreenId && (
              <>
                <form onSubmit={addAvailabilityBlock} className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date & Time</label>
                    <input
                      value={newBlockStart}
                      onChange={(e) => setNewBlockStart(e.target.value)}
                      type="datetime-local"
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date & Time</label>
                    <input
                      value={newBlockEnd}
                      onChange={(e) => setNewBlockEnd(e.target.value)}
                      type="datetime-local"
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reason (optional)</label>
                    <input
                      value={newBlockReason}
                      onChange={(e) => setNewBlockReason(e.target.value)}
                      type="text"
                      placeholder="e.g. Maintenance"
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={addingBlock}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-60"
                    >
                      {addingBlock ? "Adding..." : "Add Unavailable Block"}
                    </button>
                  </div>
                </form>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Current Availability Blocks</h3>
                  {availabilityLoading ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                  ) : availabilityBlocks.length === 0 ? (
                    <div className="text-sm text-gray-500">No availability blocks. Screen is available by default.</div>
                  ) : (
                    <ul className="space-y-2">
                      {availabilityBlocks.map((block) => (
                        <li key={block.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div className="text-sm">
                            <div className="font-medium">
                              {new Date(block.startTime).toLocaleString()} – {new Date(block.endTime).toLocaleString()}
                            </div>
                            {block.reason && <div className="text-gray-500">{block.reason}</div>}
                          </div>
                          <button
                            onClick={() => void deleteAvailabilityBlock(block.id)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
                          {thread.participants.find((p: any) => p.role !== "OWNER")?.name ||
                            thread.participants.find((p: any) => p.role !== "OWNER")?.companyName}
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
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{Math.round(analytics.totalRevenue).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalBookings}</p>
                </div>
              </div>

              {analytics.revenueByScreen && analytics.revenueByScreen.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Revenue by Screen</h3>
                  <ul className="space-y-2">
                    {analytics.revenueByScreen.map((item: any, i: number) => (
                      <li key={i} className="flex justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm font-medium text-gray-900">{item.screenName}</span>
                        <span className="text-sm text-gray-600">
                          ₹{Math.round(item.revenue).toLocaleString("en-IN")} ({item.bookingsCount} bookings)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analytics.revenueOverTime && analytics.revenueOverTime.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Revenue Over Time</h3>
                  <div className="h-40 bg-gray-50 rounded p-2">
                    <svg viewBox="0 0 400 100" className="w-full h-full">
                      {analytics.revenueOverTime.map((item: any, i: number) => {
                        const max = Math.max(...analytics.revenueOverTime.map((d: any) => d.revenue));
                        const x = (i / (analytics.revenueOverTime.length - 1)) * 380 + 10;
                        const y = 90 - (item.revenue / max) * 70;
                        return (
                          <g key={i}>
                            <circle cx={x} cy={y} r={3} fill="#10b981" />
                            {i > 0 && (
                              <line
                                x1={(i - 1) / (analytics.revenueOverTime.length - 1) * 380 + 10}
                                y1={90 - (analytics.revenueOverTime[i - 1].revenue / max) * 70}
                                x2={x}
                                y2={y}
                                stroke="#10b981"
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
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ₹{Math.round(totalRevenue).toLocaleString("en-IN")}
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
                  {activeScreenCount}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Monitor className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Screens</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {data?.screens.length ?? 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Monitor className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── ERROR BANNER (only for real failures) ─── */}
      {error && !loading ? (
        <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
          <button onClick={() => void load()} className="ml-auto text-red-600 hover:text-red-800 underline text-xs">
            Retry
          </button>
        </div>
      ) : null}

      {/* ─── SCREENS TABLE ─── */}
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
              <>
                <SkeletonTableRow />
                <SkeletonTableRow />
                <SkeletonTableRow />
              </>
            ) : data && data.screens.length > 0 ? (
              data.screens.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {s.screen_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {s.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {s.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{Math.round(s.rate || 0).toLocaleString("en-IN")}/day
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={4}>
                  <div className="flex flex-col items-center">
                    <Monitor className="h-8 w-8 text-gray-300 mb-2" />
                    <p>No screens added yet.</p>
                    <p className="text-xs mt-1">Click &quot;Add New Screen&quot; to list your first screen.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
