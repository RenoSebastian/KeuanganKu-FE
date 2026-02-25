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
 * Utility untuk mengunduh file teks.
 */
export function downloadMgcFile(filename: string, token: string) {
  const blob = new Blob([token], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}