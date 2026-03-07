"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OtpTimerProps {
    initialSeconds: number;
    onExpire: () => void;
    className?: string;
    // Menambahkan key unik (opsional) agar kita bisa me-reset timer dari parent component
    resetKey?: number;
}

export function OtpTimer({ initialSeconds, onExpire, className, resetKey }: OtpTimerProps) {
    const [seconds, setSeconds] = React.useState(initialSeconds);
    const onExpireRef = React.useRef(onExpire);

    // Menyimpan ref agar tidak memicu infinite loop pada effect
    React.useEffect(() => {
        onExpireRef.current = onExpire;
    }, [onExpire]);

    // Efek untuk me-reset timer jika resetKey berubah (dipicu saat user klik Resend)
    React.useEffect(() => {
        setSeconds(initialSeconds);
    }, [resetKey, initialSeconds]);

    React.useEffect(() => {
        if (seconds <= 0) {
            onExpireRef.current();
            return;
        }

        const timer = setInterval(() => {
            setSeconds((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [seconds]);

    // Format ke "MM:SS"
    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <span className={cn("font-medium tabular-nums tracking-wider", className)}>
            {formatTime(seconds)}
        </span>
    );
}