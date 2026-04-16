/**
 * Modul Eksekutor: Universal Export Engine
 * Bertanggung jawab menerima aliran Blob (PDF, MGC, CSV, dll) dan mengarahkannya ke 
 * jalur transportasi yang paling stabil (Native Share untuk PWA vs Direct Download untuk Web Desktop).
 * * Arsitektur: Protected Variations (Melindungi aplikasi dari "Permission Denied" di WebView Android).
 */

import { isPwaWrapperEnvironment, isShareApiSupported } from './environment-detector';

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
            // Best Practice Android Browser: Berikan jeda asinkron kecil (150ms) 
            // sebelum me-revoke URL. Beberapa browser internal (seperti MIUI/Samsung Browser lama)
            // akan membatalkan download jika URL dihancurkan tepat di milidetik yang sama saat 'click' dieksekusi.
            setTimeout(() => {
                URL.revokeObjectURL(objectUrl!);
            }, 150);
        }
    }
};

/**
 * Fungsi Eksekutor Utama. Akan dipanggil oleh layer Hook/Orchestrator.
 * Berperan sebagai Polymorphic endpoint untuk berbagai jenis ekstensi file.
 * * @param fileBlob Objek Blob murni dari respon server atau generator client.
 * @param fileName Nama file yang diharapkan lengkap dengan ekstensi (misal: "Backup.mgc" atau "Laporan.pdf").
 * @returns Promise<ExportResult> Status akhir dari eksekusi.
 */
export const executeUniversalExport = async (fileBlob: Blob, fileName: string): Promise<ExportResult> => {
    try {
        const isPwa = isPwaWrapperEnvironment();
        const canUseShareApi = isShareApiSupported();

        // JALUR 1: PWA / Mobile OS
        if (isPwa && canUseShareApi) {
            // Web Share API Level 2 mensyaratkan tipe data File, bukan Blob mentah.
            // [HARDENED]: Deteksi dinamis MIME type. Jika kosong, fallback ke octet-stream (biner murni).
            const file = new File([fileBlob], fileName, { type: fileBlob.type || 'application/octet-stream' });

            const shareData: ShareData = {
                files: [file],
                title: 'Dokumen KeuanganKu',
            };

            // Validasi kapabilitas OS level 2: Apakah OS Android versi ini mendukung share tipe file ini?
            if (navigator.canShare && navigator.canShare(shareData)) {
                try {
                    await navigator.share(shareData);
                    return 'SHARED';
                } catch (error: any) {
                    // Graceful Handling: User sengaja menutup laci Share Dialog (bukan error sistem)
                    const isUserCancellation =
                        error.name === 'AbortError' ||
                        error.message?.toLowerCase().includes('abort') ||
                        error.message?.toLowerCase().includes('cancel');

                    if (isUserCancellation) {
                        console.info('[UniversalExportEngine] Aksi share dibatalkan oleh pengguna secara sadar.');
                        return 'SHARE_CANCELLED';
                    }

                    // Jika gagal karena alasan sistem (misal file terlalu besar untuk Intent), lempar ke luar
                    throw error;
                }
            } else {
                // Fallback: OS mendukung Share API secara umum, tapi tidak mensupport tipe/ekstensi file ini.
                // Turunkan derajatnya (Graceful Degradation) ke jalur download standar.
                console.warn('[UniversalExportEngine] Tipe file tidak didukung oleh Native Share, fallback ke Direct Download.');
                return await executeDirectDownload(fileBlob, fileName);
            }
        }

        // JALUR 2: Web Desktop / Browser Biasa
        return await executeDirectDownload(fileBlob, fileName);

    } catch (error) {
        console.error('[UniversalExportEngine] Kegagalan sistemik saat mengeksekusi Blob:', error);
        throw error; // Lempar kembali ke layer Orchestrator agar dapat memicu Toast Error ke UI.
    }
};