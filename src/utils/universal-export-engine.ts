/**
 * Modul Eksekutor: Universal Export Engine
 * Bertanggung jawab menerima aliran Blob (PDF, MGC, CSV, dll) dan mengarahkannya ke 
 * jalur transportasi yang paling stabil (Native Share untuk PWA vs Direct Download untuk Web Desktop).
 * * Arsitektur: Protected Variations (Melindungi aplikasi dari "Permission Denied" di WebView Android & iOS).
 */

import { isPwaWrapperEnvironment, isShareApiSupported, getEnvironmentMetrics } from './environment-detector';

// Tipe pengembalian agar Orchestrator (Hook) tahu persis apa hasil eksekusinya
export type ExportResult = 'SHARED' | 'DOWNLOADED' | 'SHARE_CANCELLED' | 'FAILED';

/**
 * Fungsi helper privat: Menangani pengunduhan via DOM secara aman.
 * Diisolasi dari logika utama agar blok try-finally untuk ObjectURL tidak saling tumpang tindih.
 */
const executeDirectDownload = async (blob: Blob, fileName: string): Promise<ExportResult> => {
    let objectUrl: string | null = null;
    let anchor: HTMLAnchorElement | null = null;

    try {
        // Ikat Blob ke dalam memory document window
        objectUrl = URL.createObjectURL(blob);

        anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = fileName;

        // Pastikan elemen tidak merusak layout saat di-append
        anchor.style.display = 'none';
        anchor.style.visibility = 'hidden';

        document.body.appendChild(anchor);
        anchor.click();

        return 'DOWNLOADED';
    } finally {
        // MEMORY MANAGEMENT (KRITIKAL):
        // Pembersihan DOM
        if (anchor && document.body.contains(anchor)) {
            document.body.removeChild(anchor);
        }

        // Pembersihan Referensi Blob
        if (objectUrl) {
            // Best Practice Mobile Browser: Berikan jeda asinkron kecil (150ms) 
            setTimeout(() => {
                URL.revokeObjectURL(objectUrl!);
            }, 150);
        }
    }
};

/**
 * Fungsi Eksekutor Utama. Akan dipanggil oleh layer Hook/Orchestrator.
 * Berperan sebagai Polymorphic endpoint untuk berbagai jenis ekstensi file.
 */
export const executeUniversalExport = async (fileBlob: Blob, fileName: string): Promise<ExportResult> => {
    try {
        const metrics = getEnvironmentMetrics();
        const isPwa = isPwaWrapperEnvironment();
        const canUseShareApi = isShareApiSupported();

        if ((isPwa || metrics.isMobileOS) && canUseShareApi) {
            const file = new File([fileBlob], fileName, { type: fileBlob.type || 'application/octet-stream' });

            const shareData: ShareData = {
                files: [file],
                title: 'Dokumen KeuanganKu',
            };

            if (navigator.canShare && navigator.canShare(shareData)) {
                try {
                    await navigator.share(shareData);
                    return 'SHARED';
                } catch (error: any) {
                    // Graceful Handling 1: User sengaja menutup laci Share Dialog
                    const isUserCancellation =
                        error.name === 'AbortError' ||
                        error.message?.toLowerCase().includes('abort') ||
                        error.message?.toLowerCase().includes('cancel');

                    if (isUserCancellation) {
                        console.info('[UniversalExportEngine] Aksi share dibatalkan oleh pengguna secara sadar.');
                        return 'SHARE_CANCELLED';
                    }

                    // Graceful Handling 2: iOS/Android Menolak Payload (NotAllowedError / Permission Denied)
                    // [CRITICAL FIX] Alih-alih throw error, kita otomatis belokkan ke Direct Download.
                    console.warn('[UniversalExportEngine] Native Share ditolak OS (Permission Denied), fallback ke Direct Download.', error);
                    return await executeDirectDownload(fileBlob, fileName);
                }
            } else {
                console.warn('[UniversalExportEngine] Tipe file tidak didukung oleh Native Share, fallback ke Direct Download.');
                return await executeDirectDownload(fileBlob, fileName);
            }
        }

        // JALUR 2: Web Desktop / Browser Biasa
        return await executeDirectDownload(fileBlob, fileName);

    } catch (error) {
        console.error('[UniversalExportEngine] Kegagalan sistemik saat mengeksekusi Blob:', error);
        throw error;
    }
};