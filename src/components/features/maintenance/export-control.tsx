"use client";

import { useState } from "react";
import { Download, AlertTriangle, Calendar, FileJson } from "lucide-react";
import { format, startOfMonth, isBefore, subMonths } from "date-fns";
import { id } from "date-fns/locale";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Menggunakan native date input via Shadcn wrapper
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Logic
import { useSecureExport } from "@/hooks/use-secure-export";
import { EntityLabels, RetentionEntityType } from "@/lib/types/retention";

export function ExportControl() {
    // --- STATE ---
    const [entityType, setEntityType] = useState<RetentionEntityType>(RetentionEntityType.FINANCIAL_CHECKUP);
    const [cutoffDate, setCutoffDate] = useState<string>("");
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // --- HOOK INTEGRATION ---
    const { isLoading, triggerExport } = useSecureExport(
        () => {
            setSuccessMsg("File berhasil diunduh! Simpan file ini baik-baik.");
            setErrorMsg(null);
        },
        (msg) => {
            setErrorMsg(msg);
            setSuccessMsg(null);
        }
    );

    // --- LOGIC GUARDRAILS ---

    // Hitung batas aman (Awal bulan ini). User hanya boleh hapus data < Bulan Ini.
    const today = new Date();
    const startOfCurrentMonth = startOfMonth(today);
    // Default suggestion: 12 bulan lalu
    const defaultSuggestion = format(subMonths(startOfCurrentMonth, 12), "yyyy-MM-dd");

    /**
     * Handler saat tombol export diklik.
     * Melakukan validasi bisnis sebelum memanggil hook.
     */
    const handleExport = () => {
        setSuccessMsg(null);
        setErrorMsg(null);

        // 1. Validasi Basic
        if (!cutoffDate) {
            setErrorMsg("Tanggal batas (cutoff) harus dipilih.");
            return;
        }

        // 2. Validasi Safety Date (Constraint Bisnis)
        // Input 'cutoffDate' adalah string YYYY-MM-DD. Kita parse ke Date object untuk komparasi.
        const selectedDate = new Date(cutoffDate);

        // Check: Apakah Selected Date >= Awal Bulan Ini?
        // Jika ya, TOLAK. Kita tidak boleh menyentuh data bulan berjalan.
        if (!isBefore(selectedDate, startOfCurrentMonth)) {
            setErrorMsg(
                `Pelanggaran Keamanan: Anda tidak boleh mengarsipkan data bulan berjalan (${format(startOfCurrentMonth, 'MMMM yyyy', { locale: id })}). Pilih tanggal sebelumnya.`
            );
            return;
        }

        // 3. Eksekusi
        triggerExport({
            entityType,
            cutoffDate,
        });
    };

    return (
        <Card className="h-full flex flex-col border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Download className="h-5 w-5 text-blue-500" />
                    Secure Data Export
                </CardTitle>
                <CardDescription>
                    Langkah 1: Unduh data historis ke perangkat lokal Anda sebelum melakukan penghapusan.
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

                {successMsg && (
                    <Alert className="bg-green-50 border-green-200 text-green-800 animate-in fade-in">
                        <FileJson className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Export Berhasil</AlertTitle>
                        <AlertDescription>{successMsg}</AlertDescription>
                    </Alert>
                )}

                {/* FORM INPUTS */}
                <div className="space-y-4">

                    {/* 1. Entity Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="entity-select">Pilih Data Entitas</Label>
                        {/* Menggunakan Native Select untuk kompatibilitas maksimal tanpa komponen Shadcn Select */}
                        <select
                            id="entity-select"
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                            value={entityType}
                            onChange={(e) => setEntityType(e.target.value as RetentionEntityType)}
                            disabled={isLoading}
                        >
                            {Object.entries(EntityLabels).map(([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 2. Date Picker (Native) */}
                    <div className="space-y-2">
                        <Label htmlFor="cutoff-date">
                            Batas Tanggal Retensi (Cutoff)
                        </Label>
                        <div className="relative">
                            <Input
                                id="cutoff-date"
                                type="date"
                                value={cutoffDate}
                                onChange={(e) => setCutoffDate(e.target.value)}
                                max={format(subMonths(startOfCurrentMonth, 1), "yyyy-MM-dd")} // HTML constraint visual
                                disabled={isLoading}
                                className="pl-10"
                            />
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                        <p className="text-xs text-slate-500">
                            *Data yang dibuat <b>sebelum</b> tanggal ini akan ditarik.
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
                                Downloading Stream...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Start Secure Export
                            </>
                        )}
                    </Button>
                </div>

            </CardContent>
        </Card>
    );
}