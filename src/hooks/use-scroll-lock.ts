import { useEffect } from 'react';

/**
 * Custom hook untuk mengunci scroll pada elemen body (Sangat berguna untuk Modal, Lightbox, atau Drawer).
 * Mengimplementasikan pengembalian nilai gaya awal (cleanup) secara otomatis untuk mencegah bug UI.
 * * @param isLocked - Boolean state penentu apakah scroll harus dikunci saat ini.
 */
export function useScrollLock(isLocked: boolean) {
    useEffect(() => {
        // [Safety Check] Mencegah eksekusi saat fase Server-Side Rendering (SSR) di Next.js
        if (typeof window === 'undefined') return;

        // Jika tidak dalam kondisi terkunci, abaikan efek ini
        if (!isLocked) return;

        // 1. Simpan nilai asli overflow dari computed style sebelum kita memanipulasinya
        const originalStyle = window.getComputedStyle(document.body).overflow;

        // 2. Terapkan penguncian scroll
        document.body.style.overflow = 'hidden';

        // 3. Cleanup Function (Dieksekusi saat komponen unmount atau state isLocked berubah menjadi false)
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, [isLocked]); // Re-run effect HANYA jika nilai isLocked berubah
}