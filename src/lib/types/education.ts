/**
 * EDUCATION TYPE DEFINITIONS
 * ------------------------------------------------------------------
 * File ini berisi seluruh Interface dan Enum yang digunakan dalam
 * modul Edukasi. Tipe ini disinkronkan dengan DTO di Backend (NestJS).
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
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
    TRUE_FALSE = 'TRUE_FALSE',
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

// [DELETED] EducationMethod dihapus karena default menggunakan FLAT (Annuity) sesuai rumus PAM Jaya.

// --- ENTITIES (Data dari GET Response) ---

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

// --- PAYLOADS ---

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

// --- AGENT SIMULATION DTOs (UPDATED: FLAT MODE) ---

export interface EducationStagePlan {
    level: SchoolLevel;
    costType: CostType;
    currentCost: number;
    yearsToStart: number;
    futureCost?: number;
    monthlySaving?: number;
}

export interface EducationChildPlan {
    childName: string;
    childDob: string;
    inflationRate: number;
    returnRate: number;
    stages: EducationStagePlan[];
    // [DELETED] method dihapus
}

export interface EducationSimulationPayload {
    // 1. Data Identitas Klien
    clientName: string;
    clientDob: string;
    clientCity: string;
    clientJob?: string;
    clientPhone?: string;

    // [DELETED] currentSaving dihapus sesuai standar PAM Jaya

    // 2. Rencana Anak (Array)
    childrenPlans: EducationChildPlan[];
}

export interface EducationSimulationResult {
    pdfBuffer?: Blob;
    filename?: string;
    mgcToken?: string;
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
                    yearsToStart?: number;
                    inflationRate?: number;
                }>;
            }
        }>;
    };
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