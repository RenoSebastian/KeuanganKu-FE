import { useState } from "react";
import { AxiosResponse } from "axios";
import { DownloadResultData } from "@/components/features/shared/post-download-action";
import { toast } from "sonner";

// [UPDATED] Menggunakan standar arsitektur ekspor universal Anda
import { executeUniversalExport } from "@/utils/universal-export-engine";

export function useSimulationDownload() {
    const [isLoading, setIsLoading] = useState(false);
    const [pdfResult, setPdfResult] = useState<DownloadResultData | null>(null);
    const [mgcToken, setMgcToken] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    /**
     * Menggunakan Inversion of Control.
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
            throw error; // Lempar error kembali agar komponen UI bisa memicu Toast
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveMgc = async () => {
        if (mgcToken && pdfResult) {
            try {
                // 1. Siapkan nama dan ubah string token ke biner (Blob)
                const mgcName = pdfResult.filename.replace(/\.[^/.]+$/, "") + ".mgc";
                const mgcBlob = new Blob([mgcToken], { type: 'application/octet-stream' });

                // 2. Lempar ke Universal Export Engine
                const exportStatus = await executeUniversalExport(mgcBlob, mgcName);

                if (exportStatus === 'SHARED') {
                    toast.success("File Backup (.mgc) siap dibagikan.");
                } else if (exportStatus === 'DOWNLOADED') {
                    toast.success("File Backup (.mgc) berhasil disimpan.");
                }
            } catch (error) {
                console.error("Export Error (MGC):", error);
                toast.error("Gagal menyimpan file backup.");
            }
        }
    };

    return { execute, isLoading, pdfResult, isModalOpen, setIsModalOpen, handleSaveMgc };
}