/**
 * EDUCATION TYPE DEFINITIONS
 * ------------------------------------------------------------------
 * File ini berisi seluruh Interface dan Enum yang digunakan dalam
 * modul Edukasi. Tipe ini disinkronkan dengan DTO di Backend (NestJS).
 *
 * Prinsip:
 * 1. Interface 'Entity' merepresentasikan data lengkap dari Database.
 * 2. Interface 'Payload' merepresentasikan data yang dikirim ke API.
 * ------------------------------------------------------------------
 */

// --- ENUMS (Sinkron dengan Prisma Schema) ---

export enum EducationModuleStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
}

export enum EducationLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
}

export enum QuizType {
    SINGLE_CHOICE = 'SINGLE_CHOICE',
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE', // Persiapan future-proof
    TRUE_FALSE = 'TRUE_FALSE',           // Persiapan future-proof
}

export enum EducationProgressStatus {
    STARTED = 'STARTED',
    COMPLETED = 'COMPLETED',
}

export enum SchoolLevel {
    TK = 'TK',
    SD = 'SD',
    SMP = 'SMP',
    SMA = 'SMA',
    S1 = 'S1',
    S2 = 'S2',
}

export enum CostType {
    ENTRY = 'ENTRY',
    ANNUAL = 'ANNUAL',
}

export enum EducationMethod {
    ARITHMETIC = 'ARITHMETIC',
    GEOMETRIC = 'GEOMETRIC',
}

// --- ENTITIES (Data dari GET Response) ---

export interface EducationCategory {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    iconUrl: string;
    isActive: boolean;
    displayOrder: number;
    createdAt: string; // ISO Date String
    updatedAt: string;
    _count?: {
        modules: number;
    };
}

export interface ModuleSection {
    id: string;
    moduleId: string;
    sectionOrder: number;
    title: string;
    contentMarkdown: string;
    illustrationUrl?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface QuizOption {
    id: string;
    questionId: string;
    optionText: string;
    isCorrect: boolean;
    imageUrl?: string | null;
    orderIndex: number;
}

export interface QuizQuestion {
    id: string;
    quizId: string;
    questionText: string;
    type: QuizType;
    imageUrl?: string | null;
    points: number;
    orderIndex: number;
    explanation?: string | null;
    options: QuizOption[];
}

export interface Quiz {
    id: string;
    moduleId: string;
    passingScore: number;
    timeLimit: number; // Dalam menit
    maxAttempts: number;
    description?: string | null;
    questions: QuizQuestion[];
    createdAt: string;
    updatedAt: string;
}

export interface EducationModule {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    description?: string; // Optional di list, mungkin ada di detail
    thumbnailUrl?: string | null;
    level: EducationLevel;

    // [FIX] Renamed duration -> readingTime to match DTO & Form Schema
    readingTime: number;

    points: number;
    status: EducationModuleStatus;
    publishedAt?: string | null;

    // Relasi
    categoryId: string;
    category?: EducationCategory; // Populated data
    sections?: ModuleSection[];
    quiz?: Quiz | null;

    // [CRITICAL] User Context Fields (Populated for Logged-in User)
    userStatus?: EducationProgressStatus | null; // null = Belum mulai
    progressPercentage?: number; // 0-100

