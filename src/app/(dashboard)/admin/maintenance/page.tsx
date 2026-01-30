"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertCircle, RefreshCcw, CheckCircle2 } from "lucide-react";

// --- LAYER 1: LOGIC & TYPES (Contracts) ---
import { MaintenanceService } from "@/services/maintenance.service";
import { DatabaseStats, RetentionEntityType } from "@/lib/types/retention";

// --- LAYER 2: UI PRIMITIVES (Visuals) ---
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- LAYER 3: FEATURE COMPONENTS (The Pillars) ---
import { StatsPanel } from "@/components/features/maintenance/stats-panel";
import { ExportControl } from "@/components/features/maintenance/export-control";
import { VerificationZone } from "@/components/features/maintenance/verification-zone";
import { HazardZone } from "@/components/features/maintenance/hazard-zone";

/**
 * PAGE CONTROLLER: Maintenance & Retention Dashboard
 * * Bertindak sebagai "Brain/Orchestrator" yang menghubungkan seluruh pipeline keamanan.
 * Menerapkan prinsip "State Lifting" dimana status keamanan (Token, File) dikelola di sini
 * untuk didistribusikan ke komponen-komponen yang terisolasi.
 * * Security Lifecycle:
 * 1. [Init] Fetch Stats -> Tampilkan beban database.
 * 2. [Export] User memilih Entity/Date -> Download File -> State `isExportDone` = true.
 * 3. [Verify] User upload file -> Client-side Scan -> Valid Token -> State `verifiedToken` terisi.
 * 4. [Prune] User input Safety Phrase -> API Call dengan Token -> Data Terhapus.
 * 5. [Reset] State reset, Stats refresh.
 */
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
    const [isExportDone, setIsExportDone] = useState(false);       // Gate 1: Export Selesai?
    const [verifiedToken, setVerifiedToken] = useState<string | null>(null); // Gate 2: Token Valid?

    // ---------------------------------------------------------------------------
    // LOGIC: DATA FETCHING
    // ---------------------------------------------------------------------------

    /**
     * Mengambil statistik database terbaru.
     * Dipanggil saat mount, refresh manual, atau setelah pruning sukses.
     */
    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await MaintenanceService.getStats();
            setStats(data);
        } catch (err: any) {
            console.error("Failed to fetch maintenance stats:", err);
            // Fallback error message yang user-friendly
            setError(
                err.response?.data?.message ||
                "Gagal terhubung ke layanan Maintenance. Pastikan server Backend aktif dan Anda memiliki akses Admin."
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial Load
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // ---------------------------------------------------------------------------
    // HANDLERS: WORKFLOW & SECURITY CONTROL
    // ---------------------------------------------------------------------------

    /**
     * Handler saat User mengubah dropdown Entity atau Date di Export Control.
     * CRITICAL SECURITY: Jika parameter berubah, semua validasi sebelumnya BATAL.
     * Ini mencegah user export "Goals" tapi menggunakan token "Budget".
     */
    const handleParamChange = (entity: RetentionEntityType, date: string) => {
        // 1. Update Context
        setSelectedEntity(entity);
        setSelectedCutoff(date);

        // 2. Security Reset (Invalidate previous steps)
        if (isExportDone || verifiedToken) {
            setIsExportDone(false);
            setVerifiedToken(null);
            // Optional: Console log untuk audit trail client-side debugging
            console.log("[MaintenanceFlow] Parameters changed. Security context reset.");
        }
    };

    /**
     * Handler saat Secure Export selesai (File terdownload).
     * Membuka kunci Verification Zone.
     */
    const handleExportSuccess = () => {
        setIsExportDone(true);
        // Kita reset token jika user melakukan re-export untuk memastikan file terbaru yang diverifikasi
        setVerifiedToken(null);
    };

    /**
     * Handler saat Verification Zone berhasil memindai file & menemukan token.
     * Membuka kunci Hazard Zone.
     */
    const handleTokenVerified = (token: string) => {
        setVerifiedToken(token);
    };

    /**
     * Handler saat Pruning Eksekusi BERHASIL di Backend.
     * Finalisasi proses.
     */
    const handlePruneSuccess = (deletedCount: number) => {
        // 1. Visual Feedback (Native Alert atau Toast library jika ada)
        // Menggunakan timeout agar tidak memblokir render update React
        setTimeout(() => {
            alert(`✅ SUKSES: Sistem telah menghapus ${new Intl.NumberFormat('id-ID').format(deletedCount)} data arsip secara permanen.`);
        }, 100);

        // 2. Refresh Data (Agar grafik storage turun secara real-time)
        fetchStats();

        // 3. Reset Workflow (Kunci kembali semua pintu)
        setIsExportDone(false);
        setVerifiedToken(null);
        // Kita biarkan selectedEntity/Cutoff tetap, agar user bisa lanjut export lagi jika perlu
    };

    // ---------------------------------------------------------------------------
    // RENDER VIEW
    // ---------------------------------------------------------------------------

    // A. Error State (Blocking)
    if (error) {
        return (
            <Alert variant="destructive" className="my-6 animate-in zoom-in-95">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Gagal Memuat Sistem Maintenance</AlertTitle>
                <AlertDescription className="flex flex-col gap-3 mt-2">
                    <p>{error}</p>
                    <Button variant="outline" size="sm" onClick={fetchStats} className="w-fit bg-white/50 hover:bg-white">
                        <RefreshCcw className="mr-2 h-3 w-3" /> Coba Koneksi Ulang
                    </Button>
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">

            {/* --- SECTION 1: HEADER & CONTROL BAR --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm gap-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-500">Status Sistem Database</span>
                        {!isLoading && <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
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
                    // Skeleton Loading yang proporsional dengan StatsPanel
                    <Card className="h-75 animate-pulse bg-slate-100 border-none rounded-xl" />
                ) : (
                    <StatsPanel stats={stats} />
                )}
            </div>

            {/* --- SECTION 3: THE SECURITY PIPELINE --- 
          Grid 2 Kolom: Kiri (Persiapan) vs Kanan (Eksekusi)
      */}
            <div className="grid gap-8 lg:grid-cols-2 items-start">

                {/* KOLOM KIRI: VALIDATION FLOW */}
                <div className="space-y-6">

                    {/* STEP 1: EXPORT (Source of Truth) */}
                    <div className="relative">
                        <ExportControl
                            onParamsChange={handleParamChange}
                            onExportSuccess={handleExportSuccess}
                        />
                        {/* Visual connector line to next step */}
                        {isExportDone && (
                            <div className="absolute left-1/2 -bottom-6 w-0.5 h-6 bg-green-300 -z-10" />
                        )}
                    </div>

                    {/* STEP 2: VERIFICATION (The Bridge) */}
                    {/* Hanya render/aktif jika export selesai untuk menjaga fokus UI */}
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

                {/* KOLOM KANAN: EXECUTION FLOW */}
                {/* STEP 3: HAZARD ZONE (The Action) */}
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