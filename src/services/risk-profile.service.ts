import api from "@/lib/axios";
import {
    RiskProfilePayload,
    RiskProfileServiceResponse,
    RiskProfileSimulationResult
} from "@/lib/types/risk-profile";

export const riskProfileService = {
    /**
     * [CORE] Agent Simulation Flow
     * Mengirim data kuesioner, menerima PDF Stream untuk download, 
     * dan membaca Header Token untuk visualisasi data di UI.
     * * Endpoint: POST /financial/simulation/risk-profile-pdf
     */
    simulateRiskProfile: async (payload: RiskProfilePayload): Promise<RiskProfileServiceResponse> => {
        try {
            const response = await api.post(
                "/financial/simulation/risk-profile-pdf",
                payload,
                {
                    responseType: "blob", // [CRITICAL] Wajib blob agar PDF tidak corrupt
                    headers: {
                        "Accept": "application/pdf",
                    },
                }
            );

            // 1. Ambil Token dari Header (Berisi data hasil kalkulasi JSON)
            // Axios secara otomatis mengubah nama header menjadi lowercase
            const mgcToken = response.headers['x-mgc-token'];

            if (!mgcToken) {
                throw new Error("Security Token (.mgc) tidak ditemukan dalam response server.");
            }

            // 2. Decode Token di Client-Side (Stateless Decoding)
            // Format Token Backend: PayloadBase64.Signature
            const [payloadBase64] = mgcToken.split('.');

            if (!payloadBase64) {
                throw new Error("Format token simulasi tidak valid.");
            }

            let decodedData: RiskProfileSimulationResult;
            try {
                // Decode Base64 ke JSON String -> Parse ke Object
                const jsonString = atob(payloadBase64);
                decodedData = JSON.parse(jsonString);
            } catch (e) {
                console.error("Token Decode Error:", e);
                throw new Error("Gagal membaca data hasil simulasi dari token.");
            }

            // 3. Buat URL Blob untuk PDF agar bisa didownload/preview
            const blob = new Blob([response.data], { type: "application/pdf" });
            const pdfUrl = window.URL.createObjectURL(blob);

            // 4. Return Paket Lengkap ke Component
            return {
                pdfUrl,
                token: mgcToken,
                data: decodedData
            };

        } catch (error: any) {
            console.error("Risk Profile Simulation Error:", error);

            // [EDGE CASE HANDLER]
            // Jika response error (misal 400 Bad Request), axios tetap mengembalikannya sebagai Blob karena 'responseType: blob'.
            // Kita perlu konversi Blob error kembali ke JSON text untuk membaca pesan error asli dari Backend.
            if (error.response?.data instanceof Blob) {
                const errorBlob = error.response.data;
                const errorText = await errorBlob.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    throw new Error(errorJson.message || "Gagal memproses simulasi.");
                } catch (jsonError) {
                    // Jika gagal parse JSON, berarti error raw/network
                    throw new Error("Terjadi kesalahan sistem saat memproses PDF.");
                }
            }

            throw new Error(error.response?.data?.message || error.message || "Gagal menghubungi server.");
        }
    },

    /**
     * [UTILITY] Decode Token Manual via Backend (Optional)
     * Digunakan jika kita ingin memvalidasi signature token saat fitur 'Load Data / Upload .mgc'
     */
    decodeSimulationToken: async (tokenString: string): Promise<RiskProfileSimulationResult> => {
        try {
            const response = await api.post("/financial/simulation/decode", {
                simulationToken: tokenString
            });

            // Backend mengembalikan struktur: { message: "...", data: { client, financial, result, ... } }
            // Kita mapping agar sesuai interface RiskProfileSimulationResult di FE
            const raw = response.data.data;

            // Mapping respon backend ke struktur frontend jika ada perbedaan
            return {
                meta: {
                    version: "1.0",
                    generatedAt: raw.last_simulation_date || new Date().toISOString(),
                    agentId: "unknown",
                    module: "RISK_PROFILE"
                },
                client: raw.client,
                financial: raw.financial,
                result: raw.result || raw.financialRatios // Fallback property name
            } as RiskProfileSimulationResult;

        } catch (error: any) {
            console.error("Token Validate Error:", error);
            throw new Error(error.response?.data?.message || "File simulasi rusak atau tidak valid.");
        }
    }
};