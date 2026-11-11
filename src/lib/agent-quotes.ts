// src/lib/agent-quotes.ts

export const AGENT_QUOTES = [
    "Perencanaan keuangan hari ini adalah ketenangan masa depan bagi keluarga Anda.",
    "Bukan seberapa banyak uang yang Anda hasilkan, tapi seberapa banyak yang berhasil Anda simpan dan kembangkan.",
    "Disiplin menyisihkan uang adalah jembatan antara tujuan finansial dan pencapaian nyata.",
    "Rencana keuangan yang baik memberi Anda kendali penuh atas masa depan finansial Anda.",
    "Efek bunga majemuk adalah keajaiban dunia ke-8. Mulailah sedini mungkin.",
    "Kemandirian finansial dimulai dari keputusan kecil yang konsisten setiap hari.",
    "Lindungi apa yang sudah Anda bangun dengan manajemen risiko dan proteksi yang tepat.",
    "Kebebasan finansial bukan tentang menjadi kaya raya, tetapi memiliki pilihan hidup.",
    "Investasi terbaik yang dapat Anda lakukan adalah berinvestasi pada literasi keuangan Anda sendiri.",
    "Konsistensi adalah kunci. Teruslah melangkah menuju masa depan finansial yang terarah."
];

export function getRandomQuote(): string {
    const randomIndex = Math.floor(Math.random() * AGENT_QUOTES.length);
    return AGENT_QUOTES[randomIndex];
}