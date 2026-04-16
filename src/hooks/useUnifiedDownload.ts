'use client';

import { useState, useCallback, useEffect } from 'react';
import { blobUrlManager } from '@/lib/services/blob-url-manager';
import { downloadMgcFile } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * useUnifiedDownload - Centralized hook for all download operations
 * 
 * Manages:
 * - PDF blob fetching and preview
 * - MGC file download
 * - Error handling
 * - Loading states
 * - Automatic cleanup on unmount
 * 
 * Usage:
 *   const { downloadPdf, downloadMgc, isLoading, error, previewUrl } = useUnifiedDownload();
 *   
 *   const handleDownload = async () => {
 *     const blob = await fetchPdfBlob(simulationId);
 *     const url = downloadPdf(blob);
 *     // Open modal with url
 *   };
 */

export interface UseUnifiedDownloadOptions {
    onSuccess?: (filename: string) => void;
    onError?: (error: Error) => void;
    autoToast?: boolean;
}

export const useUnifiedDownload = (options: UseUnifiedDownloadOptions = {}) => {
    const { onSuccess, onError, autoToast = true } = options;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    /**
     * Create preview URL from PDF blob (for modal iframe)
     */
    const createPreviewUrl = useCallback(
        (blob: Blob): string => {
            const url = blobUrlManager.createObjectURL(blob);
            setPreviewUrl(url);
            return url;
        },
        []
    );

    /**
     * Download PDF from blob (creates preview URL)
     */
    const downloadPdf = useCallback(
        async (blob: Blob, options?: { autoPreview?: boolean }): Promise<string> => {
            try {
                setIsLoading(true);
                setError(null);

                const url = createPreviewUrl(blob);

                if (autoToast) {
                    toast.success('PDF siap untuk preview');
                }

                return url;
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Gagal mempersiapkan PDF';
                setError(errorMsg);

                if (autoToast) {
                    toast.error(errorMsg);
                }

                if (onError && err instanceof Error) {
                    onError(err);
                }

                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [createPreviewUrl, autoToast, onError]
    );

    /**
     * Download MGC backup file
     */
    const downloadMgc = useCallback(
        async (token: string, filename: string): Promise<void> => {
            try {
                setIsLoading(true);
                setError(null);

                await downloadMgcFile(filename, token);

                if (autoToast) {
                    toast.success('File .mgc tersimpan');
                }

                if (onSuccess) {
                    onSuccess(filename);
                }
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Gagal mengunduh file .mgc';
                setError(errorMsg);

                if (autoToast) {
                    toast.error(errorMsg);
                }

                if (onError && err instanceof Error) {
                    onError(err);
                }

                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [autoToast, onSuccess, onError]
    );

    /**
     * Trigger actual file download from preview URL
     * (called after user confirms in modal)
     */
    const triggerPdfDownload = useCallback(
        (previewUrl: string, filename: string): void => {
            try {
                const link = document.createElement('a');
                link.href = previewUrl;
                link.download = filename;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Mark URL as used
                blobUrlManager.markURLUsed(previewUrl);

                if (autoToast) {
                    toast.success('File berhasil diunduh');
                }

                if (onSuccess) {
                    onSuccess(filename);
                }
            } catch (err) {
                const errorMsg = 'Gagal mengunduh file PDF';
                setError(errorMsg);

                if (autoToast) {
                    toast.error(errorMsg);
                }

                if (onError && err instanceof Error) {
                    onError(err);
                }
            }
        },
        [autoToast, onSuccess, onError]
    );

    /**
     * Clear preview URL
     */
    const clearPreview = useCallback((): void => {
        if (previewUrl) {
            blobUrlManager.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    }, [previewUrl]);

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        return () => {
            if (previewUrl) {
                blobUrlManager.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    return {
        // State
        isLoading,
        error,
        previewUrl,

        // Actions
        downloadPdf,
        downloadMgc,
        triggerPdfDownload,
        createPreviewUrl,
        clearPreview,

        // Utility
        getPoolStats: () => blobUrlManager.getPoolStats(),
    };
};
