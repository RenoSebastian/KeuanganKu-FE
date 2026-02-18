import { EducationStage } from "@/lib/schemas/education-simulation.schema";

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
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
    TRUE_FALSE = 'TRUE_FALSE',
}

export enum EducationProgressStatus {
    STARTED = 'STARTED',
    COMPLETED = 'COMPLETED',
}

// Enum untuk Jenjang Sekolah (Digunakan juga di DTO Simulasi)
export enum SchoolLevel {
    TK = 'TK',
    SD = 'SD',
    SMP = 'SMP',
    SMA = 'SMA',
    S1 = 'S1',
    S2 = 'S2',
}

// Enum Tipe Biaya (Digunakan untuk mapping label di UI)
export enum CostType {
    ENTRY = 'ENTRY',
    MONTHLY = 'ANNUAL', // Mapping ke ANNUAL untuk konsistensi DB lama
}

// --- ENTITIES (Data dari GET Response Modul Edukasi) ---

export interface EducationCategory {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    iconUrl: string;
    isActive: boolean;
    displayOrder: number;
    createdAt: string;
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
    timeLimit: number;
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
    description?: string;
    thumbnailUrl?: string | null;
    level: EducationLevel;
    readingTime: number;
    points: number;
    status: EducationModuleStatus;
    publishedAt?: string | null;
    categoryId: string;
    category?: EducationCategory;
    sections?: ModuleSection[];
    quiz?: Quiz | null;
    userStatus?: EducationProgressStatus | null;
    progressPercentage?: number;
    createdAt: string;
    updatedAt: string;
}

// --- USER QUIZ ENTITIES ---

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
    }[];
}

export interface UserQuizData {
    id: string;
    moduleId: string;
    timeLimit: number;
    passingScore: number;
    description?: string;
    questions: UserQuizQuestion[];
}

// --- PAYLOADS (Untuk Admin CMS) ---

export interface CreateCategoryPayload {
    name: string;
    description?: string;
    iconUrl: string;
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> { }

export interface SectionPayload {
    id?: string;
    title: string;
    contentMarkdown: string;
    sectionOrder: number;
    illustrationUrl?: string;
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

export interface UpdateModulePayload extends Partial<CreateModulePayload> { }

export interface UpdateModuleStatusPayload {
    status: EducationModuleStatus;
}

export interface QuizOptionPayload {
    id?: string;
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
    moduleId?: string;
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
}

export interface SubmitQuizPayload {
    answers: {
        questionId: string;
        selectedOptionId: string;
    }[];
}

// ============================================================================
// AGENT SIMULATION DTOs (UPDATED FOR SCENARIO B)
// ============================================================================

// 1. Payload Request (Dikirim FE -> BE)
export interface EducationSimulationPayload {
    clientName: string;
    clientDob?: string;
    clientCity: string;
    clientJob?: string;
    clientPhone?: string;

    inflationRate: number;
    returnRate: number;

    childrenPlans: Array<{
        childName: string;
        childDob: string;
        stages: Array<{
            level: SchoolLevel;
            costType?: CostType;

            // Fields Baru (Sesuai Schema Form)
            startYear: number;
            duration: number;
            costEntry: number;
            costMonthly?: number;
            costSemester?: number;
            costFull?: number;

            // Hasil Kalkulasi FE (dikirim ke BE untuk dicetak di PDF)
            calculatedFutureValue?: number;
            calculatedMonthlySaving?: number;
        }>
    }>;
}

// 2. Response Data (Diterima FE <- BE)
// Skenario B: Hanya menerima Data JSON dan ID Simulasi. Tidak ada Buffer PDF.
export interface EducationSimulationResponse {
    status: string;

    // Data angka untuk visualisasi (Grafik/Ringkasan)
    data: {
        totalFutureCost: number;
        totalMonthlySaving: number;
        childrenPlans: EducationSimulationPayload['childrenPlans'];
    };

    // ID Simulasi untuk request download terpisah
    simulationId: string;

    mgcToken: string;
    filename: string;
}

// 3. Struktur Data UI (Digunakan di Component Page & Result)
export interface StageBreakdownItem {
    level: string;
    costType: "ENTRY" | "MONTHLY" | "SEMESTER" | "FULL";
    yearsToStart: number;
    currentCost: number;
    futureCost: number;
    monthlySaving: number;
}

export interface ChildSimulationResult {
    name: string;
    age: number;
    totalFutureCost: number;
    monthlySaving: number;
    stages: StageBreakdownItem[];
}

export interface EducationSimulationResult {
    financial: {
        inflationRate: number;
        returnRate: number;
    };
    summary: {
        totalChildren: number;
        totalFutureCost: number;
        totalMonthlyInvestment: number;
    };

    // Data Breakdown untuk UI (Wajib ada untuk render grafik/tabel)
    children: ChildSimulationResult[];

    // Data State (Updated for Scenario B)
    simulationId: string; // ID Database untuk Download on Demand
    mgcToken?: string;
    filename?: string;
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
    entityId?: string;
    cutoffDate: string;
    pruneToken: string;
}