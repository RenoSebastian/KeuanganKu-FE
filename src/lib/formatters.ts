/**
 * @file formatters.ts
 * @description Kumpulan fungsi utilitas murni untuk memformat data mentah menjadi bentuk yang human-readable.
 * Digunakan secara luas di komponen UI untuk konsistensi visual.
 */

/**
 * @description Memparsing nilai angka dari berbagai tipe data, termasuk raw object Decimal dari Prisma.
 * Mengatasi masalah NaN ketika backend mengirimkan struktur internal decimal.js { s, e, d }.
 * Menerapkan pola Adapter (Protected Variations) untuk memproteksi UI dari anomali data API.
 * @param value - Data mentah yang akan diparsing (number, string, atau Prisma Decimal Object)
 * @returns Angka primitif yang valid untuk komputasi (default: 0)
 */
export function parseDecimal(value: any): number {
    if (value === null || value === undefined) return 0;

    // [FIX] Penambalan kebocoran spesifikasi JS di mana typeof NaN === 'number'
    if (typeof value === 'number') return Number.isNaN(value) ? 0 : value;

    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return Number.isNaN(parsed) ? 0 : parsed;
    }

    // Deteksi objek raw Decimal (decimal.js) dari backend: ex { s: 1, e: 6, d: [1470000] }
    if (typeof value === 'object' && 'd' in value && Array.isArray(value.d)) {
        try {
            // Ekstrak array digit menjadi string utuh
            const digitsString = value.d.join('');
            const digitsNumber = parseFloat(digitsString);

            if (Number.isNaN(digitsNumber)) return 0;

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

/**
 * @description Memformat nilai waktu (string ISO atau objek Date) menjadi representasi lokal yang presisi.
 * Dilengkapi dengan Auto-Healing untuk anomali format SQL, objek cacat, dan sensor diagnostik.
 * @param dateInput - String ISO 8601, SQL datetime, epoch number, atau objek Date.
 * @returns String terformat (contoh: "12 Jan 2026, 14:30") atau fallback "-" jika input cacat absolut.
 */
export function formatDateTime(dateInput?: string | number | Date | any | null): string {
    // Lapis 1: Intersepsi mutlak untuk nilai falsy
    if (!dateInput) {
        // Hanya log jika bukan sekadar undefined biasa untuk mengurangi noise
        if (dateInput !== undefined) {
            console.warn("[Formatters] Fallback terpicu! dateInput bernilai falsy:", dateInput);
        }
        return '-';
    }

    let parseableInput = dateInput;

    // Lapis 2: Penanganan Objek Kosong dan Objek Cacat dari Backend
    if (typeof parseableInput === 'object') {
        // Jika objek kosong {} atau tidak memiliki metode getTime (berarti bukan instans Date yang valid)
        if (Object.keys(parseableInput).length === 0 && !(parseableInput instanceof Date)) {
            console.warn("[Formatters] Input berupa objek kosong atau rusak dari backend:", dateInput);
            return '-'; // Atau fallback lain jika Anda ingin, misal '-'
        }
    }

    // Lapis 3: Auto-Healing untuk Format SQL Mentah
    if (typeof parseableInput === 'string') {
        // Tangkap string representasi objek yang gagal diserialisasi
        if (parseableInput === "[object Object]") {
            console.warn("[Formatters] Menerima [object Object] string. Serialisasi backend gagal.");
            return '-';
        }

        // Jika formatnya memiliki spasi tapi tidak ada identifier 'T' (Indikasi SQL timestamp)
        // Contoh: "2026-03-21 21:35:14" -> "2026-03-21T21:35:14Z"
        if (parseableInput.includes(' ') && !parseableInput.includes('T')) {
            parseableInput = parseableInput.replace(' ', 'T');
            // Injeksi identifier zona waktu absolut jika tidak ada, mencegah offset bergeser
            if (!parseableInput.endsWith('Z')) {
                parseableInput += 'Z';
            }
        }
    }

    // Lapis 4: Instansiasi objek tanggal yang terisolasi
    const dateObj = new Date(parseableInput);

    // Lapis 5: Evaluasi integritas penanggalan
    if (Number.isNaN(dateObj.getTime())) {
        console.warn("[Formatters] Gagal merekonstruksi penanggalan! Raw input tidak dikenali:", dateInput);
        return '-';
    }

    // Lapis 6: Pendelegasian ke API Internasionalisasi ECMA-402
    const formatter = new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

    return formatter.format(dateObj).replace(/\./g, ':');
}