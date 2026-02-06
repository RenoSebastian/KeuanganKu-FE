// DTO untuk Payload ke Backend
export interface RiskProfilePayload {
    clientName: string;
    clientAge: number;
    answers: string[]; // ['A', 'B', 'C', ...]
}

// Enum Opsi Jawaban (Agar konsisten A/B/C)
export enum RiskAnswerValue {
    A = 'A',
    B = 'B',
    C = 'C',
}

// Struktur Data Pertanyaan UI
export interface RiskQuestion {
    id: number;
    text: string;
    options: {
        value: RiskAnswerValue;
        label: string;
    }[];
}

// DTO Response dari Backend (Sesuai Swagger BE)
export interface RiskProfileResponse {
    calculatedAt: string;
    clientName: string;
    totalScore: number;
    riskProfile: 'Konservatif' | 'Moderat' | 'Agresif';
    riskDescription: string;
    allocation: {
        lowRisk: number;    // Pasar Uang
        mediumRisk: number; // Obligasi
        highRisk: number;   // Saham
    };
}