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

            const response = await api.get(`/admin/retention/export?${params.toString()}`, {
                responseType: "blob", // Response diperlakukan sebagai File (Binary/Blob)
                timeout: 60000,
            });

            // 3. Validasi Cerdas (Smart Content-Type Check) [PERBAIKAN DISINI]
            const contentType = response.headers["content-type"];

            if (contentType && contentType.includes("application/json") && response.data.type === "application/json") {
                // Backend mengirim JSON. Kita harus intip isinya:
                // Apakah ini JSON Data (Success) atau JSON Error Message (Fail)?
                const textData = await response.data.text();

                try {
                    const jsonBody = JSON.parse(textData);

                    // Logic Guard: Jika tidak ada 'records' dan ada 'message', kemungkinan besar Error.
                    // Jika ada 'records' atau 'metadata', berarti ini FILE EXPORT yang valid.
                    if (!jsonBody.records && !jsonBody.metadata && jsonBody.message) {
                        throw new Error(jsonBody.message);
                    }

                    // Jika lolos check di atas, berarti ini adalah file JSON yang valid. 
                    // Biarkan kode lanjut ke Step 5 (Download).
                } catch (e) {
                    // Jika gagal parse atau memang error message, lempar ke catch block utama
                    if (e instanceof Error) throw e;
                }
            }

            // 4. Penamaan File
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
            window.URL.revokeObjectURL(url);

            if (onSuccess) onSuccess();

        } catch (error: any) {
            console.error("Export Error:", error);
            let message = "Terjadi kesalahan saat mengunduh data.";

            if (error instanceof AxiosError) {
                if (error.response?.status === 404) message = "Data tidak ditemukan untuk periode tersebut.";
                if (error.response?.status === 403) message = "Anda tidak memiliki izin akses.";
                if (error.code === 'ECONNABORTED') message = "Koneksi timeout. Data terlalu besar.";
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