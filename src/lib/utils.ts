import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Menggabungkan classname Tailwind dengan aman menggunakan clsx dan tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * [FIXED] Helper Smart URL Gambar.
 * Menangani perbedaan path legacy (/api/uploads) dan path baru (/uploads).
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "/images/placeholder.png";
  if (path.startsWith("http") || path.startsWith("https")) return path;

  let backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  backendUrl = backendUrl.replace(/\/api$/, "").replace(/\/$/, "");

  let cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (cleanPath.startsWith("/api/uploads/")) {
    cleanPath = cleanPath.replace("/api/uploads/", "/uploads/");
  }

  return `${backendUrl}${cleanPath}`;
}

/**
 * Standard Formatter untuk mata uang Rupiah.
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// --- ARTIFACT INSPECTOR LOGIC (.MGC VALIDATION) ---
// Bagian ini dipertahankan untuk kebutuhan fungsi 'Restore Sesi' (Import File)

import { StreamMetadata, StreamSecurity } from './types/retention';

const MGC_MAGIC_SIGNATURE = 'MGC_SECURE_V1';
const HEADER_SAMPLE_SIZE = 4096;
const FOOTER_SAMPLE_SIZE = 1024;

interface ValidationResult {
  isValid: boolean;
  metadata?: StreamMetadata;
  pruneToken?: string;
  error?: string;
}

/**
 * Membaca signature dan metadata dari bagian awal file biner .mgc
 */
async function readHeaderData(file: File) {
  const startChunk = file.slice(0, HEADER_SAMPLE_SIZE);
  const text = await startChunk.text();

  const signatureMatch = text.match(/"_mgc_signature"\s*:\s*"([^"]+)"/);
  if (!signatureMatch || signatureMatch[1] !== MGC_MAGIC_SIGNATURE) {
    throw new Error('File ditolak. Ini bukan file .mgc yang valid.');
  }

  const metadataMatch = text.match(/"metadata"\s*:\s*({[^}]+})/);
  if (!metadataMatch) throw new Error('Struktur metadata file rusak.');

  const securityMatch = text.match(/"security"\s*:\s*({[^}]+})/);
  if (!securityMatch) throw new Error('Token keamanan tidak ditemukan.');

  try {
    return {
      metadata: JSON.parse(metadataMatch[1]) as StreamMetadata,
      security: JSON.parse(securityMatch[1]) as StreamSecurity
    };
  } catch (e) {
    throw new Error('Gagal mem-parsing header file.');
  }
}

/**
 * Memastikan integritas stream file dengan mengecek penutup JSON di akhir file.
 */
async function verifyStreamIntegrity(file: File): Promise<void> {
  const startByte = Math.max(0, file.size - FOOTER_SAMPLE_SIZE);
  const endChunk = file.slice(startByte, file.size);
  const text = await endChunk.text();

  if (!/}\s*$/.test(text)) {
    throw new Error('File tidak utuh atau terpotong saat diunduh.');
  }
}

/**
 * Fungsi Inspektor Utama untuk memvalidasi file arsip sebelum di-upload kembali ke sistem.
 */
export async function inspectArchiveFile(file: File): Promise<ValidationResult> {
  if (file.size < 200) {
    return { isValid: false, error: 'File terlalu kecil untuk format .mgc' };
  }

  try {
    const [headerData] = await Promise.all([
      readHeaderData(file),
      verifyStreamIntegrity(file)
    ]);

    const { metadata, security } = headerData;

    if (!security.pruneToken) {
      return { isValid: false, error: 'Prune Token tidak ditemukan.' };
    }

    return { isValid: true, metadata, pruneToken: security.pruneToken };

  } catch (error: any) {
    return { isValid: false, error: error.message };
  }
}