// src/lib/agent-quotes.ts

export const AGENT_QUOTES = [
    "Perlindungan hari ini adalah ketenangan masa depan bagi klien Anda.",
    "Setiap penolakan mendekatkan Anda pada satu persetujuan besar.",
    "Anda tidak hanya menjual kertas, Anda menjual kepastian hidup.",
    "Jadilah pendengar yang baik sebelum menjadi pembicara yang hebat.",
    "Trust adalah mata uang paling berharga dalam bisnis ini.",
    "Bantu orang lain mencapai impian mereka, dan Anda akan mencapai impian Anda.",
    "Edukasi, bukan intimidasi. Beri solusi, bukan sekadar janji.",
    "Klien membeli karena mereka percaya pada Anda, bukan hanya produknya.",
    "Kesuksesan agen diukur dari berapa banyak keluarga yang berhasil diamankan.",
    "Konsistensi adalah kunci. Teruslah bergerak, teruslah melayani."
];

export function getRandomQuote(): string {
    const randomIndex = Math.floor(Math.random() * AGENT_QUOTES.length);
    return AGENT_QUOTES[randomIndex];
}