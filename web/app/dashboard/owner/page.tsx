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

  useEffect(() => {
    void load();
    void loadChatThreads();
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

  const totalRevenue = useMemo(() => {
    const v = data?.stats.totalRevenue ?? 0;
    return v;
  }, [data]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
        <div className="flex gap-3">
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
                    {s.name} – {s.location}
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
                        className={`w-full text-left p-2 rounded border ${
                          selectedThreadId === thread.id
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
                            className={`text-sm ${
                              msg.senderId === data?.owner.id ? "text-right" : "text-left"
                            }`}
                          >
                            <div
                              className={`inline-block px-3 py-2 rounded-lg ${
                                msg.senderId === data?.owner.id
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
