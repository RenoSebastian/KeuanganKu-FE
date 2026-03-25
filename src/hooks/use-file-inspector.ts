import { useState, useCallback } from "react";
import { inspectArchiveFile } from "@/lib/stream-validator";
import { RetentionEntityType, StreamMetadata } from "@/lib/types/retention";

interface UseFileInspectorProps {
    expectedEntityType: RetentionEntityType | string;
    expectedCutoffDate: string;
    onVerificationSuccess: (token: string, metadata: StreamMetadata) => void;
    onVerificationFailed: () => void;
}

interface InspectionState {
    isScanning: boolean;
    progress: number;
    error: string | null;
    fileData: StreamMetadata | null;
}

/**
 * Custom Hook untuk menangani kontrol alur inspeksi file secara Client-Side.
 * Mengadopsi prinsip High Cohesion dengan mendelegasikan parsing biner ke stream-validator.
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
        // 1. Reset State & Kunci Otorisasi
        setState({ isScanning: true, progress: 10, error: null, fileData: null });
        onVerificationFailed();

        try {
            // 2. Pre-flight Extension Check (Protected Variations)
            const fileName = file.name.toLowerCase();
            const isValidExtension = fileName.endsWith('.mgc') || fileName.endsWith('.mgc.txt') || fileName.endsWith('.txt');

            if (!isValidExtension) {
                throw new Error("Format file ditolak. Sistem hanya menerima berkas .mgc atau kompensasi teks PWA.");
            }

            // 3. Simulasi Progress (UX Feedback Loop)
            const progressInterval = setInterval(() => {
                setState((prev) => ({ ...prev, progress: Math.min(prev.progress + 20, 90) }));
            }, 100);

            // 4. Delegasi ke Information Expert untuk O(1) Memory Validation
            const result = await inspectArchiveFile(file);

            clearInterval(progressInterval);

            // 5. Assert Integrity
            if (!result.isValid || !result.metadata || !result.pruneToken) {
                throw new Error(result.error || "Integritas struktural file rusak atau Magic Signature tidak ditemukan.");
            }

            // 6. Contextual Matching Logic (Domain Validation)
            // [FIX] Menerapkan Type Intersection untuk menjembatani perbedaan properti BE (entity) dan FE (entityType/module)
            const meta = result.metadata as StreamMetadata & { entity?: string; entityType?: string; module?: string };
            const detectedEntity = meta.entity || meta.entityType || meta.module;
            const cutoffDate = result.metadata.cutoffDate;

            if (detectedEntity !== expectedEntityType) {
                throw new Error(
                    `Mismatch Domain: File payload ini berisi arsitektur '${detectedEntity || 'Unknown'}', sedangkan Anda mencoba memproses '${expectedEntityType}'.`
                );
            }

            // Strict temporal validation untuk mencegah human error saat import
            if (cutoffDate && cutoffDate !== expectedCutoffDate) {
                throw new Error(
                    `Mismatch Temporal: Snapshot direkam pada '${cutoffDate}', tidak sinkron dengan parameter eksekusi '${expectedCutoffDate}'.`
                );
            }

            // 7. State Resolusi Sukses
            setState({
                isScanning: false,
                progress: 100,
                error: null,
                fileData: result.metadata,
            });

            // Handshake token otorisasi ke Parent Component
            onVerificationSuccess(result.pruneToken, result.metadata);

        } catch (err: any) {
            setState((prev) => ({
                ...prev,
                isScanning: false,
                progress: 0,
                error: err.message || "Kesalahan I/O tidak teridentifikasi saat memverifikasi aliran data.",
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