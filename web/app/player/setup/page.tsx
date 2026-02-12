"use client";

import { useIoT } from "@/lib/iot-client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Wifi, MonitorPlay } from "lucide-react";

export default function PlayerSetup() {
    const { status, pairingCode, schedule } = useIoT();
    const router = useRouter();

    useEffect(() => {
        if (status === "active") {
            // Device is paired! Redirect to player.
            // But wait, the standard player route is /player/[screenId].
            // We need to know the screenId.
            // The heartbeat returns 'screen' object.
            // But useIoT hook currently doesn't expose screen object explicitly in return, only schedule.
            // Let's assume the heartbeat saves it or we fetch it.
            // Actually, `useIoT` state `schedule` is set.
            // We should probably rely on the schedule or just reload to let the root player handle it?
            // For now, let's just show a "Ready" screen or try to fetch screenId from storage/heartbeat.
            // I'll update useIoT to return screenId maybe?
            // Or just redirect to /player which redirects to /player/[id]
            router.push("/player");
        }
    }, [status, router]);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 font-sans">

            {status === "loading" && (
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-400">Booting System...</p>
                </div>
            )}

            {status === "unregistered" && pairingCode && (
                <div className="max-w-2xl w-full bg-gray-900 border border-gray-800 rounded-3xl p-12 text-center shadow-2xl">
                    <div className="mb-8 flex justify-center text-indigo-500">
                        <MonitorPlay size={64} />
                    </div>

                    <h1 className="text-4xl font-bold mb-4">Pair This Screen</h1>
                    <p className="text-gray-400 text-xl mb-12">
                        Go to your dashboard and enter the code below to link this device.
                    </p>

                    <div className="bg-black rounded-2xl py-8 px-12 inline-block border-2 border-dashed border-gray-700 mb-12">
                        <span className="text-8xl font-mono tracking-[0.5em] font-bold text-white">
                            {pairingCode}
                        </span>
                    </div>

                    <div className="flex justify-center gap-8 text-sm text-gray-500">
                        <div className="flex items-center">
                            <Wifi className="w-4 h-4 mr-2" /> Network Connected
                        </div>
                        <div className="flex items-center">
                            <QrCode className="w-4 h-4 mr-2" /> Device ID: {localStorage.getItem("dooh_device_id")?.slice(0, 8)}...
                        </div>
                    </div>
                </div>
            )}

            {status === "blocked" && (
                <div className="text-red-500 text-center">
                    <h1 className="text-3xl font-bold mb-4">Device Blocked</h1>
                    <p>Please contact support.</p>
                </div>
            )}
        </div>
    );
}
