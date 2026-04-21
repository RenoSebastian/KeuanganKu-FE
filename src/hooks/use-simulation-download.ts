import { useState } from "react";
import { AxiosResponse } from "axios";
import { DownloadResultData } from "@/components/features/shared/post-download-action";
import { downloadMgcFile } from "@/lib/utils";

export function useSimulationDownload() {
    const [isLoading, setIsLoading] = useState(false);
    const [pdfResult, setPdfResult] = useState<DownloadResultData | null>(null);
    const [mgcToken, setMgcToken] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    /**
     * [UPDATED] Menggunakan Inversion of Control.
     * Menerima Promise langsung dari financialService (Delegation).
     * Memastikan logic adapter data di layer Service tetap tereksekusi.
     */
    const execute = async (simulationRequest: Promise<AxiosResponse<Blob>>) => {
        setIsLoading(true);
        try {
            const response = await simulationRequest;

            // 1. Ambil Nama File PDF dari header Content-Disposition
            const disposition = response.headers["content-disposition"];
            const token = response.headers["x-mgc-token"]; // Ambil token MGC dari header

            let filename = "simulasi-keuangan.pdf";
            if (disposition) {
                const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) filename = match[1].replace(/['"]/g, "");
            }

            // 2. Siapkan data PDF untuk PostDownloadAction (Modal Universal Export)
            const pdfFile = new File([response.data], filename, {
                type: response.data.type || "application/pdf",
                lastModified: Date.now()
            });
            const pdfUrl = window.URL.createObjectURL(pdfFile);

            setPdfResult({ file: pdfFile, url: pdfUrl, filename });
            setMgcToken(token || null);
            setIsModalOpen(true); // Tampilkan modal sebagai notifikasi "Selesai"

        } catch (error) {
            console.error("Gagal menjalankan simulasi:", error);
            throw error; // Lempar error kembali agar komponen UI (contoh: Button handler) bisa memicu Toast
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveMgc = () => {
        if (mgcToken && pdfResult) {
            // [FIXED] Ganti ekstensi file menggunakan Regex (lebih aman daripada .replace statis)
            const mgcName = pdfResult.filename.replace(/\.[^/.]+$/, "") + ".mgc";
            downloadMgcFile(mgcName, mgcToken);
        }
    };

    return { execute, isLoading, pdfResult, isModalOpen, setIsModalOpen, handleSaveMgc };
}