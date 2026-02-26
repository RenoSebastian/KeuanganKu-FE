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
     * Endpoint: POST /financial/simulation/risk-profile-pdf
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
     * Mendecode token .mgc menjadi data JSON yang bisa dibaca frontend
     * [UPDATED]: Dilengkapi sanitasi token & mapping data yang robust
     */
    decodeSimulationToken: async (token: string): Promise<any> => {
        try {
            // 1. SANITASI TOKEN (PENTING UNTUK MENGHINDARI ERROR 400)
            // - Hapus whitespace kiri/kanan
            // - Hapus karakter BOM (\uFEFF) yang sering muncul dari Notepad
            // - Hapus tanda kutip ganda di awal/akhir jika ada
            const cleanToken = token
                .trim()
                .replace(/^\uFEFF/, '')
                .replace(/^"|"$/g, '');

            if (!cleanToken) throw new Error("Konten file token kosong.");

            // 2. Request ke Backend
            const response = await api.post('/financial/simulation/decode', { token: cleanToken });

            // 3. Handle Response (Flexible Mapping)
            // Backend bisa mengembalikan response.data langsung atau terbungkus
            const data = response.data?.data || response.data;

            // Validasi dasar
            if (!data) throw new Error("Data hasil decode kosong.");

            // [FIX LOGIC]
            // Jika data sudah memiliki struktur 'meta', kembalikan langsung.
            // Tidak perlu mapping manual 'last_simulation_date' yang menyebabkan error.
            if (data.meta && data.client && (data.financial || data.result)) {
                return data;
            }

            // [FALLBACK]: Mapping untuk struktur legacy (jika backend berubah format)
            // (Tetapi berdasarkan log error Anda, bagian ini yang memicu masalah karena 'raw' tidak sesuai ekspektasi)
            return {
                meta: {
                    version: "1.0",
                    generatedAt: data.created_at || new Date().toISOString(), // Fallback ke created_at atau now
                    agentId: "unknown",
                    module: "RISK_PROFILE"
                },
                client: {
                    name: data.client_name || data.client?.name || "",
                    dob: data.client_dob || data.client?.dob || "",
                    city: data.client_city || data.client?.city || "",
                    job: data.client_job || data.client?.job || "",
                    phone: data.client_phone || data.client?.phone || ""
                },
                financial: {
                    answers: data.answers || data.financial?.answers || [] // Pastikan ini sesuai dengan struktur legacy jika ada
                },
                result: data.result || null
            };

        } catch (error: any) {
            console.error("Token Validate Error:", error);
            // Lempar error message yang bersih ke UI
            const msg = error.response?.data?.message || error.message;
            throw new Error(Array.isArray(msg) ? msg[0] : msg);
        }
    },
};