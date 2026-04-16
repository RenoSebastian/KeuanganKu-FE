import { useState } from "react";
import { AxiosError } from "axios";
import api from "@/lib/axios";
import { ExportQuery } from "@/lib/types/retention";
/**
 * [SINKRONISASI ARSITEKTUR]
 * Menggunakan Universal Export Engine untuk menangani polimorfisme file (PDF/MGC)
 * dan proteksi environment (Web vs PWA Android).
 */
import { executeUniversalExport } from "@/utils/universal-export-engine";

export interface UseSecureExportReturn {
    isLoading: boolean;
    progress: number;
    /**
     * Tipe kembalian void menegaskan prinsip High Cohesion:
     * Hook hanya mengatur state dan pemicu alur, eksekusi file adalah tanggung jawab Engine.
     */
    triggerExport: (query: ExportQuery) => Promise<void>;
}

export function useSecureExport(
    onSuccess?: () => void,
    onError?: (msg: string) => void
): UseSecureExportReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState<number>(0);

    const triggerExport = async (query: ExportQuery): Promise<void> => {
        // 1. Validasi Input
        if (!query.entityType || !query.cutoffDate) {
            onError?.("Mohon lengkapi semua form sebelum export.");
            return;
        }

        setIsLoading(true);
        setProgress(0);

        try {
            // 2. Request ke Backend
            const params = new URLSearchParams({
                entityType: query.entityType,
                cutoffDate: query.cutoffDate,
            });

            const response = await api.get(`/admin/retention/export?${params.toString()}`, {
                responseType: "blob", // Aliran biner
                timeout: 60000,
                onDownloadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percentCompleted);
                    }
                },
            });

            // 3. Validasi Cerdas (Smart Content-Type Check)
            const contentType = response.headers["content-type"] || "";

            // Jika backend mengembalikan JSON (biasanya pesan error yang dibungkus blob)
            if (contentType.includes("application/json")) {
                const textData = await response.data.text();
                try {
                    const jsonBody = JSON.parse(textData);
                    throw new Error(jsonBody.message || "Gagal melakukan export data.");
                } catch (e) {
                    throw new Error("Terjadi kesalahan format response dari server.");
                }
            }

            // 4. Penamaan File & Restorasi Nama Asli dari Header
            const disposition = response.headers["content-disposition"];
            let filename = `secure-archive-${query.entityType.toLowerCase()}-${query.cutoffDate}.mgc`;

            if (disposition) {
                const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                const filenameStarMatch = disposition.match(/filename\*=UTF-8''([^;\n]*)/);

                if (filenameStarMatch && filenameStarMatch[1]) {
                    filename = decodeURIComponent(filenameStarMatch[1]);
                } else if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, "");
                }
            }

            /**
             * 5. EKSEKUSI VIA UNIVERSAL ENGINE
             * Mengirim Blob mentah ke Engine. Engine akan memutuskan:
             * - Jalur navigator.share (Jika PWA Android) -> Bypass Permission Denied.
             * - Jalur Direct Download (Jika Browser Desktop).
             */
            const exportResult = await executeUniversalExport(response.data, filename);

            // 6. Penanganan Fallback & Cleanup State
            if (exportResult === 'SHARE_CANCELLED') {
                // User menutup dialog share Android secara manual
                setProgress(0);
                return;
            }

            setProgress(100);
            if (onSuccess) onSuccess();

        } catch (error: any) {
            console.error("[useSecureExport] Critical Export Failure:", error);
            setProgress(0);

            let message = "Terjadi kesalahan saat mengunduh data.";

            if (error instanceof AxiosError) {
                if (error.response?.status === 404) message = "Data tidak ditemukan untuk periode tersebut.";
                else if (error.response?.status === 403) message = "Anda tidak memiliki izin akses.";
                else if (error.code === 'ECONNABORTED') message = "Koneksi timeout. Data mungkin terlalu besar.";
            } else if (error instanceof Error) {
                message = error.message;
            }

            if (onError) onError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return { isLoading, progress, triggerExport };
}