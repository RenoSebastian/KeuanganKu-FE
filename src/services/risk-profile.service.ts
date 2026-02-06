import api from "@/lib/axios"; // Menggunakan instance axios yang sudah ada di project
import { RiskProfilePayload, RiskProfileResponse } from "@/lib/types/risk-profile";

export const riskProfileService = {
    /**
     * Mengirim jawaban kuesioner ke Backend untuk dihitung.
     * Endpoint ini Stateless (tidak menyimpan data ke DB).
     */
    calculateProfile: async (payload: RiskProfilePayload): Promise<RiskProfileResponse> => {
        try {
            const response = await api.post<RiskProfileResponse>(
                "/financial/simulation/risk-profile",
                payload
            );
            return response.data;
        } catch (error: any) {
            console.error("Risk Profile Calculation Error:", error);
            throw new Error(error.response?.data?.message || "Gagal menghitung profil risiko.");
        }
    },

    /**
     * Mengirim hasil kalkulasi (JSON) kembali ke Backend untuk digenerate menjadi PDF.
     * Backend akan mengembalikan Binary Stream (Blob).
     */
    downloadPdf: async (resultData: RiskProfileResponse): Promise<void> => {
        try {
            const response = await api.post(
                "/financial/export/risk-profile-pdf",
                resultData, // Kirim balik full JSON result
                {
                    responseType: "blob", // PENTING: Agar axios membaca response sebagai file, bukan text/json
                    headers: {
                        "Accept": "application/pdf",
                    },
                }
            );

            // --- LOGIC DOWNLOAD BROWSER ---
            // 1. Buat URL objek dari Blob
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);

            // 2. Buat elemen <a> fiktif untuk men-trigger download
            const link = document.createElement("a");
            link.href = url;

            // 3. Ambil nama file dari Header (jika ada) atau generate sendiri
            const contentDisposition = response.headers["content-disposition"];
            let filename = `Risk_Profile_Report_${new Date().getTime()}.pdf`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch && filenameMatch.length === 2) {
                    filename = filenameMatch[1];
                }
            }

            link.setAttribute("download", filename);
            document.body.appendChild(link);

            // 4. Klik & Bersihkan
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error: any) {
            console.error("PDF Generation Error:", error);
            // Handle jika response error tapi dalam bentuk Blob (misal 400/500)
            if (error.response?.data instanceof Blob) {
                const text = await error.response.data.text();
                try {
                    const json = JSON.parse(text);
                    throw new Error(json.message || "Gagal mengunduh PDF.");
                } catch {
                    throw new Error("Terjadi kesalahan saat mengunduh PDF.");
                }
            }
            throw new Error("Gagal mengunduh PDF.");
        }
    },
};