"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuizRunner } from "./quiz-runner-flat"; // Kita buat file pendukung di bawah
import { UserQuizData } from "@/services/employee-education.service";
import { ChevronLeft } from "lucide-react";

interface FinancialQuizViewProps {
  onBack: () => void;
}

// CONTOH DATA KUIS (Bisa Anda tambah/ubah sesuai kebutuhan)
const MOCK_QUIZ: UserQuizData = {
  id: "kuis-umum-001",
  title: "Kuis Ini Contohnya",
  description: "Uji wawasan Anda di sini!",
  timeLimit: 1000, // 10 menit
  questions: [
    {
      id: "q1",
      questionText: "Tujuan utama Anda berinvestasi adalah:",
      options: [
        { id: "a1", optionText: "A. Menjaga nilai uang agar tidak berkurang" },
        { id: "a2", optionText: "B. Menjaga nilai + sedikit pertumbuhan" },
        { id: "a3", optionText: "C. Mengembangkan aset secara maksimal" },
      ],
      // Tambahkan property ini untuk validasi lokal nanti
      // @ts-ignore (karena interface aslinya mungkin tidak punya correctOptionId)
      correctOptionId: "a1"
    },
    {
      id: "q2",
      questionText: "Jangka waktu investasi utama Anda:",
      options: [
        { id: "b1", optionText: "A. < 3 tahun" },
        { id: "b2", optionText: "B. 3 – 7 tahun" },
        { id: "b3", optionText: "C. > 7 tahun" },
      ],
      // @ts-ignore
      correctOptionId: "b3"
    },
    {
      id: "q3",
      questionText: "Jika nilai investasi Anda turun 10–15% dalam 6 bulan, Anda akan:",
      options: [
        { id: "b1", optionText: "A. Menarik dana agar tidak rugi lebih besar" },
        { id: "b2", optionText: "B. Menunggu dan mengevaluasi ulang" },
        { id: "b3", optionText: "C. Menambah investasi karena harga lebih murah" },
      ],
      // @ts-ignore
      correctOptionId: "b3"
    },
    {
      id: "q4",
      questionText: "Dana darurat Anda saat ini:",
      options: [
        { id: "b1", optionText: "A. Belum ada / < 3 bulan pengeluaran" },
        { id: "b2", optionText: "B. 3 – 6 bulan pengeluaran" },
        { id: "b3", optionText: "C. > 6 bulan pengeluaran" },
      ],
      // @ts-ignore
      correctOptionId: "b3"
    },
    {
      id: "q5",
      questionText: "Fluktuasi nilai investasi membuat saya:",
      options: [
        { id: "b1", optionText: "A. Sangat tidak nyaman dan stres" },
        { id: "b2", optionText: "B. Cukup khawatir tapi masih bisa menerima" },
        { id: "b3", optionText: "C. Tenang dan menganggapnya hal wajar" },
      ],
      // @ts-ignore
      correctOptionId: "b3"
    },
    {
      id: "q6",
      questionText: "Pernyataan yang paling sesuai dengan Anda:",
      options: [
        { id: "b1", optionText: "A. Saya lebih takut rugi daripada ingin untung" },
        { id: "b2", optionText: "B. Takut rugi dan ingin untung itu seimbang" },
        { id: "b3", optionText: "C. Saya siap rugi jangka pendek demi hasil besar" },
      ],
      // @ts-ignore
      correctOptionId: "b3"
    },
    {
      id: "q7",
      questionText: "Pengalaman investasi Anda:",
      options: [
        { id: "b1", optionText: "A. Belum pernah / sangat terbatas" },
        { id: "b2", optionText: "B. Sudah pernah dan cukup memahami" },
        { id: "b3", optionText: "C. Aktif dan memahami risiko investasi" },
      ],
      // @ts-ignore
      correctOptionId: "b3"
    },
    {
      id: "q8",
      questionText: "Jenis investasi yang paling nyaman untuk Anda:",
      options: [
        { id: "b1", optionText: "A. Deposito / pasar uang" },
        { id: "b2", optionText: "B. Obligasi / campuran" },
        { id: "b3", optionText: "C. Saham / reksa dana saham" },
      ],
      // @ts-ignore
      correctOptionId: "b3"
    },
    {
      id: "q9",
      questionText: "Sumber penghasilan Anda:",
      options: [
        { id: "b1", optionText: "A. Tidak tetap / sangat fluktuatif" },
        { id: "b2", optionText: "B. Cukup stabil" },
        { id: "b3", optionText: "C. Sangat stabil & beragam" },
      ],
      // @ts-ignore
      correctOptionId: "b3"
    },
    {
      id: "q10",
      questionText: "Persentase dana yang akan diinvestasikan dari total aset:",
      options: [
        { id: "b1", optionText: "A. < 20%" },
        { id: "b2", optionText: "B. 20% – 50%" },
        { id: "b3", optionText: "C. > 50%" },
      ],
      // @ts-ignore
      correctOptionId: "b3"
    }
  ]
};

export function FinancialQuizView({ onBack }: FinancialQuizViewProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto mb-6">
        <Button variant="ghost" onClick={onBack} className="hover:bg-white">
          <ChevronLeft className="w-4 h-4 mr-2" /> Kembali ke Hasil Diagnosa
        </Button>
      </div>

      <div className="max-w-4xl mx-auto text-center mb-10">
        <p className="text-slate-500 mt-2">{MOCK_QUIZ.description}</p>
      </div>

      {/* Gunakan QuizRunner yang sudah kita buat tanpa backend */}
      <QuizRunner
        quiz={MOCK_QUIZ as any}
        mode="PREVIEW"
      />
    </div>
  );
}