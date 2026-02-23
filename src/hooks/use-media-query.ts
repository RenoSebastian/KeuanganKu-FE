import { useState, useEffect } from "react";

/**
 * Hook fundamental untuk mendeteksi media query secara real-time.
 * Menerapkan pola Observer untuk memantau perubahan ukuran layar.
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState<boolean>(false);

    useEffect(() => {
        // Pastikan kode hanya berjalan di sisi client
        if (typeof window !== "undefined") {
            const mediaQueryList = window.matchMedia(query);

            // Set nilai awal saat komponen pertama kali di-mount
            setMatches(mediaQueryList.matches);

            // Listener callback untuk menangkap perubahan ukuran layar (resize)
            const listener = (event: MediaQueryListEvent) => {
                setMatches(event.matches);
            };

            // Menambahkan event listener
            mediaQueryList.addEventListener("change", listener);

            // Cleanup function untuk mencegah memory leak saat komponen di-unmount
            return () => {
                mediaQueryList.removeEventListener("change", listener);
            };
        }
    }, [query]);

    return matches;
}

/**
 * Hook turunan yang mengkapsulasi logika breakpoint aplikasi.
 * Bertindak sebagai Controller/Information Expert untuk layouting responsif.
 */
export function useBreakpoints() {
    // Breakpoints disesuaikan dengan standar Tailwind CSS dan kebutuhan PWA
    const isMobile = useMediaQuery("(max-width: 768px)");
    const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
    const isDesktop = useMediaQuery("(min-width: 1025px)");

    // State turunan tambahan untuk mempermudah logika render komponen
    const isMobileOrTablet = isMobile || isTablet;

    return {
        isMobile,
        isTablet,
        isDesktop,
        isMobileOrTablet,
    };
}