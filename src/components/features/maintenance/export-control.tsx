"use client";

import { useState } from "react";
import { Download, AlertTriangle, Calendar, FileArchive } from "lucide-react";
import { format, startOfMonth, isBefore, subMonths } from "date-fns";
import { id } from "date-fns/locale";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Logic & Types
import { useSecureExport } from "@/hooks/use-secure-export";
import { EntityLabels, RetentionEntityType } from "@/lib/types/retention";

// Fase 2: Import komponen Post-Download Action
import {
    PostDownloadAction,
    DownloadResultData
} from "@/components/features/shared/post-download-action";

/**
 * Interface Props Kontrak
 * Wajib disinkronkan dengan pemanggilan di page.tsx
 */
interface ExportControlProps {
    onParamsChange: (entity: RetentionEntityType, date: string) => void;
    onExportSuccess: () => void;
}

export function ExportControl({
    onParamsChange,
    onExportSuccess
}: ExportControlProps) {

    // --- STATE ---
    const [entityType, setEntityType] = useState<RetentionEntityType>(RetentionEntityType.FINANCIAL_CHECKUP);
    const [cutoffDate, setCutoffDate] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // State baru untuk integrasi PostDownloadAction (Fase 2)
    const [downloadData, setDownloadData] = useState<DownloadResultData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // --- HOOK INTEGRATION ---
    // Hook ini sekarang memproduksi objek File biner alih-alih navigasi unduhan standar
    const { isLoading, triggerExport } = useSecureExport(
        // Success Callback
        () => {
            setErrorMsg(null);
            // Trigger prop ke parent untuk membuka Verification Zone di latar belakang
            onExportSuccess();
        },
        // Error Callback
        (msg) => {
            setErrorMsg(msg);
        }
    );

    // --- LOGIC: DATE CONSTRAINTS ---
    const today = new Date();
    const startOfCurrentMonth = startOfMonth(today);
    const defaultSuggestion = format(subMonths(startOfCurrentMonth, 12), "yyyy-MM-dd");

    // --- HANDLERS: INPUT CHANGE ---
    // Fungsi ini memastikan Parent State (page.tsx) selalu sinkron dengan Local State

    const handleEntityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newEntity = e.target.value as RetentionEntityType;
        setEntityType(newEntity);
        // Reset Flow Keamanan di Parent
        onParamsChange(newEntity, cutoffDate);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setCutoffDate(newDate);
        // Reset Flow Keamanan di Parent
        onParamsChange(entityType, newDate);
    };

    /**
     * Handler tombol Export (Diubah menjadi Async untuk menangkap return data File)
     */
    const handleExport = async () => {
        setErrorMsg(null);

        // 1. Validasi Input
        if (!cutoffDate) {
            setErrorMsg("Tanggal batas (cutoff) harus dipilih.");
            return;
        }

        // 2. Validasi Safety Date (Logic Guardrail)
        const selectedDate = new Date(cutoffDate);
        if (!isBefore(selectedDate, startOfCurrentMonth)) {
            setErrorMsg(
                `Pelanggaran Keamanan: Anda tidak boleh mengarsipkan data bulan berjalan (${format(startOfCurrentMonth, 'MMMM yyyy', { locale: id })}). Pilih tanggal sebelumnya.`
            );
            return;
        }

        // 3. Eksekusi Export & Tangkap Hasil (Integrasi Fase 1 ke Fase 2)
        const result = await triggerExport({
            entityType,
            cutoffDate,
        });

        // 4. Buka Modal Interaksi jika berhasil
        if (result) {
            setDownloadData(result);
            setIsModalOpen(true);
        }
    };

    /**
     * Handler untuk menutup modal dan membersihkan RAM (Garbage Collection)
     */
    const handleCloseModal = () => {
        if (downloadData?.url) {
            window.URL.revokeObjectURL(downloadData.url); // Mencegah memory leak
        }
        setIsModalOpen(false);
        // Delay sedikit sebelum mengosongkan state agar animasi close modal berjalan mulus
        setTimeout(() => setDownloadData(null), 300);
    };

    return (
        <>
            <Card className="h-full flex flex-col border-l-4 border-l-blue-500 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                        <Download className="h-5 w-5 text-blue-500" />
                        Secure Binary Export
                    </CardTitle>
                    <CardDescription>
                        Langkah 1: Unduh data historis ke dalam format aman (.mgc) sebelum melakukan Pruning.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 flex-1">
                    {/* ALERT AREA */}
                    {errorMsg && (
                        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Gagal Export</AlertTitle>
                            <AlertDescription>{errorMsg}</AlertDescription>
                        </Alert>
                    )}

                    {/* FORM INPUTS */}
                    <div className="space-y-4">

                        {/* 1. Entity Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="entity-select">Pilih Data Entitas</Label>
                            <select
                                id="entity-select"
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                                value={entityType}
                                onChange={handleEntityChange}
                                disabled={isLoading}
                            >
                                {Object.entries(EntityLabels).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Date Picker */}
                        <div className="space-y-2">
                            <Label htmlFor="cutoff-date">
                                Batas Tanggal Retensi (Cutoff)
                            </Label>
                            <div className="relative">
                                <Input
                                    id="cutoff-date"
                                    type="date"
                                    value={cutoffDate}
                                    onChange={handleDateChange}
                                    max={format(subMonths(startOfCurrentMonth, 1), "yyyy-MM-dd")}
                                    disabled={isLoading}
                                    className="pl-10"
                                />
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                            </div>
                            <p className="text-xs text-slate-500">
                                *Data yang dibuat <b>sebelum</b> tanggal ini akan ditarik ke dalam .mgc stream.
                                <br />
                                Saran: Gunakan tanggal {defaultSuggestion} (1 Tahun lalu).
                            </p>
                        </div>

                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="pt-4">
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 transition-all"
                            onClick={handleExport}
                            disabled={isLoading || !cutoffDate}
                        >
                            {isLoading ? (
                                <>
                                    <span className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                    Generating Binary Stream...
                                </>
                            ) : (
                                <>
                                    <FileArchive className="mr-2 h-4 w-4" />
                                    Start Secure Export
                                </>
                            )}
                        </Button>
                    </div>

                </CardContent>
            </Card>

            {/* Fase 2: Dialog Modal Post-Download (Render secara dinamis) */}
            <PostDownloadAction
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                fileData={downloadData}
            />
        </>
    );
}