import { StreamMetadata, StreamSecurity } from './types/retention';

// Ukuran chunk untuk sampling (dalam bytes)
const HEADER_SAMPLE_SIZE = 1024; // 1KB pertama untuk metadata
const FOOTER_SAMPLE_SIZE = 2048; // 2KB terakhir untuk security token

interface ValidationResult {
    isValid: boolean;
    metadata?: StreamMetadata;
    pruneToken?: string;
    error?: string;
}

/**
 * Membaca header file JSON untuk mengekstrak Metadata.
 * Menggunakan File.slice untuk efisiensi memori (tidak load full file).
 */
async function readMetadata(file: File): Promise<StreamMetadata> {
    const startChunk = file.slice(0, HEADER_SAMPLE_SIZE);
    const text = await startChunk.text();

    // Mencari pattern: "metadata": { ... }
    // Kita gunakan regex non-greedy untuk menangkap objek metadata
    const match = text.match(/"metadata"\s*:\s*({[^}]+})/);

    if (!match || !match[1]) {
        throw new Error('Header file tidak valid atau metadata tidak ditemukan.');
    }

    try {
        return JSON.parse(match[1]) as StreamMetadata;
    } catch (e) {
        throw new Error('Gagal mem-parsing metadata JSON.');
    }
}

/**
 * Membaca footer file JSON untuk mengekstrak Security Token.
 * Memastikan file tidak terpotong (broken stream).
 */
async function readSecurityToken(file: File): Promise<StreamSecurity> {
    // Ambil 2KB terakhir
    const startByte = Math.max(0, file.size - FOOTER_SAMPLE_SIZE);
    const endChunk = file.slice(startByte, file.size);
    const text = await endChunk.text();

    // 1. Cek Integritas Fisik: File harus diakhiri dengan '}'
    // Trim whitespace di akhir
    if (!text.trim().endsWith('}')) {
        throw new Error('Integritas File Rusak: File JSON tidak tertutup sempurna (Missing closing brace).');
    }

    // 2. Mencari pattern: "security": { ... } di akhir file
    // Regex mencari object security sebelum penutup array/object utama
    const match = text.match(/"security"\s*:\s*({[^}]+})\s*}/);

    if (!match || !match[1]) {
        throw new Error('Security Footer hilang. File mungkin korup atau hasil export tidak lengkap.');
    }

    try {
        const security = JSON.parse(match[1]) as StreamSecurity;

        // Verifikasi flag integrity dari BE
        if (security.integrity !== 'END_OF_STREAM_OK') {
            throw new Error('Flag integritas stream tidak valid.');
        }

        return security;
    } catch (e) {
        throw new Error('Gagal mem-parsing security token.');
    }
}

/**
 * FUNGSI UTAMA: INSPECTOR
 * Memvalidasi integritas file arsip secara Client-Side (Offline).
 * Time Complexity: O(1) - Konstan, tidak tergantung ukuran file.
 */
export async function inspectArchiveFile(file: File): Promise<ValidationResult> {
    // Guard: File size minimal (Metadata + [] + Security ~ 200 bytes min)
    if (file.size < 200) {
        return { isValid: false, error: 'Ukuran file terlalu kecil untuk menjadi arsip valid.' };
    }

    try {
        // Parallel Read: Baca Header dan Footer sekaligus
        const [metadata, security] = await Promise.all([
            readMetadata(file),
            readSecurityToken(file)
        ]);

        // Cross-Check: Pastikan token ada
        if (!security.pruneToken) {
            return { isValid: false, error: 'Security Token kosong.' };
        }

        return {
            isValid: true,
            metadata,
            pruneToken: security.pruneToken
        };

    } catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Kesalahan validasi tidak dikenal.'
        };
    }
}