import { useState } from "react";
import { AxiosError } from "axios";
import api from "@/lib/axios";
import { ExportQuery } from "@/lib/types/retention";

interface UseSecureExportReturn {
    isLoading: boolean;
    triggerExport: (query: ExportQuery) => Promise<void>;
}

export function useSecureExport(
    onSuccess?: () => void,
    onError?: (msg: string) => void
): UseSecureExportReturn {
    const [isLoading, setIsLoading] = useState(false);

    const triggerExport = async (query: ExportQuery) => {
        // 1. Validasi Input
        if (!query.entityType || !query.cutoffDate) {
            onError?.("Mohon lengkapi semua form sebelum export.");
            return;
        }

        setIsLoading(true);

        try {
            // 2. Request ke Backend
            const params = new URLSearchParams({
                entityType: query.entityType,
                cutoffDate: query.cutoffDate,
            });

            // Endpoint ini sekarang mengembalikan application/octet-stream (binary blob)
            const response = await api.get(`/admin/retention/export?${params.toString()}`, {
                responseType: "blob", // [CRITICAL] Memaksa Axios untuk menerima aliran biner ke RAM
                timeout: 60000,
            });

            // 3. Validasi Cerdas (Smart Content-Type Check & Error Handling)
            // Meskipun kita berharap octet-stream, jika terjadi error (misal 404/400),
            // NestJS akan mengembalikan JSON message yang terbungkus dalam tipe blob.
            const contentType = response.headers["content-type"] || "";

            if (contentType.includes("application/json")) {
                // Konversi blob yang berisi error message kembali menjadi teks JSON
                const textData = await response.data.text();
                try {
                    const jsonBody = JSON.parse(textData);
                    // Lempar pesan error dari server agar ditangkap oleh block catch
                    throw new Error(jsonBody.message || "Gagal melakukan export data.");
                } catch (e) {
                    throw new Error("Terjadi kesalahan format response dari server.");
                }
            }

            // 4. Penamaan File & Restorasi Ekstensi Asli
            // Kita mengambil nama asli dari Content-Disposition yang telah diekspos server
            const disposition = response.headers["content-disposition"];

            // Default nama file jika header tidak terbaca (Sistem kompensasi)
            let filename = `secure-archive-${query.entityType.toLowerCase()}-${query.cutoffDate}.mgc`;

            if (disposition && disposition.indexOf("attachment") !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    // Membersihkan tanda kutip dari nama file hasil RegExp
                    filename = matches[1].replace(/['"]/g, "");
                }
            }

            // 5. Trigger Browser Download (Blob Transformation)
            // Bypass mekanisme DownloadManager Android dengan menulis blob ke Local Storage System
            const blob = new Blob([response.data], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.style.display = 'none'; // Sembunyikan elemen bayangan
            link.href = url;
            link.setAttribute("download", filename); // Paksa menggunakan ekstensi .mgc dari server

            // Append ke DOM diperlukan untuk kompatibilitas browser/WebView tertentu
            document.body.appendChild(link);
            link.click();

            // 6. Cleanup (Memori Management)
            // Menghapus elemen link dan membebaskan RAM dari URL object
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);

            if (onSuccess) onSuccess();

        } catch (error: any) {
            console.error("Export Error:", error);
            let message = "Terjadi kesalahan saat mengunduh data.";

            if (error instanceof AxiosError) {
                if (error.response?.status === 404) message = "Data tidak ditemukan untuk periode tersebut.";
                else if (error.response?.status === 403) message = "Anda tidak memiliki izin akses.";
                else if (error.code === 'ECONNABORTED') message = "Koneksi timeout. Data terlalu besar.";
                // Jika error.response ada tapi bukan json (misal HTML timeout nginx), gunakan pesan default
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