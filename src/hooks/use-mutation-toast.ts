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

        const toastId = toast.loading(loadingMessage);

        try {
            const result = await promise;
            toast.success(successMessage, { id: toastId });
            return result;
        } catch (error: any) {
            console.error("❌ Mutation Error Captured:", error);

            // Logika Ekstraksi Pesan Error (Anti Ghost Error)
            let finalErrorMessage = "Terjadi kesalahan pada sistem.";

            if (error instanceof AxiosError) {
                const backendData = error.response?.data;

                // Cek apakah ada message dari backend (bisa string atau array dari ValidationPipe NestJS)
                const rawMessage = backendData?.message;

                if (Array.isArray(rawMessage)) {
                    finalErrorMessage = rawMessage[0]; // Ambil pesan validasi pertama
                } else if (typeof rawMessage === "string" && rawMessage.length > 0) {
                    finalErrorMessage = rawMessage;
                } else if (error.message) {
                    finalErrorMessage = error.message; // Fallback ke pesan Axios
                }
            } else if (error instanceof Error) {
                finalErrorMessage = error.message;
            }

            toast.error(errorMessage || finalErrorMessage, {
                id: toastId,
                duration: 5000, // Error ditampilkan lebih lama agar terbaca
            });

            throw error; // Lempar kembali agar komponen pemanggil bisa menangani state lokal (misal: setIsSaving(false))
        }
    };

    return { showMutationToast };
}