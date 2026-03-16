"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

// --- LAYER 1: LOGIC & TYPES (Contracts) ---
// Asumsi service di-import sesuai struktur standar FE Anda
import api from "@/lib/axios";
import { DatabaseStats, RetentionEntityType } from "@/lib/types/retention";

// --- LAYER 2: UI PRIMITIVES (Visuals) ---
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- LAYER 3: FEATURE COMPONENTS (The Pillars) ---
// Asumsi komponen modular sudah dibuat sebelumnya (atau ganti import sesuai struktur nyata)
import { StatsPanel } from "@/components/features/maintenance/stats-panel";
import { ExportControl } from "@/components/features/maintenance/export-control";
import { VerificationZone } from "@/components/features/maintenance/verification-zone";
import { HazardZone } from "@/components/features/maintenance/hazard-zone";

export default function MaintenancePage() {
    // ---------------------------------------------------------------------------
    // STATE MANAGEMENT
    // ---------------------------------------------------------------------------

    // 1. Data State (Monitoring)
    const [stats, setStats] = useState<DatabaseStats | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 2. Workflow Context (Parameter yang sedang aktif)
    const [selectedEntity, setSelectedEntity] = useState<RetentionEntityType>(RetentionEntityType.FINANCIAL_CHECKUP);
    const [selectedCutoff, setSelectedCutoff] = useState<string>("");

    // 3. Security Gates (Status Kunci)
    const [isExportDone, setIsExportDone] = useState(false);
    const [verifiedToken, setVerifiedToken] = useState<string | null>(null);

    // ---------------------------------------------------------------------------
    // LOGIC: DATA FETCHING
    // ---------------------------------------------------------------------------

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Memanggil endpoint Phase 3 Backend yang sudah dibuat
            const response = await api.get('/admin/retention/stats');
            setStats(response.data);
        } catch (err: any) {
            console.error("Failed to fetch maintenance stats:", err);
            setError(
                err.response?.data?.message ||
                "Gagal terhubung ke layanan Maintenance. Pastikan Anda memiliki akses Admin."
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // ---------------------------------------------------------------------------
    // HANDLERS: WORKFLOW & SECURITY CONTROL
    // ---------------------------------------------------------------------------

    const handleParamChange = (entity: RetentionEntityType, date: string) => {
        setSelectedEntity(entity);
        setSelectedCutoff(date);

        if (isExportDone || verifiedToken) {
            setIsExportDone(false);
            setVerifiedToken(null);
            console.log("[MaintenanceFlow] Parameters changed. Security context reset.");
        }
    };

    const handleExportSuccess = () => {
        setIsExportDone(true);
        setVerifiedToken(null);
    };

    const handleTokenVerified = (token: string) => {
        setVerifiedToken(token);
    };

    const handlePruneSuccess = (deletedCount: number) => {
        setTimeout(() => {
            alert(`✅ SUKSES: Sistem telah menghapus ${new Intl.NumberFormat('id-ID').format(deletedCount)} data arsip secara permanen.`);
        }, 100);

        fetchStats();
        setIsExportDone(false);
        setVerifiedToken(null);
    };

    // ---------------------------------------------------------------------------
    // RENDER VIEW
    // ---------------------------------------------------------------------------

    if (error) {
        return (
            <div className="p-6 md:p-8 min-h-screen bg-slate-50">
                <Alert variant="destructive" className="animate-in zoom-in-95 max-w-3xl mx-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Gagal Memuat Sistem Maintenance</AlertTitle>
                    <AlertDescription className="flex flex-col gap-3 mt-2">
                        <p>{error}</p>
                        <Button variant="outline" size="sm" onClick={fetchStats} className="w-fit bg-white/50 hover:bg-white text-slate-800">
                            <RefreshCcw className="mr-2 h-3 w-3" /> Coba Koneksi Ulang
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10 px-4 md:px-8 pt-6 min-h-screen bg-slate-50/50">

            {/* --- HEADER TITLE --- */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Maintenance & Archiving</h1>
                <p className="text-slate-500 mt-1 text-sm max-w-2xl">
                    Kelola kapasitas database dan lakukan retensi data arsip secara aman. Anda wajib mengunduh (*export*) cadangan data sebelum sistem mengizinkan penghapusan permanen (*pruning*).
                </p>
            </div>

            {/* --- SECTION 1: HEADER & CONTROL BAR --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-500">Status Sistem Database</span>
                        {!isLoading && <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
                    </div>
                    <span className="text-lg font-bold text-slate-800">
                        {isLoading ? "Menghitung kapasitas..." : "Online & Ready"}
                    </span>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchStats}
                    disabled={isLoading}
                    className="gap-2 text-slate-600 border-slate-300 hover:bg-slate-50"
                >
                    <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    {isLoading ? "Refreshing..." : "Refresh Statistik"}
                </Button>
            </div>

            {/* --- SECTION 2: OBSERVATION DECK (Stats Panel) --- */}
            <div className="grid gap-4 md:grid-cols-1">
                {isLoading ? (
                    <Card className="h-[200px] animate-pulse bg-slate-100 border-none rounded-xl" />
                ) : (
                    <StatsPanel stats={stats} />
                )}
            </div>

            {/* --- SECTION 3: THE SECURITY PIPELINE --- */}
            <div className="grid gap-8 lg:grid-cols-2 items-start">

                {/* KOLOM KIRI: VALIDATION FLOW */}
                <div className="space-y-6">
                    {/* STEP 1: EXPORT (Source of Truth) */}
                    <div className="relative">
                        <ExportControl
                            onParamsChange={handleParamChange}
                            onExportSuccess={handleExportSuccess}
                        />
                        {isExportDone && (
                            <div className="absolute left-1/2 -bottom-6 w-0.5 h-6 bg-emerald-300 -z-10" />
                        )}
                    </div>

                    {/* STEP 2: VERIFICATION (The Bridge) */}
                    <div className={`transition-all duration-500 ${isExportDone ? 'opacity-100 translate-y-0' : 'opacity-50 grayscale'}`}>
                        <VerificationZone
                            entityType={selectedEntity}
                            cutoffDate={selectedCutoff}
                            isExportDone={isExportDone}
                            onTokenVerified={handleTokenVerified}
                            onTokenRevoked={() => setVerifiedToken(null)}
                        />
                    </div>
                </div>

                {/* KOLOM KANAN: EXECUTION FLOW (Hazard Zone) */}
                <div className="h-full sticky top-6">
                    <HazardZone
                        entityType={selectedEntity}
                        cutoffDate={selectedCutoff}
                        verifiedToken={verifiedToken}
                        onPruneSuccess={handlePruneSuccess}
                    />
                </div>

            </div>
        </div>
    );
}