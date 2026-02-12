"use client";

import { useIoT } from "@/lib/iot-client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PlayerLauncher() {
    const { status, screenId } = useIoT();
    const router = useRouter();

    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js")
                .then(reg => console.log("SW Registered"))
                .catch(err => console.error("SW Fail", err));
        }
    }, []);

    useEffect(() => {
        if (status === "unregistered") {
            router.replace("/player/setup");
            const fetchScreenId = async () => {
                // We can re-call heartbeat or if we cached it.
                // Let's just trust the hook will eventually provide it.
                // Wait, I can just update the hook in the previous file.
            };
        }
    }, [status]);

    return (
        <div className="bg-black h-screen flex items-center justify-center text-white">
            {status === 'active' ? "Loading Player..." : "Initializing..."}
        </div>
    );
}