    createdAt: string;
    updatedAt: string;
}

// --- USER QUIZ ENTITIES (Secure / Zero Leakage) ---
// Digunakan saat Pegawai mengerjakan kuis. TIDAK BOLEH ada isCorrect.

export interface UserQuizQuestion {
    id: string;
    questionText: string;
    type: QuizType;
    imageUrl?: string | null;
    points: number;
    orderIndex: number;
    options: {
        id: string;
        optionText: string;
        imageUrl?: string | null;
        // [SECURITY] isCorrect HARAM ada di sini
    }[];
}

export interface UserQuizData {
    id: string; // Quiz ID
    moduleId: string;
    timeLimit: number;
    passingScore: number;
    description?: string;
    questions: UserQuizQuestion[];
}

// --- PAYLOADS (Data untuk POST/PUT Request) ---

export interface CreateCategoryPayload {
    name: string;
    description?: string;
    iconUrl: string; // Wajib upload media dulu
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> { }

export interface SectionPayload {
    id?: string; // Optional untuk section baru
    title: string;
    contentMarkdown: string;
    sectionOrder: number;
    illustrationUrl?: string; // Path relative (uploads/...)
}

export interface CreateModulePayload {
    title: string;
    categoryId: string;
    excerpt: string;
    description?: string;
    level: EducationLevel;
    readingTime: number;
    points: number;
    thumbnailUrl?: string;
    sections: SectionPayload[];
}

export interface UpdateModulePayload extends Partial<CreateModulePayload> {
    // Status diupdate via endpoint khusus biasanya
}

export interface UpdateModuleStatusPayload {
    status: EducationModuleStatus;
}

export interface QuizOptionPayload {
    id?: string; // Jika edit option lama
    optionText: string;
    isCorrect: boolean;
    imageUrl?: string;
    orderIndex: number;
}

export interface QuizQuestionPayload {
    id?: string;
    questionText: string;
    type: QuizType;
    imageUrl?: string;
    points: number;
    orderIndex: number;
    explanation?: string;
    options: QuizOptionPayload[];
}

export interface UpsertQuizPayload {
    moduleId?: string; // Optional context helper
    passingScore: number;
    timeLimit: number;
    maxAttempts: number;
    description?: string;
    questions: QuizQuestionPayload[];
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

// --- UTILITY TYPES ---

export interface DatabaseStats {
    tables: {
        tableName: string;
        rowCount: number;
        totalBytes: number;
        formattedSize: string;
        indexBytes: number;
    }[];
    totalDatabaseSize: number;
    formattedTotalSize: string;
}

export interface PruneExecutionPayload {
    entityType: string;
    entityId?: string; // [OPTIONAL] Bisa spesifik ID
    cutoffDate: string;
    pruneToken: string;
}

// --- AGENT SIMULATION DTOs (UPDATED: STRICT MODE) ---

export interface EducationStagePlan {
    level: SchoolLevel;
    costType: CostType;
    currentCost: number;
    yearsToStart: number;
    // futureCost & monthlySaving dihitung di backend,
    futureCost?: number;
    monthlySaving?: number;
}

export interface EducationChildPlan {
    childName: string;
    childDob: string; // YYYY-MM-DD

    // [UPDATED] Opsi Ekonomi per Anak dibuat REQUIRED.
    // Ini memaksa Frontend untuk selalu memberikan nilai default (misal: GEOMETRIC, 10, 12).
    // Hal ini mencegah error "undefined" saat mapping data di Page/Component.
    method: EducationMethod;
    inflationRate: number;
    returnRate: number;

    stages: EducationStagePlan[];
}

export interface EducationSimulationPayload {
    // 1. Data Identitas Klien
    clientName: string;
    clientDob: string;
    clientCity: string;
    // Pekerjaan dan Telepon tetap opsional di form, tapi di payload kita bisa kirim empty string
    clientJob?: string;
    clientPhone?: string;

    // 2. Konteks Finansial
    currentSaving?: number; // Tabungan existing

    // 3. Rencana Anak (Array)
    childrenPlans: EducationChildPlan[];
}

// Interface untuk menampung Response Hasil Kalkulasi dari Backend
export interface EducationSimulationResult {
    pdfBuffer?: Blob;
    filename?: string;
    mgcToken?: string;

    // Struktur Data Detail untuk UI Step 3
    data?: {
        totalMonthlyInvestment: number;
        totalFutureCost: number;
        details: Array<{
            childName: string;
            summary: {
                totalFutureCost: number;
                totalMonthlySaving: number;
            };
            detail: {
                stagesBreakdown: Array<{
                    level: SchoolLevel;
                    currentCost: number;
                    futureCost: number;
                    monthlySaving: number;
                    // Properti tambahan untuk display jika diperlukan
                    yearsToStart?: number;
                    inflationRate?: number;
                }>;
            }
        }>;
    };
}