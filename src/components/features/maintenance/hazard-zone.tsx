"use client";

import { ShieldAlert, Lock } from "lucide-react";
import { RetentionEntityType, EntityLabels } from "@/lib/types/retention";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PruneDialog } from "./prune-dialog";

interface HazardZoneProps {
    entityType: RetentionEntityType;
    cutoffDate: string;
    verifiedToken: string | null;
    onPruneSuccess: (count: number) => void;
}

/**
 * HAZARD ZONE COMPONENT
 * Area berbahaya yang hanya aktif jika Token Keamanan tersedia.
 * * Visual States:
 * 1. Locked: Abu-abu, ikon gembok.
 * 2. Unlocked: Merah, ikon peringatan, tombol aktif.
 */
export function HazardZone({
    entityType,
    cutoffDate,
    verifiedToken,
    onPruneSuccess,
}: HazardZoneProps) {

    // 1. STATE: LOCKED (Token Missing)
    if (!verifiedToken) {
        return (
            <Card className="h-full bg-slate-50 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center opacity-70 transition-all duration-300">
                <CardContent className="pt-6 pb-6 space-y-3">
                    <div className="bg-slate-200 p-4 rounded-full inline-flex">
                        <Lock className="h-8 w-8 text-slate-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-600">Hazard Zone Terkunci</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-50 mx-auto">
                            Selesaikan proses verifikasi di sebelah kiri untuk membuka panel eksekusi ini.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // 2. STATE: UNLOCKED (Danger Mode)
    return (
        <Card className="h-full border-2 border-red-200 bg-red-50/50 shadow-sm animate-in fade-in zoom-in-95 duration-300">
            <CardHeader className="pb-2">
                <CardTitle className="text-red-700 flex items-center gap-2 text-lg">
                    <ShieldAlert className="h-5 w-5" />
                    Hazard Zone: Execution
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 pt-4">
                {/* Context Summary */}
                <div className="bg-white/80 p-4 rounded-md border border-red-100 space-y-3 text-sm">
                    <div className="flex justify-between border-b border-red-50 pb-2">
                        <span className="text-slate-500">Target Entitas:</span>
                        <span className="font-semibold text-slate-800 text-right">
                            {EntityLabels[entityType]}
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-red-50 pb-2">
                        <span className="text-slate-500">Batas Tanggal:</span>
                        <span className="font-mono font-semibold text-slate-800">
                            {cutoffDate}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500">Status Token:</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-mono">
                            VERIFIED
                        </span>
                    </div>
                </div>

                {/* Action Button Wrapper */}
                <div className="pt-2">
                    <PruneDialog
                        entityType={entityType}
                        cutoffDate={cutoffDate}
                        pruneToken={verifiedToken}
                        onSuccess={onPruneSuccess}
                    />
                    <p className="text-[10px] text-red-400 text-center mt-3">
                        Tindakan ini akan dicatat dalam Audit Log Sistem.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}