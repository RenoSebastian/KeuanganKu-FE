// src/lib/schemas/education-schema.ts
import { z } from 'zod';
import { QuizQuestionType } from '../types/education';

// --- MODULE FORM SCHEMA ---

export const sectionSchema = z.object({
    title: z.string().optional(),
    contentMarkdown: z.string().min(10, 'Konten materi terlalu pendek (min 10 karakter)'),
    illustrationUrl: z.string().optional(),
    sectionOrder: z.number(),
});

export const moduleFormSchema = z.object({
    title: z.string().min(5, 'Judul modul minimal 5 karakter'),
    categoryId: z.string().uuid('Pilih kategori yang valid'),
    thumbnailUrl: z.string().url('URL gambar tidak valid'),
    excerpt: z.string().min(10, 'Ringkasan minimal 10 karakter'),
    readingTime: z.number().min(1, 'Estimasi waktu baca minimal 1 menit'),
    sections: z.array(sectionSchema).min(1, 'Minimal harus ada 1 bagian materi'),
});

// --- QUIZ BUILDER SCHEMA (Complex) ---

export const quizOptionSchema = z.object({
    optionText: z.string().min(1, 'Teks opsi jawaban tidak boleh kosong'),
    isCorrect: z.boolean().default(false),
});

export const quizQuestionSchema = z.object({
    questionText: z.string().min(5, 'Pertanyaan minimal 5 karakter'),
    type: z.nativeEnum(QuizQuestionType).default(QuizQuestionType.SINGLE_CHOICE),
    orderIndex: z.number(),
    explanation: z.string().optional(),
    options: z
        .array(quizOptionSchema)
        .min(2, 'Minimal harus ada 2 pilihan jawaban')
        .refine(
            (options) => options.filter((opt) => opt.isCorrect).length === 1,
            {
                message: 'Harus ada TEPAT SATU kunci jawaban yang benar',
                path: ['options'], // Error akan muncul di field options
            }
        ),
});

export const quizFormSchema = z.object({
    passingScore: z.coerce
        .number()
        .min(0)
        .max(100, 'Nilai kelulusan maksimal 100'),
    timeLimit: z.coerce
        .number()
        .min(0, 'Waktu pengerjaan tidak boleh minus'),
    maxAttempts: z.coerce
        .number()
        .min(1, 'Minimal 1 kali kesempatan'),
    description: z.string().optional(),
    questions: z
        .array(quizQuestionSchema)
        // Kita izinkan array kosong saat Draft di FE, tapi logic validasi submit ada di BE
        // Namun untuk UX yang baik, kita bisa warn user jika kosong
        .default([]),
});

// Export type inferensi dari Zod untuk dipakai di React Hook Form
export type ModuleFormValues = z.infer<typeof moduleFormSchema>;
export type QuizFormValues = z.infer<typeof quizFormSchema>;