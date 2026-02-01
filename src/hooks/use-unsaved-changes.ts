import { useEffect } from 'react';

/**
 * Custom Hook untuk mencegah Data Loss.
 * Memicu native browser alert jika user mencoba menutup tab/refresh saat form 'kotor' (belum disave).
 * * @param isDirty Boolean - Status apakah form memiliki perubahan yang belum disimpan.
 */
export function useUnsavedChanges(isDirty: boolean) {
    useEffect(() => {
        // Handler untuk event 'beforeunload' (Standar HTML5)
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                // Mencegah event default
                e.preventDefault();
                // Chrome membutuhkan properti returnValue untuk diset
                e.returnValue = true;
            }
        };

        // Daftarkan event listener hanya jika form kotor
        if (isDirty) {
            window.addEventListener('beforeunload', handleBeforeUnload);
        }

        // Cleanup function: Wajib remove listener saat component unmount atau isDirty berubah
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);
}