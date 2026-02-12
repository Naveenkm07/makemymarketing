"use client";

import { useEffect, useState } from "react";

type DeviceConfig = {
    deviceId: string;
    token: string;
};

type ScheduleItem = {
    id: string;
    url: string;
    duration: number;
    type: 'image' | 'video';
    start_time: string;
    end_time: string;
};

export class IoTClient {
    public static STORAGE_KEY = "dooh_device_config";
    private static SCHEDULE_KEY = "dooh_device_schedule";

    // Check if device is registered locally
    static getConfig(): DeviceConfig | null {
        if (typeof window === "undefined") return null;
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    }

    // Register a new device (Handshake)
    static async register(): Promise<{ deviceId: string; pairingCode: string } | null> {
        try {
            // Check if we already have a deviceId (even if unpaired)
            let deviceId = localStorage.getItem("dooh_device_id");

            const res = await fetch("/api/iot/register", {
                method: "POST",
                body: JSON.stringify({ deviceId }),
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem("dooh_device_id", data.device.device_id);
                return {
                    deviceId: data.device.device_id,
                    pairingCode: data.pairingCode || data.device.pairing_code
                };
            }
            return null;
        } catch (err) {
            console.error("Registration failed", err);
            return null;
        }
    }

    // Poll for pairing status (or just check heartbeat)
    static async checkHeartbeat(): Promise<{
        status: string;
        schedule?: ScheduleItem[];
        screen?: any;
    }> {
        const config = this.getConfig();
        if (!config) return { status: "unregistered" };

        try {
            const res = await fetch("/api/iot/heartbeat", {
                method: "POST",
                body: JSON.stringify(config),
            });

            if (res.status === 401) {
                // Token invalid?
                return { status: "unauthorized" };
            }

            const data = await res.json();

            if (data.status === "active") {
                // Cache schedule
                localStorage.setItem(this.SCHEDULE_KEY, JSON.stringify(data.schedule));
                // Cache screen info too
                if (data.screen) {
                    localStorage.setItem("dooh_device_screen", JSON.stringify(data.screen));
                }
                return { status: "active", schedule: data.schedule, screen: data.screen };
            } else if (data.status === "blocked") {
                return { status: "blocked" };
            }

            return { status: "unknown" };
        } catch (err) {
            console.error("Heartbeat failed (Offline?)", err);
            // Return cached schedule if offline
            const cached = localStorage.getItem(this.SCHEDULE_KEY);
            return {
                status: "offline",
                schedule: cached ? JSON.parse(cached) : []
            };
        }
    }

    // Save token after successful pairing (this logic usually happens when heartbeat returns success, 
    // but wait, we need the token first.
    // Actually, the CLIENT doesn't know it's paired until it gets a token.
    // The "Register" API returns a pairing code, but NO token.
    // The "Pair" API is called by Admin actions.
    // So the client needs to POLL some endpoint to see if it has been paired and GET the token.
    // Let's add a `check_pairing` method or update `register` to return token if paired?
    // Securely, the token should be generated upon pairing.
    // The client needs to exchange its device_id for a token once paired.
}

// Hook for React components
export function useIoT() {
    const [status, setStatus] = useState<"loading" | "unregistered" | "active" | "offline" | "blocked">("loading");
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [pairingCode, setPairingCode] = useState<string | null>(null);
    const [screenId, setScreenId] = useState<string | null>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        const init = async () => {
            const config = IoTClient.getConfig();
            if (config) {
                // We have a token, check heartbeat
                const hb = await IoTClient.checkHeartbeat();
                setStatus(hb.status as any);
                if (hb.schedule) setSchedule(hb.schedule);
                if (hb.screen) setScreenId(hb.screen.id);
                else {
                    // Try clean cache
                    const cachedScreen = localStorage.getItem("dooh_device_screen");
                    if (cachedScreen) setScreenId(JSON.parse(cachedScreen).id);
                }
            } else {
                // No token. Do we have a pending device_id?
                // We need to poll to see if we've been paired.
                // Actually, let's just try to register. If already pending, it returns code.
                const reg = await IoTClient.register();
                if (reg) {
                    setPairingCode(reg.pairingCode);
                    setStatus("unregistered");

                    // Start polling for token
                    interval = setInterval(async () => {
                        try {
                            const res = await fetch("/api/iot/status", {
                                method: "POST",
                                body: JSON.stringify({ deviceId: reg.deviceId }),
                            });
                            const data = await res.json();

                            if (data.status === 'active' && data.token) {
                                // Paired! Save config.
                                const config = { deviceId: reg.deviceId, token: data.token };
                                localStorage.setItem(IoTClient.STORAGE_KEY, JSON.stringify(config));

                                // Refresh state
                                clearInterval(interval);
                                setStatus("active");
                                // Fetch schedule immediately
                                const hb = await IoTClient.checkHeartbeat();
                                if (hb.schedule) setSchedule(hb.schedule);
                            }
                        } catch (err) {
                            console.error("Polling error", err);
                        }
                    }, 5000);
                }
            }
        };

        init();
        return () => clearInterval(interval);
    }, []);

    return { status, schedule, pairingCode, screenId };
}
