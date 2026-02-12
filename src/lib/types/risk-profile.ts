// ============================================================================
// 1. REQUEST PAYLOAD (INPUT KE BACKEND)
// ============================================================================

/**
 * Representasi satu jawaban kuesioner.
 * Backend menjumlahkan 'value' untuk menentukan skor total.
 */
export interface RiskProfileAnswerItem {
    questionId: string;
    value: number; // PENTING: Ini adalah bobot nilai (skor), bukan urutan A/B/C
}

/**
 * DTO Utama yang dikirim ke endpoint /financial/simulation/risk-profile-pdf
 * Harus match dengan CreateRiskProfileSimulationDto di Backend.
 */
export interface RiskProfilePayload {
    clientName: string;
    clientDob: string; // Format: YYYY-MM-DD (ISO 8601)
    clientPhone?: string;
    clientJob?: string;
    clientCity?: string;
    answers: RiskProfileAnswerItem[];
}

// ============================================================================
// 2. RESPONSE & TOKEN STRUCTURE (DATA DARI BACKEND)
// ============================================================================

export enum RiskProfileCategory {
    KONSERVATIF = 'Konservatif',
    MODERAT = 'Moderat',
    AGRESIF = 'Agresif',
}

export interface RiskAllocation {
    low: number;    // Pasar Uang / Deposito
    medium: number; // Obligasi / Pendapatan Tetap
    high: number;   // Saham / Ekuitas
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
 * Digunakan untuk restore state atau menampilkan chart setelah simulasi.
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
        answers: RiskProfileAnswerItem[];
    };
    result: RiskAnalysisResult;
}

/**
 * Return Value dari Service Frontend ke UI Component
 * Menggabungkan URL PDF dan Data JSON.
 */
export interface RiskProfileServiceResponse {
    pdfUrl: string;       // Blob URL untuk preview/download PDF
    token: string;        // Raw Token String (.mgc)
    data: RiskProfileSimulationResult; // Data hasil decode untuk UI Chart
}

// ============================================================================
// 3. UI HELPER TYPES (FRONTEND ONLY)
// ============================================================================

/**
 * Struktur Data Pertanyaan untuk QuizSection Component
 */
export interface RiskQuestionUI {
    id: string;
    text: string;
    options: {
        label: string;
        value: number;
    }[];
}