import { z } from 'zod';
import { EducationLevel, QuizType } from '@/lib/types/education';

/**
 * ZOD SCHEMAS FOR EDUCATION MODULE
 * ------------------------------------------------------------------
 * Digunakan untuk validasi React Hook Form di sisi Frontend.
 * Disinkronkan dengan DTO Backend untuk memastikan payload valid.
 * ------------------------------------------------------------------
 */

// Regex untuk validasi path gambar (mirip dengan BE)
// Menerima: "uploads/xyz.jpg" atau "/uploads/xyz.jpg" atau URL lengkap http...
const IMAGE_PATH_REGEX = /^(http|https|\/?uploads\/)/;

// --- CATEGORY SCHEMA ---
export const categorySchema = z.object({
    name: z.string()
        .min(3, { message: "Nama kategori minimal 3 karakter" })
        .max(50, { message: "Nama kategori maksimal 50 karakter" }),
    description: z.string().optional(),
    iconUrl: z.string({ required_error: "Icon kategori wajib diupload" })
        .min(1, { message: "Silakan upload icon terlebih dahulu" })
        .regex(IMAGE_PATH_REGEX, { message: "Format path icon tidak valid" }),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

// --- MODULE SECTION SCHEMA ---
export const sectionSchema = z.object({
    title: z.string().optional(),
    contentMarkdown: z.string().min(10, { message: "Konten materi terlalu pendek (min 10 karakter)" }),
    illustrationUrl: z.string().optional(), // Path relative (uploads/...)
    sectionOrder: z.number(),
});

// --- MODULE HEADER SCHEMA ---
export const moduleFormSchema = z.object({
    title: z.string()
        .min(5, { message: "Judul modul minimal 5 karakter" })
        .max(100, { message: "Judul modul maksimal 100 karakter" }),

    categoryId: z.string({ required_error: "Kategori wajib dipilih" })
        .uuid({ message: "Format ID Kategori tidak valid" }),

    thumbnailUrl: z.string({ required_error: "Cover modul wajib diupload" })
        .min(1, { message: "Silakan upload cover modul" })
        .regex(IMAGE_PATH_REGEX, { message: "Format path gambar tidak valid" }),

    excerpt: z.string()
        .min(10, { message: "Deskripsi singkat minimal 10 karakter" })
        .max(255, { message: "Deskripsi singkat maksimal 255 karakter" }),

    level: z.nativeEnum(EducationLevel, {
        errorMap: () => ({ message: "Level kesulitan wajib dipilih" })
    }),

    readingTime: z.coerce.number()
        .min(1, { message: "Estimasi waktu baca minimal 1 menit" }),

    points: z.coerce.number()
        .min(0, { message: "Poin tidak boleh negatif" }),

    // Sections array validated
    sections: z.array(sectionSchema)
        .min(1, { message: "Minimal harus ada 1 bagian materi dalam modul" }),
});

export type ModuleFormValues = z.infer<typeof moduleFormSchema>;

// --- QUIZ BUILDER SCHEMA ---

// 1. Option Schema
const optionSchema = z.object({
    optionText: z.string().min(1, { message: "Teks opsi jawaban tidak boleh kosong" }),
    isCorrect: z.boolean().default(false),
    imageUrl: z.string().optional(), // Support gambar pada opsi
    orderIndex: z.number().optional(),
});

// Export type untuk digunakan di component OptionRow
export type QuizOptionFormValues = z.infer<typeof optionSchema>;

// 2. Question Schema
const questionSchema = z.object({
    questionText: z.string().min(5, { message: "Pertanyaan minimal 5 karakter" }),
    type: z.nativeEnum(QuizType).default(QuizType.SINGLE_CHOICE),
    points: z.coerce.number().min(1, { message: "Poin pertanyaan minimal 1" }),
    imageUrl: z.string().optional(), // Support gambar pada soal
    explanation: z.string().optional(),
    orderIndex: z.number().optional(), // Optional di form, diisi otomatis saat submit

    options: z.array(optionSchema)
        .min(2, { message: "Minimal harus ada 2 opsi jawaban" })
        .refine(
            (opts) => opts.filter((o) => o.isCorrect).length === 1,
            {
                message: "Harus ada TEPAT SATU kunci jawaban yang benar",
                path: ['options'], // Error akan di-highlight di level array options
            }
        ),
});

// Export type untuk digunakan di component QuestionCard
export type QuizQuestionFormValues = z.infer<typeof questionSchema>;

// 3. Quiz Configuration (Header) Schema
export const quizConfigSchema = z.object({
    passingScore: z.coerce.number()
        .min(0).max(100, { message: "Passing score harus antara 0 - 100" }),

    timeLimit: z.coerce.number()
        .min(0, { message: "Waktu pengerjaan tidak boleh negatif" }), // 0 = unlimited

    maxAttempts: z.coerce.number()
        .min(1, { message: "Kesempatan mencoba minimal 1 kali" }),

    description: z.string().optional(),

    questions: z.array(questionSchema)
        .min(1, { message: "Kuis harus memiliki minimal 1 pertanyaan agar bisa disimpan" }),
});

export type QuizFormValues = z.infer<typeof quizConfigSchema>;