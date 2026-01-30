/**
 * @file formatters.ts
 * @description Kumpulan fungsi utilitas murni untuk memformat data mentah menjadi bentuk yang human-readable.
 * Digunakan secara luas di komponen UI untuk konsistensi visual.
 */

/**
 * Mengubah ukuran bytes mentah menjadi string terformat (KB, MB, GB).
 * * @param bytes - Angka ukuran dalam bytes (integer)
 * @param decimals - Jumlah angka di belakang koma (default: 2)
 * @returns String terformat, contoh: "10.5 MB"
 * * Logic:
 * Menggunakan logaritma natural untuk menentukan indeks satuan (KB/MB/GB)
 * secara dinamis tanpa if-else hell.
 */
export function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

    // Menentukan index array 'sizes' berdasarkan logaritma
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    // Menghitung nilai dan menggabungkan dengan satuan
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Memformat angka ribuan dengan pemisah titik (Locale Indonesia).
 * Contoh: 10000 -> "10.000"
 */
export function formatNumber(num: number): string {
    return new Intl.NumberFormat('id-ID').format(num);
}