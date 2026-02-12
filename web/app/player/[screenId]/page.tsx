"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, MonitorOff, Activity } from "lucide-react";

type PlaylistItem = {
    bookingId: string;
    campaignId: string;
    mediaUrl: string;
    duration: number; // seconds
    type: "image" | "video";
};

type PlaybackLog = {
    screenId: string;
    bookingId: string;
    timestamp: string;
    duration: number;
};

import { useIoT } from "@/lib/iot-client";
import { useSearchParams } from "next/navigation";

export default function WebPlayer() {
    const params = useParams();
    const searchParams = useSearchParams();
    const screenId = params.screenId as string;
    const isIoT = searchParams.get("mode") === "iot";

    // IoT Hook (only used if isIoT, but hooks must run unconditionally)
    const { schedule: iotSchedule, status: iotStatus } = useIoT();

    const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Logging buffer
    const logsBufferRef = useRef<PlaybackLog[]>([]);
    const lastLogTimeRef = useRef<number>(0);

    // ─── 1. FETCH PLAYLIST ───
    const fetchPlaylist = useCallback(async () => {
        if (isIoT) {
            // IoT Mode: Use schedule from hook (offline capable)
            if (iotSchedule.length > 0) {
                // Map IoT schedule to PlaylistItem
                const mapped = iotSchedule.map((s: any) => ({
                    bookingId: s.id,
                    campaignId: "iot-campaign", // placeholder
                    mediaUrl: s.url,
                    duration: s.duration,
                    type: s.type
                }));
                setPlaylist(mapped);
                setLoading(false);
                setError(null);
            } else if (iotStatus === 'offline') {
                // Hook handles local storage fallback
                setLoading(false);
                // If empty, keep waiting or show default
            }
            return;
        }

        // Web Mode: Fetch from API
        try {
            console.log("Fetching playlist...");
            const res = await fetch(`/api/player/playlist?screenId=${screenId}`);
            const json = await res.json();

            if (res.ok) {
                setPlaylist(json.playlist || []);
                setError(null);
            } else {
                console.error("Playlist fetch failed:", json.error);
                setError(json.error);
            }
        } catch (err) {
            console.error("Network error fetching playlist");
            setError("Network error");
        } finally {
            setLoading(false);
        }
    }, [screenId, isIoT, iotSchedule, iotStatus]);

    // Initial load + Polling
    useEffect(() => {
        fetchPlaylist();
        // Poll less frequently in IoT mode (heartbeat handles it)
        const interval = setInterval(fetchPlaylist, isIoT ? 60000 : 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchPlaylist, isIoT]);


    // ─── 2. REPORT LOGS ───
    const flushLogs = useCallback(async () => {
        if (logsBufferRef.current.length === 0) return;

        const logsToSend = [...logsBufferRef.current];
        logsBufferRef.current = []; // Clear buffer immediately

        try {
            if (isIoT) {
                // IoT Mode: Send to /api/iot/logs via IoTClient or fetch directly
                // We need to sign this with device token. 
                // Ideally use IoTClient.reportLogs(). 
                // For now, let's just fetch directly assuming we can get config again or just send to api/iot/logs?
                // Wait, api/iot/logs needs token.
                // Let's use localStorage to get config.
                const config = JSON.parse(localStorage.getItem("dooh_device_config") || "{}");
                if (config.token) {
                    await fetch("/api/iot/logs", {
                        method: "POST",
                        body: JSON.stringify({
                            deviceId: config.deviceId,
                            token: config.token,
                            logs: logsToSend.map(l => ({
                                type: 'playback',
                                ...l
                            }))
                        })
                    });
                }
            } else {
                await fetch("/api/player/report", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ logs: logsToSend }),
                });
            }
            console.log(`Reported ${logsToSend.length} logs`);
        } catch (err) {
            console.error("Failed to report logs, restoring buffer");
            logsBufferRef.current = [...logsToSend, ...logsBufferRef.current];
        }
    }, [isIoT]);

    // Flush every 30 seconds
    useEffect(() => {
        const interval = setInterval(flushLogs, 30 * 1000);
        return () => clearInterval(interval);
    }, [flushLogs]);


    // ─── 3. PLAYBACK LOGIC ───
    useEffect(() => {
        if (playlist.length === 0) return;

        const currentItem = playlist[currentIndex];

        // Log playback start
        // Simple debounce to prevent duplicate logs for same item start if effect re-runs
        const now = Date.now();
        if (now - lastLogTimeRef.current > 1000) {
            logsBufferRef.current.push({
                screenId,
                bookingId: currentItem.bookingId,
                timestamp: new Date().toISOString(),
                duration: currentItem.duration
            });
            lastLogTimeRef.current = now;
        }

        let timer: NodeJS.Timeout;

        if (currentItem.type === "image") {
            timer = setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % playlist.length);
            }, currentItem.duration * 1000);
        }
        // For video, we handle 'onEnded' event instead of timeout, 
        // but useful to have a fallback timeout just in case video fails to play?
        // Let's stick to onEnded for video to be precise.

        return () => clearTimeout(timer);
    }, [currentIndex, playlist, screenId]);


    // ─── 4. VIDEO HANDLER ───
    const handleVideoEnded = () => {
        setCurrentIndex((prev) => (prev + 1) % playlist.length);
    };


    // ─── RENDER ───
    if (loading) {
        return (
            <div className="bg-black h-screen w-screen flex items-center justify-center text-white">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                <span className="ml-3 font-mono">Connecting to Ad Server...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-black h-screen w-screen flex flex-col items-center justify-center text-gray-500">
                <MonitorOff className="h-16 w-16 mb-4" />
                <h1 className="text-xl font-bold">Screen Offline</h1>
                <p className="text-sm mt-2">{error}</p>
                <button
                    onClick={fetchPlaylist}
                    className="mt-6 px-4 py-2 border border-gray-700 rounded text-xs hover:bg-gray-900"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    if (playlist.length === 0) {
        return (
            <div className="bg-black h-screen w-screen flex flex-col items-center justify-center text-gray-700">
                <Activity className="h-16 w-16 mb-4 opacity-50" />
                <h1 className="text-2xl font-bold tracking-widest uppercase">Make My Marketing</h1>
                <p className="text-sm mt-2 tracking-wide opacity-70">Waiting for content...</p>
                <div className="mt-8 h-1 w-24 bg-gray-800 rounded overflow-hidden">
                    <div className="h-full bg-indigo-500 w-1/3 animate-ping" />
                </div>
            </div>
        );
    }

    const item = playlist[currentIndex];

    return (
        <div className="bg-black h-screen w-screen overflow-hidden relative">
            {item.type === "video" ? (
                <video
                    key={item.mediaUrl} // Force re-render on change
                    src={item.mediaUrl}
                    autoPlay
                    muted // Auto-play requires muted often, but for DOOH usually sound is optional
                    // If sound is needed, user interaction usually required first, or special browser config.
                    // Assuming muted for basic web player.
                    className="w-full h-full object-contain"
                    onEnded={handleVideoEnded}
                    onError={handleVideoEnded} // Skip if error
                />
            ) : (
                <img
                    key={item.mediaUrl}
                    src={item.mediaUrl}
                    alt="Ad"
                    className="w-full h-full object-contain animate-fade-in"
                />
            )}

            {/* Debug Overlay (hidden in prod usually, but good for MVP) */}
            <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded font-mono pointer-events-none">
                Log Buffer: {logsBufferRef.current.length} | ID: {item.bookingId.slice(0, 4)}
            </div>
        </div>
    );
}
