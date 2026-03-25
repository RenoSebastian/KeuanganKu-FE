"use client";

import { toast } from "sonner";
import { AxiosError } from "axios";

interface MutationToastOptions {
    loadingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
}

export function useMutationToast() {
    /**
     * Menjalankan promise (mutasi) dengan feedback toast otomatis
     * @param promise Fungsi async/Axios yang mengembalikan promise
     * @param options Custom message untuk setiap state
     */
    const showMutationToast = async <T>(
        promise: Promise<T>,
        options: MutationToastOptions = {}
    ): Promise<T | null> => {
        const {
            loadingMessage = "Memproses perubahan...",
            successMessage = "Data berhasil diperbarui",
            errorMessage, // Jika kosong, akan mengekstrak message dari Backend
        } = options;

        // Inisiasi ID Toast untuk melacak dan menghentikan loading nanti
        const toastId = toast.loading(loadingMessage);

        try {
            const result = await promise;
            // Hentikan loading, ubah menjadi success
            toast.success(successMessage, { id: toastId });
            return result;
        } catch (error: any) {
            console.error("❌ Mutation Error Captured:", error);

            // Logika Ekstraksi Pesan Error (Anti Ghost Error)
            let finalErrorMessage = "Terjadi kesalahan tidak terduga pada sistem.";

            if (error instanceof AxiosError) {
                // [FIXED] Fallback Network Error: Menangani kondisi server mati, timeout, atau CORS
                if (!error.response) {
                    finalErrorMessage = "Koneksi ke peladen terputus. Periksa jaringan internet Anda.";
                } else {
                    const backendData = error.response.data;

                    // Cek apakah ada message dari backend (bisa string atau array dari ValidationPipe NestJS)
                    const rawMessage = backendData?.message;

                    if (Array.isArray(rawMessage) && rawMessage.length > 0) {
                        finalErrorMessage = rawMessage[0]; // Ambil pesan validasi pertama agar rapi di UI
                    } else if (typeof rawMessage === "string" && rawMessage.trim() !== "") {
                        finalErrorMessage = rawMessage;
                    } else if (error.message) {
                        finalErrorMessage = error.message; // Fallback ke pesan bawaan Axios
                    }
                }
            } else if (error instanceof Error) {
                finalErrorMessage = error.message;
            }

            // Hentikan loading, ubah menjadi error
            toast.error(errorMessage || finalErrorMessage, {
                id: toastId,
                duration: 5000, // Error ditampilkan lebih lama agar terbaca oleh user
            });

            // Lempar kembali eksepsi agar komponen pemanggil dapat menjalankan blok `finally` (misal: setInternalLoading(false))
            throw error;
        }
    };

    return { showMutationToast };
}