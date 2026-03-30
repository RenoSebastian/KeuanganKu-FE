import { useState } from "react";
import { AxiosError } from "axios";
import api from "@/lib/axios";
import { ExportQuery } from "@/lib/types/retention";
import { DownloadResultData } from "@/components/features/shared/post-download-action"; // Pastikan path ini sesuai dengan lokasi komponen Anda

interface UseSecureExportReturn {
    isLoading: boolean;
    // Mengubah return type agar mengembalikan promise berisi data file
    triggerExport: (query: ExportQuery) => Promise<DownloadResultData | undefined>;
}

export function useSecureExport(
    onSuccess?: () => void,
    onError?: (msg: string) => void
): UseSecureExportReturn {
    const [isLoading, setIsLoading] = useState(false);

    const triggerExport = async (query: ExportQuery): Promise<DownloadResultData | undefined> => {
        // 1. Validasi Input
        if (!query.entityType || !query.cutoffDate) {
            onError?.("Mohon lengkapi semua form sebelum export.");
            return undefined;
        }

        setIsLoading(true);

        try {
            // 2. Request ke Backend
            const params = new URLSearchParams({
                entityType: query.entityType,
                cutoffDate: query.cutoffDate,
            });

            // Endpoint ini mengembalikan application/octet-stream (binary blob)
            const response = await api.get(`/admin/retention/export?${params.toString()}`, {
                responseType: "blob", // [CRITICAL] Memaksa Axios untuk menerima aliran biner ke RAM
                timeout: 60000,
            });

            // 3. Validasi Cerdas (Smart Content-Type Check & Error Handling)
            const contentType = response.headers["content-type"] || "";

            if (contentType.includes("application/json")) {
                // Konversi blob yang berisi error message kembali menjadi teks JSON
                const textData = await response.data.text();
                try {
                    const jsonBody = JSON.parse(textData);
                    throw new Error(jsonBody.message || "Gagal melakukan export data.");
                } catch (e) {
                    throw new Error("Terjadi kesalahan format response dari server.");
                }
            }

            // 4. Penamaan File & Restorasi Ekstensi Asli
            const disposition = response.headers["content-disposition"];
            let filename = `secure-archive-${query.entityType.toLowerCase()}-${query.cutoffDate}.mgc`;

            if (disposition && disposition.indexOf("attachment") !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, "");
                }
            }

            // 5. Transformasi ke Objek File (Refactor Utama)
            // Membungkus data ke dalam objek File agar kompatibel dengan navigator.share di Android OS
            const file = new File([response.data], filename, {
                type: 'application/octet-stream',
                lastModified: Date.now()
            });
            const url = window.URL.createObjectURL(file);

            if (onSuccess) onSuccess();

            // Mengembalikan entitas utuh ke pemanggil
            return { file, url, filename };

        } catch (error: any) {
            console.error("Export Error:", error);
            let message = "Terjadi kesalahan saat mengunduh data.";

            if (error instanceof AxiosError) {
                if (error.response?.status === 404) message = "Data tidak ditemukan untuk periode tersebut.";
                else if (error.response?.status === 403) message = "Anda tidak memiliki izin akses.";
                else if (error.code === 'ECONNABORTED') message = "Koneksi timeout. Data terlalu besar.";
            } else if (error instanceof Error) {
                message = error.message;
            }

            if (onError) onError(message);
            return undefined;
        } finally {
            setIsLoading(false);
        }
    };

    return { isLoading, triggerExport };
}