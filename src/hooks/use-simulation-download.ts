import { useState } from "react";
import api from "@/lib/axios";
import { DownloadResultData } from "@/components/features/shared/post-download-action";
import { downloadMgcFile } from "@/lib/utils";

export function useSimulationDownload() {
    const [isLoading, setIsLoading] = useState(false);
    const [pdfResult, setPdfResult] = useState<DownloadResultData | null>(null);
    const [mgcToken, setMgcToken] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const execute = async (endpoint: string, payload: any) => {
        setIsLoading(true);
        try {
            const response = await api.post(endpoint, payload, { responseType: "blob" });

            // 1. Ambil Nama File PDF dari header Content-Disposition
            const disposition = response.headers["content-disposition"];
            const token = response.headers["x-mgc-token"]; // Ambil token simpan game

            let filename = "simulasi-keuangan.pdf";
            if (disposition) {
                const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) filename = match[1].replace(/['"]/g, "");
            }

            // 2. Siapkan data PDF untuk PostDownloadAction (Modal)
            const pdfFile = new File([response.data], filename, { type: "application/pdf" });
            const pdfUrl = window.URL.createObjectURL(pdfFile);

            setPdfResult({ file: pdfFile, url: pdfUrl, filename });
            setMgcToken(token);
            setIsModalOpen(true); // Tampilkan modal sebagai notifikasi "Selesai"

        } catch (error) {
            console.error("Gagal simulasi:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveMgc = () => {
        if (mgcToken && pdfResult) {
            // Ganti .pdf menjadi .mgc agar bisa dibaca useFileInspector nanti
            const mgcName = pdfResult.filename.replace(".pdf", ".mgc");
            downloadMgcFile(mgcName, mgcToken);
        }
    };

    return { execute, isLoading, pdfResult, isModalOpen, setIsModalOpen, handleSaveMgc };
}