import { StreamMetadata, StreamSecurity } from './types/retention';

// [ARCHITECTURE] Konstanta Signature untuk Smart File Recognition (Agnostik Ekstensi)
const MGC_MAGIC_SIGNATURE = 'MGC_SECURE_V1';

// Ukuran chunk sampel disesuaikan (dalam bytes)
// 4KB sudah cukup aman untuk mengakomodasi Signature + Metadata + Security object di awal file
const HEADER_SAMPLE_SIZE = 4096;
const FOOTER_SAMPLE_SIZE = 1024;

interface ValidationResult {
    isValid: boolean;
    metadata?: StreamMetadata;
    pruneToken?: string;
    error?: string;
}

/**
 * Membaca header file untuk memvalidasi Magic Signature,
 * serta mengekstrak Metadata dan Security Token sekaligus.
 * Menggunakan File.slice untuk memori efisien (O(1) Memory usage).
 */
async function readHeaderData(file: File) {
    const startChunk = file.slice(0, HEADER_SAMPLE_SIZE);
    const text = await startChunk.text();

    // 1. Validasi Smart File Recognition (Bypass Ekstensi OS)
    const signatureMatch = text.match(/"_mgc_signature"\s*:\s*"([^"]+)"/);
    if (!signatureMatch || signatureMatch[1] !== MGC_MAGIC_SIGNATURE) {
        throw new Error('File ditolak. Magic signature MGC tidak ditemukan atau file telah dimanipulasi.');
    }

    // 2. Ekstraksi Metadata menggunakan non-greedy regex
    const metadataMatch = text.match(/"metadata"\s*:\s*({[^}]+})/);
    if (!metadataMatch || !metadataMatch[1]) {
        throw new Error('Header file tidak valid: struktur metadata tidak ditemukan.');
    }

    // 3. Ekstraksi Security Token 
    // Berada di header chunk karena posisinya sebelum array data yang masif
    const securityMatch = text.match(/"security"\s*:\s*({[^}]+})/);
    if (!securityMatch || !securityMatch[1]) {
        throw new Error('Security header tidak ditemukan. Struktur file MGC mungkin korup.');
    }

    try {
        return {
            metadata: JSON.parse(metadataMatch[1]) as StreamMetadata,
            security: JSON.parse(securityMatch[1]) as StreamSecurity
        };
    } catch (e) {
        throw new Error('Gagal mem-parsing objek JSON dari buffer header.');
    }
}

/**
 * Membaca footer untuk memverifikasi integritas fisik file (End Of File).
 * Mencegah file yang terpotong saat proses download diproses oleh aplikasi.
 */
async function verifyStreamIntegrity(file: File): Promise<void> {
    const startByte = Math.max(0, file.size - FOOTER_SAMPLE_SIZE);
    const endChunk = file.slice(startByte, file.size);
    const text = await endChunk.text();

    // Regex memastikan file diakhiri dengan '}' mengabaikan trailing whitespaces/newlines
    if (!/}\s*$/.test(text)) {
        throw new Error('Integritas File Rusak: Format MGC tidak tertutup sempurna (Stream terpotong).');
    }
}

/**
 * FUNGSI UTAMA: INSPECTOR
 * Memvalidasi integritas file arsip secara Client-Side (Offline).
 * Time Complexity: O(1) - Evaluasi konstan pada bit array awal dan akhir, mengabaikan ukuran array data.
 */
export async function inspectArchiveFile(file: File): Promise<ValidationResult> {
    // Guard: Batas bawah rasional ukuran file MGC (Signature + Metadata + Empty Data array ~200 bytes)
    if (file.size < 200) {
        return { isValid: false, error: 'Ukuran file tidak masuk akal untuk format MGC yang valid.' };
    }

    try {
        // Parallel I/O: Eksekusi evaluasi header dan cek EOF secara serentak
        const [headerData] = await Promise.all([
            readHeaderData(file),
            verifyStreamIntegrity(file)
        ]);

        const { metadata, security } = headerData;

        // Cross-Check ketersediaan token untuk keperluan otorisasi Prune
        if (!security.pruneToken) {
            return { isValid: false, error: 'Security Token (Prune Token) tidak ditemukan dalam payload.' };
        }

        return {
            isValid: true,
            metadata,
            pruneToken: security.pruneToken
        };

    } catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Kesalahan I/O saat melakukan inspeksi file.'
        };
    }
}