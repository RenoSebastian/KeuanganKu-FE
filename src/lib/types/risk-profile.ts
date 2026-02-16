// ============================================================================
// 1. REQUEST PAYLOAD (INPUT KE BACKEND)
// ============================================================================

/**
 * Representasi satu jawaban kuesioner.
 */
export interface RiskProfileAnswerItem {
    questionId: string;
    value: number; // Bobot nilai (skor)
}

/**
 * [FIX]: Tambahkan Alias agar RiskProfilePayload dikenali oleh Wizard
 * Ini menyelesaikan error: Module has no exported member 'RiskProfilePayload'
 */
export type RiskProfilePayload = CreateRiskProfileSimulationDto;

/**
 * DTO Utama untuk membuat simulasi
 */
export interface CreateRiskProfileSimulationDto {
    clientName: string;
    clientDob: string; // Format: YYYY-MM-DD
    clientPhone?: string;
    clientJob?: string;
    clientCity?: string;
    // Mendukung input berupa Array (dari UI state) atau Map (dari raw form data)
    answers: Record<string, string> | RiskProfileAnswerItem[];
}

// ============================================================================
// 2. RESPONSE & TOKEN STRUCTURE (DATA DARI BACKEND)
// ============================================================================

export enum RiskProfileCategory {
    KONSERVATIF = 'Konservatif',
    MODERAT = 'Moderat',
    AGRESIF = 'Agresif',
}

/**
 * Struktur Alokasi Aset.
 */
export interface RiskAllocation {
    lowRisk: number;    // Pasar Uang / Deposito
    mediumRisk: number; // Obligasi / Pendapatan Tetap
    highRisk: number;   // Saham / Ekuitas
}

/**
 * Hasil murni kalkulasi (Core Analysis)
 */
export interface RiskAnalysisResult {
    totalScore: number;
    profile: RiskProfileCategory;
    description: string;
    allocation: RiskAllocation;
}

/**
 * Struktur lengkap data yang ada di dalam Token .mgc
 */
export interface RiskProfileSimulationResult {
    meta: {
        version: string;
        generatedAt: string;
        agentId: string;
        module: 'RISK_PROFILE';
    };
    client: {
        name: string;
        dob: string;
        city?: string;
        job?: string;
        phone?: string;
    };
    financial: {
        // [FIX] Fleksibilitas tipe data untuk parsing token
        answers: Record<string, string> | RiskProfileAnswerItem[];
    };
    result: RiskAnalysisResult;
}

/**
 * Return Value dari Service Frontend ke UI Component.
 */
export interface RiskProfileServiceResponse {
    pdfUrl: string;
    token: string;
    data: RiskProfileSimulationResult;
}

// ============================================================================
// 3. UI HELPER TYPES (FRONTEND ONLY)
// ============================================================================

export interface RiskQuestionUI {
    id: string;
    text: string;
    options: {
        label: string;
        value: number;
    }[];
}