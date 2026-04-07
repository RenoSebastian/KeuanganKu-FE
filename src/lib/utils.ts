import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Menggabungkan classname Tailwind dengan aman.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * [FIXED] Helper Smart URL Gambar.
 * Menangani perbedaan path legacy (/api/uploads) dan path baru (/uploads).
 */
export function getImageUrl(path: string | null | undefined): string {
  // 1. Fallback awal jika path null
  if (!path) return "/images/placeholder.png";

  // 2. Jika path sudah berupa URL lengkap (misal dari Google/S3), kembalikan langsung
  if (path.startsWith("http") || path.startsWith("https")) return path;

  // 3. Tentukan Base Domain Backend
  // Gunakan env variable atau default localhost:4000
  let backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // Bersihkan trailing slash dan suffix '/api' dari backendUrl 
  // (karena folder static '/uploads' di-serve di ROOT domain, bukan di dalam /api)
  backendUrl = backendUrl.replace(/\/api$/, "").replace(/\/$/, "");

  // 4. Normalisasi Path Gambar dari DB
  let cleanPath = path.startsWith("/") ? path : `/${path}`;

  // [AUTO-FIX LEGACY DATA]
  // Jika DB menyimpan '/api/uploads/foto.jpg', kita ubah paksa jadi '/uploads/foto.jpg'
  // agar sesuai dengan konfigurasi ServeStaticModule yang baru.
  if (cleanPath.startsWith("/api/uploads/")) {
    cleanPath = cleanPath.replace("/api/uploads/", "/uploads/");
  }

  // 5. Gabungkan: http://localhost:4000 + /uploads/folder/file.jpg
  return `${backendUrl}${cleanPath}`;
}

/**
 * Standard Formatter untuk Rupiah.
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Helper Private: Fallback untuk mengunduh via manipulasi DOM (Desktop Browser)
 */
function triggerLegacyDownload(data: Blob | File, filename: string) {
  const url = window.URL.createObjectURL(data);
  const a = document.createElement("a");

  a.style.display = "none";
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Berikan sedikit jeda sebelum membersihkan RAM (Garbage Collection)
  // untuk memastikan OS selesai membaca stream dari pointer memori
  setTimeout(() => window.URL.revokeObjectURL(url), 150);
}

/**
 * [UPGRADED] Utility cerdas untuk mengunduh file teks (PWA Ready).
 * Sekarang adaptif mendeteksi lingkungan Mobile (Share API) vs Desktop (DOM).
 */
export async function downloadMgcFile(filename: string, token: string): Promise<void> {
  try {
    // 1. Konstruksi objek File standard
    const file = new File([token], filename, {
      type: "text/plain",
      lastModified: Date.now(),
    });

    // 2. Capability Detection (Aman dari undefined errors di browser lama)
    const supportsShare = typeof navigator.share === 'function';
    const supportsCanShare = typeof navigator.canShare === 'function';

    let canShareFile = false;
    if (supportsShare && supportsCanShare) {
      canShareFile = navigator.canShare({ files: [file] });
    }

    // 3. Eksekusi Native Handoff untuk environment PWA/Mobile
    if (supportsShare && canShareFile) {
      await navigator.share({
        title: 'Simpan Token KeuanganKu',
        files: [file]
      });
      return; // Berhasil dieksekusi OS
    }

    // 4. Jika di Web Desktop atau kapabilitas file share diblokir OS, gunakan Fallback
    triggerLegacyDownload(file, filename);

  } catch (error: any) {
    // Abaikan jika user membatalkan (Cancel) dialog Share OS
    if (error.name === 'AbortError' || error.message?.includes('abort')) {
      console.log("Share operation cancelled by user.");
      return;
    }

    console.warn("Native Share gagal atau diblokir. Mengaktifkan sistem Fallback.", error);

    // Fallback Darurat menggunakan Blob standar jika File Object ditolak ketat
    const blob = new Blob([token], { type: "text/plain" });
    triggerLegacyDownload(blob, filename);
  }
}

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