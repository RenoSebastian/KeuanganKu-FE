import api from "@/lib/axios";
import {
    RiskProfilePayload,
    RiskProfileServiceResponse,
    RiskProfileSimulationResult
} from "@/lib/types/risk-profile";

// [NEW] Injeksi Pure Fabrication untuk standardisasi penamaan file
import { generateSimulationFilename } from "@/lib/formatters";

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

            // 1. Ambil Token dari Header
            const mgcToken = response.headers['x-mgc-token'];

            if (!mgcToken) {
                throw new Error("Security Token (.mgc) tidak ditemukan dalam response server.");
            }

            // 2. Decode Token di Client-Side
            const [payloadBase64] = mgcToken.split('.');

            if (!payloadBase64) {
                throw new Error("Format token simulasi tidak valid.");
            }

            let decodedData: RiskProfileSimulationResult;
            try {
                const jsonString = atob(payloadBase64);
                decodedData = JSON.parse(jsonString);
            } catch (e) {
                console.error("Token Decode Error:", e);
                throw new Error("Gagal membaca data hasil simulasi dari token.");
            }

            // 3. Buat URL Blob untuk PDF
            const blob = new Blob([response.data], { type: "application/pdf" });
            const pdfUrl = window.URL.createObjectURL(blob);

            return {
                pdfUrl,
                token: mgcToken,
                data: decodedData
            };

        } catch (error: any) {
            console.error("Risk Profile Simulation Error:", error);

            if (error.response?.data instanceof Blob) {
                const errorBlob = error.response.data;
                const errorText = await errorBlob.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    throw new Error(errorJson.message || "Gagal memproses simulasi.");
                } catch (jsonError) {
                    throw new Error("Terjadi kesalahan sistem saat memproses PDF.");
                }
            }

            throw new Error(error.response?.data?.message || error.message || "Gagal menghubungi server.");
        }
    },

    /**
     * Mendecode token .mgc menjadi data JSON yang bisa dibaca frontend.
     * [UPDATED]: Logic disederhanakan untuk file RAW STRING dengan pembersihan karakter agresif.
     */
    decodeSimulationToken: async (fileContent: string): Promise<any> => {
        try {
            // [LOGIC PEMBERSIHAN]
            // 1. .trim() -> Hapus spasi depan/belakang
            // 2. .replace(/^\uFEFF/, '') -> Hapus BOM (Byte Order Mark) jika file dari Notepad
            // 3. .replace(/\s/g, '') -> Hapus SEMUA spasi & enter (newline) di tengah/akhir string
            // 4. .replace(/^"|"$/g, '') -> Hapus tanda kutip jika string terbungkus kutip

            const cleanToken = fileContent
                .trim()
                .replace(/^\uFEFF/, '')
                .replace(/\s/g, '')
                .replace(/^"|"$/g, '');

            if (!cleanToken) throw new Error("Isi file token kosong setelah dibersihkan.");

            // Kirim ke Backend dengan key 'token' (sesuai payload JSON request)
            const response = await api.post('/financial/simulation/decode', { simulationToken: cleanToken });

            // Handle Response dari Backend (bisa terbungkus .data atau langsung)
            const data = response.data?.data || response.data;

            if (!data) throw new Error("Data hasil decode kosong dari server.");

            // Return data sesuai struktur yang dibutuhkan UI
            if (data.meta && data.client && (data.financial || data.result)) {
                return data;
            }

            // Fallback mapping (Jaga-jaga jika format backend berubah)
            return {
                meta: {
                    version: "1.0",
                    generatedAt: data.created_at || new Date().toISOString(),
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
                    answers: data.answers || data.financial?.answers || []
                },
                result: data.result || null
            };

        } catch (error: any) {
            console.error("Token Validate Error:", error);
            const msg = error.response?.data?.message || error.message;
            // Jika backend mengembalikan array error message, ambil yang pertama
            throw new Error(Array.isArray(msg) ? msg[0] : msg);
        }
    },

    /**
     * [NEW] Helper Controller untuk eksekusi unduhan file.
     * Menerapkan prinsip Information Expert agar UI Component murni fokus pada state & render,
     * bukan mengurus manipulasi DOM (createElement 'a') dan perakitan string nama file secara manual.
     */
    downloadRiskProfileFiles: (pdfUrl: string | null, mgcToken: string | null, clientName: string = "Klien") => {
        if (pdfUrl) {
            const filenamePdf = generateSimulationFilename("Risk Profile", clientName, "pdf");
            const linkPdf = document.createElement('a');
            linkPdf.href = pdfUrl;
            linkPdf.setAttribute('download', filenamePdf);
            document.body.appendChild(linkPdf);
            linkPdf.click();
            linkPdf.remove();
        }

        if (mgcToken) {
            const filenameMgc = generateSimulationFilename("Risk Profile", clientName, "mgc");
            const blobMgc = new Blob([mgcToken], { type: 'text/plain' });
            const urlMgc = window.URL.createObjectURL(blobMgc);
            const linkMgc = document.createElement('a');
            linkMgc.href = urlMgc;
            linkMgc.setAttribute('download', filenameMgc);
            document.body.appendChild(linkMgc);
            linkMgc.click();
            linkMgc.remove();
            window.URL.revokeObjectURL(urlMgc);
        }
    }
};