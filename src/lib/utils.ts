import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Menggabungkan classname Tailwind dengan aman (merge conflict resolution).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * [NEW] Helper untuk menghasilkan URL Gambar yang valid.
 * Mengatasi masalah perbedaan port antara Frontend (3000) dan Backend (4000).
 */
export function getImageUrl(path: string | null | undefined): string {
  // 1. Fallback jika path kosong/null (Pastikan Anda punya placeholder.png di public/images)
  if (!path) return "/images/placeholder.png";

  // 2. Jika path sudah berupa URL lengkap (misal dari Google/S3), kembalikan langsung
  if (path.startsWith("http") || path.startsWith("https")) return path;

  // 3. Ambil Base URL Backend
  // Prioritas: Environment Variable -> Localhost Default (Port 4000)
  // .replace(/\/$/, "") menghapus slash di akhir jika ada, untuk mencegah double slash
  const backendUrl = ("http://localhost:4000").replace(/\/$/, "");

  // 4. Normalisasi Path (Pastikan diawali slash)
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // 5. Gabungkan: http://localhost:4000 + /api/uploads/folder/file.jpg
  return `${backendUrl}${cleanPath}`;
}

/**
 * [NEW] Standard Formatter untuk Rupiah.
 * Digunakan di berbagai komponen harga/budgeting.
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
 * Utility untuk mengunduh file teks (biasanya untuk token/license key).
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