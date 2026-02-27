import { v4 as uuidv4 } from 'uuid';

// Kunci penyimpanan yang unik dan spesifik untuk menghindari bentrokan dengan PWA lain
const DEVICE_SIGNATURE_KEY = 'keuanganku_device_signature';

/**
 * Mengambil Device ID dari LocalStorage atau membuat yang baru jika belum ada.
 * Logika ini dirancang agar aman terhadap SSR di Next.js.
 */
export const getOrCreateDeviceId = (): string => {
    // [1] Pengecekan Lingkungan SSR
    // Di Next.js, objek 'window' tidak tersedia saat proses rendering di Server.
    // Jika ini dipanggil di sisi server, kita kembalikan string kosong atau nilai fallback.
    if (typeof window === 'undefined') {
        return '';
    }

    try {
        // [2] Pengecekan LocalStorage
        let deviceId = window.localStorage.getItem(DEVICE_SIGNATURE_KEY);

        // [3] Generasi dan Penyimpanan (Jika KOSONG)
        if (!deviceId) {
            deviceId = uuidv4();
            window.localStorage.setItem(DEVICE_SIGNATURE_KEY, deviceId);

            // Catat di console untuk keperluan debugging saat pengembangan
            if (process.env.NODE_ENV === 'development') {
                console.log('[Device Fingerprint] New Device ID generated:', deviceId);
            }
        }

        return deviceId;

    } catch (error) {
        // [4] Penanganan Kondisi Batas (Edge Case)
        // Beberapa browser (seperti Safari di Private Mode / Incognito yang ekstrim) 
        // akan melempar error (QuotaExceededError) saat mencoba mengakses localStorage.
        // Daripada aplikasi crash, kita kembalikan UUID sementara per-sesi-tab.
        console.warn('[Device Fingerprint] LocalStorage access denied or failed. Generating temporary ID.');
        return uuidv4();
    }
};