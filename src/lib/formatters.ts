/**
 * @file formatters.ts
 * @description Kumpulan fungsi utilitas murni untuk memformat data mentah menjadi bentuk yang human-readable.
 * Digunakan secara luas di komponen UI untuk konsistensi visual.
 */

/**
 * @description Memparsing nilai angka dari berbagai tipe data, termasuk raw object Decimal dari Prisma.
 * Mengatasi masalah NaN ketika backend mengirimkan struktur internal decimal.js { s, e, d }.
 * Menerapkan pola Adapter (Protected Variations) untuk memproteksi UI dari anomali data API.
 * * @param value - Data mentah yang akan diparsing (number, string, atau Prisma Decimal Object)
 * @returns Angka primitif yang valid untuk komputasi (default: 0)
 */
export function parseDecimal(value: any): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;

    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    }

    // Deteksi objek raw Decimal (decimal.js) dari backend: ex { s: 1, e: 6, d: [1470000] }
    if (typeof value === 'object' && 'd' in value && Array.isArray(value.d)) {
        try {
            // Ekstrak array digit menjadi string utuh
            const digitsString = value.d.join('');
            const digitsNumber = parseFloat(digitsString);

            if (isNaN(digitsNumber)) return 0;

            // Formula rekonstruksi matematis eksak: 
            // Nilai = Sign * Digits * 10 ^ (Exponent - (Jumlah_Digit - 1))
            const sign = value.s || 1;
            const exponent = value.e || 0;
            const length = digitsString.length;

            return sign * digitsNumber * Math.pow(10, exponent - (length - 1));
        } catch (error) {
            console.error("[Formatters] Gagal memparsing Decimal object:", error);
            return 0;
        }
    }

    return 0;
}

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
 * Mendukung input tipe apapun berkat injeksi parseDecimal.
 * Contoh: 10000 -> "10.000"
 */
export function formatNumber(num: any): string {
    return new Intl.NumberFormat('id-ID').format(parseDecimal(num));
}

/**
 * Memformat angka ke dalam format mata uang Rupiah.
 * Mendukung input tipe apapun berkat injeksi parseDecimal.
 * Contoh: 10000 -> "Rp 10.000"
 */
export const formatCurrency = (value: any): string => {
    // Sanitasi semua anomali tipe data sebelum diformat
    const amount = parseDecimal(value);

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * @description Menghasilkan nama file standar untuk hasil simulasi (PDF/MGC).
 * Menerapkan pola Pure Fabrication (Larman) untuk memusatkan tanggung jawab penamaan file.
 * Format: "Nama Modul_Nama Klien_DDMMYY.ext"
 * @param moduleName - Nama modul simulasi (contoh: "Budget Plan", "Insurance")
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
    const year = String(now.getFullYear()).slice(-2); // Mengambil 2 digit terakhir

    const formattedDate = `${day}${month}${year}`;

    // 3. Merakit dan mengembalikan nama file final
    return `${moduleName}_${sanitizedClientName}_${formattedDate}.${extension}`;
}