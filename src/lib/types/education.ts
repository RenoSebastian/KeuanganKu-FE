import { EducationStage } from "@/lib/schemas/education-simulation.schema";

// ============================================================================
// ENUMS (Sinkron dengan Prisma Schema)
// ============================================================================

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
    MONTHLY = 'ANNUAL', // Mapping ke ANNUAL untuk konsistensi DB
}

// ============================================================================
// ENTITIES (Data dari GET Response Modul Edukasi)
// ============================================================================

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
    // [FIXED] Sesuai migrasi update_module_section_array
    imageUrls: string[];
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
    lastAttemptScore?: number | null;
    isPassed?: boolean;
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

// ============================================================================
// USER QUIZ ENTITIES
// ============================================================================

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

// ============================================================================
// PAYLOADS (Untuk Admin CMS)
// ============================================================================

export interface CreateCategoryPayload {
    name: string;
    description?: string;
    iconUrl: string; // Wajib diisi (string URL hasil upload)
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> { }

export interface SectionPayload {
    id?: string;
    title: string;
    contentMarkdown: string;
    sectionOrder: number;
    // [FIXED] Menggunakan Array sesuai arsitektur baru
    imageUrls: string[];
}

export interface CreateModulePayload {
    title: string;
    categoryId: string;
    excerpt: string;
    description?: string;
    level: EducationLevel;
    readingTime: number;
    points: number;
    thumbnailUrl: string; // Wajib diisi cover-nya
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

// ============================================================================
// SUBMISSION & SIMULATION DTOs
// ============================================================================

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
            startYear: number;
            duration: number;
            costEntry: number;
            costMonthly?: number;
            costSemester?: number;
            costFull?: number;
            calculatedFutureValue?: number;
            calculatedMonthlySaving?: number;
        }>
    }>;
}

export interface EducationSimulationResponse {
    status: string;
    data: {
        totalFutureCost: number;
        totalMonthlySaving: number;
        childrenPlans: EducationSimulationPayload['childrenPlans'];
        clientName?: string;
    };
    simulationId: string;
    mgcToken: string;
    filename: string;
}

// ============================================================================
// VIEW MODELS (UI Presentation Layer)
// ============================================================================

export interface StageBreakdownItem {
    level: string;
    costType: "ENTRY" | "MONTHLY" | "SEMESTER" | "FULL" | "ANNUAL";
    yearsToStart: number;
    currentCost: number;
    futureCost: number;
    monthlySaving: number;
    requiredSaving?: number;
    item?: any;
    dueYear?: number;
    stage?: string;
    stageId?: string;
}

export interface ChildSimulationResult {
    name: string;
    age: number;
    totalFutureCost: number;
    monthlySaving: number;
    stages: StageBreakdownItem[];
    childId?: string;
    childName?: string;
    totalMonthlySaving?: number;
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
    children: ChildSimulationResult[];
    simulationId: string;
    mgcToken?: string;
    filename?: string;
}

export interface EducationCalculationResult {
    totalFutureCost: number;
    monthlySaving: number;
    stagesBreakdown: StageBreakdownItem[];
}

export interface EducationPlanResponse {
    plan: {
        id: string;
        userId: string;
        childName: string;
        childDob: string;
        createdAt: string;
        inflationRate: number;
        returnRate: number;
        method?: string;
    };
    calculation: EducationCalculationResult;
}