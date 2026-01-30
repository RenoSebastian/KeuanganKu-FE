"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, Loader2, AlertCircle } from "lucide-react";

// Types & Services
import { RetentionEntityType, EntityLabels } from "@/lib/types/retention";
import { MaintenanceService } from "@/services/maintenance.service";

// Components
import { SafetyInput } from "@/components/ui/safety-input";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction, // Menggunakan Action button dari primitif alert-dialog jika perlu styling khusus
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PruneDialogProps {
    entityType: RetentionEntityType;
    cutoffDate: string;
    pruneToken: string;
    onSuccess: (deletedCount: number) => void;
}

const SAFETY_PHRASE = "SAYA PAHAM DATA AKAN HILANG PERMANEN";

/**
 * PRUNE DIALOG (The Red Button Logic)
 * * Type Fixing Note:
 * Menggunakan variant="danger" sesuai standar UI Button yang ada di project.
 */
export function PruneDialog({
    entityType,
    cutoffDate,
    pruneToken,
    onSuccess,
}: PruneDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [safetyText, setSafetyText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isSafetyMatch = safetyText === SAFETY_PHRASE;

    const handleExecute = async () => {
        if (!isSafetyMatch) return;

        setIsLoading(true);
        setError(null);

        try {
            // EXECUTE TO BACKEND
            const result = await MaintenanceService.executePrune({
                entityType,
                cutoffDate,
                pruneToken,
            });

            setIsOpen(false);
            onSuccess(result.deletedCount);

            // Reset state for next use
            setSafetyText("");
        } catch (err: any) {
            console.error("Pruning Failed:", err);
            setError(err.response?.data?.message || "Gagal melakukan penghapusan data. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                {/* FIX: Menggunakan variant="danger" alih-alih "destructive" */}
                <Button variant="danger" className="w-full gap-2 font-bold shadow-lg shadow-red-100 hover:shadow-red-200">
                    <Trash2 className="h-4 w-4" />
                    EXECUTE PRUNE NOW
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-md border-l-8 border-l-red-600">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Konfirmasi Penghapusan Permanen
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3 pt-2 text-slate-600">
                        <p>
                            Anda akan menghapus data <strong>{EntityLabels[entityType]}</strong> sebelum tanggal <strong>{cutoffDate}</strong>.
                        </p>
                        <div className="bg-red-50 p-3 rounded text-red-800 text-xs font-medium border border-red-100">
                            PERINGATAN: Tindakan ini tidak dapat dibatalkan (Irreversible).
                            Pastikan Anda sudah menyimpan file backup yang valid.
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* ERROR DISPLAY */}
                {error && (
                    <Alert variant="destructive" className="my-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Gagal Eksekusi</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* SAFETY INPUT */}
                <div className="py-4">
                    <SafetyInput
                        expectedPhrase={SAFETY_PHRASE}
                        value={safetyText}
                        onChange={setSafetyText}
                        disabled={isLoading}
                    />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
                    {/* Custom Trigger Button di dalam Footer.
             FIX: Menggunakan variant="danger" 
          */}
                    <Button
                        variant="danger"
                        onClick={(e) => {
                            e.preventDefault(); // Mencegah auto-close dialog default behaviour
                            handleExecute();
                        }}
                        disabled={!isSafetyMatch || isLoading}
                        className="w-full sm:w-auto"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Ya, Hapus Permanen"
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}