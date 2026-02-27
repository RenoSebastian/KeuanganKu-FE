"use client";

import { useEffect } from "react";
import { SystemStateDisplay } from "@/components/shared/system-state-display";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error ke monitoring service (Sentry/LogRocket)
        console.error("Critical System Crash:", error);
    }, [error]);

    return <SystemStateDisplay type="SERVER_ERROR" />;
}