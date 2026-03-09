/**
 * @file formatters.ts
 * @description Kumpulan fungsi utilitas murni untuk memformat data mentah menjadi bentuk yang human-readable.
 * Digunakan secara luas di komponen UI untuk konsistensi visual.
 */

/**
 * Mengubah ukuran bytes mentah menjadi string terformat (KB, MB, GB).
 * @param bytes - Angka ukuran dalam bytes (integer)
 * @param decimals - Jumlah angka di belakang koma (default: 2)
 * @returns String terformat, contoh: "10.5 MB"
 *
 * Logic:
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

/**
 * Memformat angka ke dalam format mata uang Rupiah.
 * Contoh: 10000 -> "Rp 10.000"
 */
export const formatCurrency = (value: number | string): string => {
    const amount = typeof value === "string" ? parseFloat(value) : value;

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount || 0);
};

/**
 * @description Menghasilkan nama file standar untuk hasil simulasi (PDF/MGC).
 * Menerapkan pola Pure Fabrication (Larman) untuk memusatkan tanggung jawab penamaan file.
 * Format: "Nama Modul_Nama Klien_DDMMYY.ext"
 * * @param moduleName - Nama modul simulasi (contoh: "Budget Plan", "Insurance")
 * @param clientName - Nama klien yang diinput oleh user
 * @param extension - Ekstensi tipe file hasil generasi ('pdf' atau 'mgc')
 * @returns String nama file terformat (contoh: "Budget Plan_Reno_090325.pdf")
 */
export function generateSimulationFilename(
    moduleName: string,
    clientName: string,
    extension: 'pdf' | 'mgc'
): string {
    // 1. Sanitasi nama klien (Detail handling): 
    // Mencegah OS error akibat karakter terlarang pada path filename (seperti \ / : * ? " < > |)
    // Hanya menyisakan alphanumeric dan spasi.
    const sanitizedClientName = clientName.replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'Klien';

    // 2. Pembuatan format tanggal (DDMMYY) dari System Clock
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // getMonth index mulai dari 0
    const year = String(now.getFullYear()); // Mengambil 2 digit terakhir (2025 -> 25)

    const formattedDate = `${day}-${month}-${year}`;

    // 3. Merakit dan mengembalikan nama file final
    return `${moduleName}_${sanitizedClientName}_${formattedDate}.${extension}`;
}