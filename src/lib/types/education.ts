// src/lib/types/education.ts

// --- ENUMS (Mirror from Prisma) ---
export enum EducationModuleStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
}

export enum QuizQuestionType {
    SINGLE_CHOICE = 'SINGLE_CHOICE',
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
    // MULTIPLE_CHOICE (Future Proofing)
}

export enum EducationProgressStatus {
    STARTED = 'STARTED',
    COMPLETED = 'COMPLETED',
}

// --- ENTITIES (Mirror from Backend Responses) ---

export interface EducationCategory {
    id: string;
    name: string;
    slug: string;
    iconUrl: string;
    displayOrder: number;
}

export interface ModuleSection {
    id: string; // or temp_id for FE creation
    sectionOrder: number;
    title?: string | null;
    contentMarkdown: string;
    illustrationUrl?: string | null;
}

export interface EducationModule {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl: string;
    excerpt: string;
    readingTime: number;
    status: EducationModuleStatus;
    publishedAt?: Date | string | null;
    category: EducationCategory;
    sections?: ModuleSection[];

    // [CRITICAL] User Context Fields
    // Field ini di-populate oleh Backend saat request dilakukan oleh User Login
    userStatus?: EducationProgressStatus | null; // null = Belum mulai
    progressPercentage?: number; // 0-100
}

// --- ADMIN QUIZ ENTITIES (Full Access) ---

export interface QuizOption {
    id?: string; // Optional saat create baru di FE
    optionText: string;
    isCorrect: boolean;
}

export interface QuizQuestion {
    id?: string;
    questionText: string;
    type: QuizQuestionType;
    orderIndex: number;
    explanation?: string | null;
    options: QuizOption[];
}

export interface QuizHeader {
    id?: string;
    passingScore: number;
    timeLimit: number; // in minutes
    maxAttempts: number;
    description?: string | null;
    questions: QuizQuestion[];
}

// --- USER QUIZ ENTITIES (Secure / Zero Leakage) ---
// Digunakan saat Pegawai mengerjakan kuis. TIDAK BOLEH ada isCorrect.

export interface UserQuizData {
    id: string;
    moduleId: string;
    timeLimit: number;
    passingScore: number;
    description?: string;
    questions: {
        id: string;
        questionText: string;
        type: QuizQuestionType;
        options: {
            id: string;
            optionText: string;
            // [SECURITY] isCorrect HARAM ada di sini
        }[];
    }[];
}

// --- API DTOs (Payloads sent to BE) ---

export interface CreateModulePayload {
    categoryId: string;
    title: string;
    thumbnailUrl: string;
    excerpt: string;
    readingTime: number;
    sections: Omit<ModuleSection, 'id'>[]; // ID digenerate BE
}

export interface UpdateModulePayload extends Partial<CreateModulePayload> { }

export interface UpdateModuleStatusPayload {
    status: EducationModuleStatus;
}

// DTO Khusus Quiz Admin (Mirror UpsertQuizDto)
export interface UpsertQuizPayload {
    passingScore: number;
    timeLimit: number;
    maxAttempts: number;
    description?: string;
    questions: {
        questionText: string;
        type: QuizQuestionType;
        orderIndex: number;
        explanation?: string;
        options: {
            optionText: string;
            isCorrect: boolean;
        }[];
    }[];
}

// --- SUBMISSION DTOs ---

export interface QuizSubmissionResult {
    score: number;
    isPassed: boolean;
    attemptsUsed: number;
    maxAttempts: number;
    message: string;
    // Opsional: Detail jawaban benar/salah jika kebijakan mengizinkan review
}

export interface SubmitQuizPayload {
    answers: {
        questionId: string;
        selectedOptionId: string;
    }[];
}