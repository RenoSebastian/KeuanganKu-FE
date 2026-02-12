import { RiskQuestionUI } from "@/lib/types/risk-profile";

/**
 * RISK_PROFILE_QUESTIONS
 * ------------------------------------------------------------------
 * Single Source of Truth untuk data pertanyaan kuesioner profil risiko.
 * * Technical Decisions:
 * 1. Dipisahkan dari komponen UI agar bisa di-import oleh 'QuizSection' (untuk input)
 * dan 'AnalysisResult' (untuk review jawaban).
 * 2. Menggunakan tipe 'RiskQuestionUI' untuk menjamin type-safety dengan kode lain.
 * 3. 'value' berupa number (1-3) yang merepresentasikan bobot skor:
 * - 1: Konservatif
 * - 2: Moderat
 * - 3: Agresif
 */
export const RISK_PROFILE_QUESTIONS: RiskQuestionUI[] = [
    {
        id: "q1",
        text: "Tujuan utama Anda berinvestasi adalah:",
        options: [
            { label: "Menjaga nilai uang agar tidak berkurang", value: 1 },
            { label: "Menjaga nilai + sedikit pertumbuhan", value: 2 },
            { label: "Mengembangkan aset secara maksimal", value: 3 },
        ],
    },
    {
        id: "q2",
        text: "Jangka waktu investasi utama Anda:",
        options: [
            { label: "< 3 tahun", value: 1 },
            { label: "3 – 7 tahun", value: 2 },
            { label: "> 7 tahun", value: 3 },
        ],
    },
    {
        id: "q3",
        text: "Jika nilai investasi Anda turun 10–15% dalam 6 bulan, Anda akan:",
        options: [
            { label: "Menarik dana agar tidak rugi lebih besar", value: 1 },
            { label: "Menunggu dan mengevaluasi ulang", value: 2 },
            { label: "Menambah investasi karena harga lebih murah", value: 3 },
        ],
    },
    {
        id: "q4",
        text: "Dana darurat Anda saat ini:",
        options: [
            { label: "Belum ada / < 3 bulan pengeluaran", value: 1 },
            { label: "3 – 6 bulan pengeluaran", value: 2 },
            { label: "> 6 bulan pengeluaran", value: 3 },
        ],
    },
    {
        id: "q5",
        text: "Fluktuasi nilai investasi membuat saya:",
        options: [
            { label: "Sangat tidak nyaman dan stres", value: 1 },
            { label: "Cukup khawatir tapi masih bisa menerima", value: 2 },
            { label: "Tenang dan menganggapnya hal wajar", value: 3 },
        ],
    },
    {
        id: "q6",
        text: "Pernyataan yang paling sesuai dengan Anda:",
        options: [
            { label: "Saya lebih takut rugi daripada ingin untung", value: 1 },
            { label: "Takut rugi dan ingin untung itu seimbang", value: 2 },
            { label: "Saya siap rugi jangka pendek demi hasil besar", value: 3 },
        ],
    },
    {
        id: "q7",
        text: "Pengalaman investasi Anda:",
        options: [
            { label: "Belum pernah / sangat terbatas", value: 1 },
            { label: "Sudah pernah dan cukup memahami", value: 2 },
            { label: "Aktif dan memahami risiko investasi", value: 3 },
        ],
    },
    {
        id: "q8",
        text: "Jenis investasi yang paling nyaman untuk Anda:",
        options: [
            { label: "Deposito / pasar uang", value: 1 },
            { label: "Obligasi / campuran", value: 2 },
            { label: "Saham / reksa dana saham", value: 3 },
        ],
    },
    {
        id: "q9",
        text: "Sumber penghasilan Anda:",
        options: [
            { label: "Tidak tetap / sangat fluktuatif", value: 1 },
            { label: "Cukup stabil", value: 2 },
            { label: "Sangat stabil & beragam", value: 3 },
        ],
    },
    {
        id: "q10",
        text: "Persentase dana yang akan diinvestasikan dari total aset:",
        options: [
            { label: "< 20%", value: 1 },
            { label: "20% – 50%", value: 2 },
            { label: "> 50%", value: 3 },
        ],
    },
];