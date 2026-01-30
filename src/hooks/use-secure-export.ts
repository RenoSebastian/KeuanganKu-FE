import { useState } from "react";
import { AxiosError } from "axios";
import api from "@/lib/axios"; // Menggunakan instance axios yang sudah ada (termasuk Auth Interceptor)
import { ExportQuery, RetentionEntityType } from "@/lib/types/retention";

interface UseSecureExportReturn {
    isLoading: boolean;
    triggerExport: (query: ExportQuery) => Promise<void>;
}

/**
 * Custom Hook untuk menangani Secure File Download.
 * * MASALAH YANG DISELESAIKAN:
 * Download file dari endpoint yang dilindungi (JWT Guard) tidak bisa menggunakan
 * window.location.href atau tag <a> biasa karena tidak membawa Header Authorization.
 * * SOLUSI:
 * 1. Request data menggunakan Axios dengan responseType 'blob'.
 * 2. Buat URL objek sementara di memori browser (window.URL.createObjectURL).
 * 3. Buat elemen <a> virtual untuk men-trigger download native.
 * 4. Hapus URL objek untuk membersihkan memori (Garbage Collection).
 */
export function useSecureExport(
    onSuccess?: () => void,
    onError?: (msg: string) => void
): UseSecureExportReturn {
    const [isLoading, setIsLoading] = useState(false);

    const triggerExport = async (query: ExportQuery) => {
        // 1. Validasi Input (Double Check sebelum kirim request)
        if (!query.entityType || !query.cutoffDate) {
            onError?.("Mohon lengkapi semua form sebelum export.");
            return;
        }

        setIsLoading(true);

        try {
            // 2. Request ke Backend dengan Blob Type
            // Kita construct query params manual
            const params = new URLSearchParams({
                entityType: query.entityType,
                cutoffDate: query.cutoffDate,
            });

            // NOTE: Axios interceptor di 'src/lib/axios.ts' otomatis menyisipkan Token Bearer
            const response = await api.get(`/admin/retention/export?${params.toString()}`, {
                responseType: "blob", // KUNCI UTAMA: Memberitahu axios response adalah binary
                timeout: 60000, // 60 detik timeout untuk file besar
            });

            // 3. Validasi Content-Type (Pastikan yang diterima JSON/Binary, bukan HTML Error)
            const contentType = response.headers["content-type"];
            if (contentType && contentType.includes("application/json") && response.data.type === "application/json") {
                // Edge Case: Backend mengembalikan JSON Error (misal 404), tapi axios menganggapnya blob
                // Kita perlu parse blob tersebut untuk membaca pesan error
                const textData = await response.data.text();
                const errorJson = JSON.parse(textData);
                throw new Error(errorJson.message || "Gagal mengunduh file.");
            }

            // 4. Buat Virtual Link untuk Download
            // Mengambil nama file dari header content-disposition jika ada, atau generate default
            const disposition = response.headers["content-disposition"];
            let filename = `secure-archive-${query.entityType.toLowerCase()}-${query.cutoffDate}.json`;

            if (disposition && disposition.indexOf("attachment") !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, "");
                }
            }

            // 5. Trigger Browser Download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();

            // 6. Cleanup
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url); // Mencegah memory leak

            if (onSuccess) onSuccess();

        } catch (error: any) {
            console.error("Export Error:", error);
            let message = "Terjadi kesalahan saat mengunduh data.";

            if (error instanceof AxiosError) {
                if (error.response?.status === 404) message = "Data tidak ditemukan untuk periode tersebut.";
                if (error.response?.status === 403) message = "Anda tidak memiliki izin akses.";
                if (error.code === 'ECONNABORTED') message = "Koneksi timeout. Data terlalu besar, silakan perkecil rentang waktu.";
            } else if (error instanceof Error) {
                message = error.message;
            }

            if (onError) onError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return { isLoading, triggerExport };
}