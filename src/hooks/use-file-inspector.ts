import { useState, useCallback } from "react";
import { inspectArchiveFile } from "@/lib/stream-validator"; // Utility dari Fase 1
import { RetentionEntityType, StreamMetadata } from "@/lib/types/retention";

interface UseFileInspectorProps {
    expectedEntityType: RetentionEntityType;
    expectedCutoffDate: string; // YYYY-MM-DD
    onVerificationSuccess: (token: string, metadata: StreamMetadata) => void;
    onVerificationFailed: () => void;
}

interface InspectionState {
    isScanning: boolean;
    progress: number; // 0 - 100 (Simulasi visual karena stream slicing sangat cepat)
    error: string | null;
    fileData: StreamMetadata | null;
}

/**
 * Custom Hook untuk menangani logika inspeksi file arsip secara Client-Side.
 * Menerapkan "Matching Logic" untuk memastikan file yang diupload sesuai konteks.
 */
export function useFileInspector({
    expectedEntityType,
    expectedCutoffDate,
    onVerificationSuccess,
    onVerificationFailed,
}: UseFileInspectorProps) {

    const [state, setState] = useState<InspectionState>({
        isScanning: false,
        progress: 0,
        error: null,
        fileData: null,
    });

    const inspectFile = useCallback(async (file: File) => {
        // 1. Reset State
        setState({ isScanning: true, progress: 10, error: null, fileData: null });
        onVerificationFailed(); // Reset parent state dulu

        try {
            // 2. Simulasi Progress (UX Feedback)
            // Karena inspectArchiveFile menggunakan slicing (O(1)), prosesnya instan (<50ms).
            // Kita beri sedikit delay buatan agar user "merasakan" proses scanning.
            const progressInterval = setInterval(() => {
                setState((prev) => ({ ...prev, progress: Math.min(prev.progress + 20, 90) }));
            }, 100);

            // 3. EXECUTE CORE LOGIC (Stream Validator)
            const result = await inspectArchiveFile(file);

            clearInterval(progressInterval);

            // 4. INTEGRITY CHECK (Result dari Validator)
            if (!result.isValid || !result.metadata || !result.pruneToken) {
                throw new Error(result.error || "File rusak, tidak valid, atau bukan file arsip yang benar.");
            }

            // 5. MATCHING CHECK (Context Validation)
            // Pastikan file yang diupload COCOK dengan yang dipilih di form.
            // Cek Entity Type
            if (result.metadata.entityType !== expectedEntityType) {
                throw new Error(
                    `Mismatch Entity: File ini berisi data '${result.metadata.entityType}', tapi Anda sedang memproses '${expectedEntityType}'.`
                );
            }

            // Cek Tanggal Cutoff (Optional: Strict check)
            // Kita izinkan jika tanggal di file <= tanggal yang dipilih, tapi idealnya harus sama persis
            // untuk konsistensi token hash. Di sini kita strict equality.
            if (result.metadata.cutoffDate !== expectedCutoffDate) {
                throw new Error(
                    `Mismatch Date: File ini untuk cutoff '${result.metadata.cutoffDate}', tidak cocok dengan pilihan Anda '${expectedCutoffDate}'.`
                );
            }

            // 6. Success State
            setState({
                isScanning: false,
                progress: 100,
                error: null,
                fileData: result.metadata,
            });

            // Kembalikan Token Aman ke Parent Component untuk membuka kunci tombol Prune
            onVerificationSuccess(result.pruneToken, result.metadata);

        } catch (err: any) {
            setState((prev) => ({
                ...prev,
                isScanning: false,
                progress: 0,
                error: err.message || "Gagal memverifikasi file.",
            }));
            onVerificationFailed();
        }
    }, [expectedEntityType, expectedCutoffDate, onVerificationSuccess, onVerificationFailed]);

    const resetInspector = () => {
        setState({ isScanning: false, progress: 0, error: null, fileData: null });
        onVerificationFailed();
    };

    return {
        ...state,
        inspectFile,
        resetInspector,
    };
}