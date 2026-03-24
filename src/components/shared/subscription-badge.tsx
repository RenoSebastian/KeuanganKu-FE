"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Crown, Clock, AlertCircle, XCircle } from "lucide-react";

interface SubscriptionBadgeProps {
    status?: string;
    remainingDays?: number;
    className?: string;
    showIcon?: boolean;
}

export function SubscriptionBadge({
    status = "INACTIVE",
    remainingDays = 0,
    className,
    showIcon = true,
}: SubscriptionBadgeProps) {

    // Mapping status ke gaya visual dan ikon
    const getStatusConfig = () => {
        const s = status?.toUpperCase();

        // Logika Early Warning: Jika aktif tapi sisa hari kritis (<= 7 hari)
        if (s === "ACTIVE" && remainingDays <= 7 && remainingDays > 0) {
            return {
                label: `${remainingDays} Hari Lagi`,
                styles: "bg-amber-100 text-amber-700 border-amber-200 animate-pulse",
                icon: <Clock className="w-3 h-3" />,
            };
        }

        switch (s) {
            case "ACTIVE":
                return {
                    label: "Aktif",
                    styles: "bg-emerald-100 text-emerald-700 border-emerald-200",
                    icon: <Crown className="w-3 h-3 fill-emerald-700/20" />,
                };
            case "EXPIRED":
                return {
                    label: "Expired",
                    styles: "bg-red-100 text-red-700 border-red-200",
                    icon: <AlertCircle className="w-3 h-3" />,
                };
            case "PENDING":
                return {
                    label: "Menunggu Verifikasi",
                    styles: "bg-blue-100 text-blue-700 border-blue-200",
                    icon: <Clock className="w-3 h-3" />,
                };
            default:
                return {
                    label: "Basic / Inactive",
                    styles: "bg-slate-100 text-slate-500 border-slate-200",
                    icon: <XCircle className="w-3 h-3" />,
                };
        }
    };

    const config = getStatusConfig();

    return (
        <Badge
            variant="outline"
            className={cn(
                "px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-tighter flex items-center gap-1.5 w-fit shadow-xs",
                config.styles,
                className
            )}
        >
            {showIcon && config.icon}
            {config.label}
        </Badge>
    );
}