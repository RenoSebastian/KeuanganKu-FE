/**
 * Modul Evaluator: Environment Detector
 * Bertanggung jawab penuh untuk mengidentifikasi lapisan eksekusi (Browser vs PWA/Wrapper).
 * Pendekatan: 2-Layer Detection (Heuristic & Deterministic).
 */

export interface EnvironmentState {
    isStandalone: boolean;
    hasAppReferrer: boolean;
    hasCustomUserAgent: boolean;
    isMobileOS: boolean;
    reliabilityScore: number;
}

// Konstanta yang disepakati dengan vendor Wrapper (jika ada).
// Jika vendor belum menginjeksi ini, deteksi akan otomatis turun ke mode heuristik.
const CUSTOM_WRAPPER_IDENTIFIER = 'KeuanganKuApp';

/**
 * Mengumpulkan metrik lingkungan secara komprehensif dari objek window dan navigator.
 */
export const getEnvironmentMetrics = (): EnvironmentState => {
    // SSR Protection
    if (typeof window === 'undefined') {
        return {
            isStandalone: false,
            hasAppReferrer: false,
            hasCustomUserAgent: false,
            isMobileOS: false,
            reliabilityScore: 0,
        };
    }

    // Layer 1: Deteksi Standalone Mode (Heuristik)
    const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
    // Fallback non-standar untuk vendor tertentu (termasuk iOS WebClip)
    // @ts-expect-error - navigator.standalone tidak ada di standar TS DOM
    const isStandaloneNav = !!navigator.standalone;
    const isStandalone = isStandaloneMedia || isStandaloneNav;

    // Layer 2: Deteksi Platform & Transportasi (Heuristik & Deterministik)
    const hasAppReferrer = document.referrer.includes('android-app://');

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
    const hasCustomUserAgent = userAgent.includes(CUSTOM_WRAPPER_IDENTIFIER);
    const isMobileOS = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());

    // Perhitungan Bobot Reliabilitas (High Cohesion)
    let reliabilityScore = 0;
    if (isStandalone) reliabilityScore += 1;
    if (isMobileOS) reliabilityScore += 1;
    if (hasAppReferrer) reliabilityScore += 2;    // Indikator kuat TWA Android
    if (hasCustomUserAgent) reliabilityScore += 5; // Indikator absolut (Deterministik)

    return {
        isStandalone,
        hasAppReferrer,
        hasCustomUserAgent,
        isMobileOS,
        reliabilityScore,
    };
};

/**
 * Fungsi evaluasi utama yang akan digunakan oleh Orchestrator/Controller.
 * Menentukan apakah sistem harus beralih ke jalur Share API atau tetap di Direct Download.
 * * @returns {boolean} true jika lingkungan adalah PWA/WebView Wrapper Android.
 */
export const isPwaWrapperEnvironment = (): boolean => {
    const metrics = getEnvironmentMetrics();

    // Evaluasi Deterministik: Jika string identifier khusus dari wrapper ditemukan, 100% valid.
    if (metrics.hasCustomUserAgent) {
        return true;
    }

    // Evaluasi Heuristik: 
    // Jika tidak ada custom identifier, user minimal harus berada di ekosistem Mobile 
    // DAN mengakses melalui mode Standalone atau direferensikan oleh sistem App OS.
    // Ambang batas skor >= 2 memastikan pengguna Chrome Desktop (yang menggunakan display: standalone)
    // tidak salah terdeteksi sebagai mobile PWA, sehingga fitur Direct Download tidak rusak.
    return metrics.reliabilityScore >= 2;
};

/**
 * Utility tambahan untuk mendeteksi kapabilitas Share API di tingkat perangkat keras/browser.
 */
export const isShareApiSupported = (): boolean => {
    return typeof navigator !== 'undefined' && typeof navigator.canShare === 'function';
};