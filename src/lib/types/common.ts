// ============================================================================
// COMMON & SHARED TYPES
// ============================================================================

// [GLOBAL ENUM] Status Kesehatan Finansial
// Digunakan di Auth, Financial Checkup, dan Dashboard
export type HealthStatus =
    | "SEHAT"
    | "WASPADA"
    | "BAHAYA"
    | "AMAN"
    | "HATI-HATI"
    | "KURANG"
    | "IDEAL"
    | "SANGAT SEHAT";

// ============================================================================
// SEARCH & METADATA (Section 9 of Giant Types)
// ============================================================================

export interface SearchResultMetadata {
    source: "MEILI_ENGINE" | "DB_FALLBACK";
    isFuzzy: boolean;
}

export interface SearchResult {
    id: string;           // ID unik untuk list key (misal: "db_PERSON_123")
    redirectId: string;   // ID asli untuk navigasi (UUID User / Unit)
    type: "PERSON" | "UNIT";
    title: string;        // Nama User / Nama Unit
    subtitle: string;     // Email / Kode Unit
    metadata: SearchResultMetadata;
}

export interface SearchResponse {
    success: boolean;
    data: SearchResult[];
    meta: {
        total: number;
        limit: number;
        query: string;
    };
}

// ============================================================================
// UI/UX HELPERS (Section 9 of Giant Types)
// ============================================================================

export interface HelpContent {
    title: string;       // Judul field (misal: Aset Likuid)
    definition: string;  // Penjelasan singkat & padat
    includes?: string[]; // Array string: Apa saja yang masuk kategori ini
    excludes?: string[]; // Array string: Apa yang TIDAK masuk
    example?: string;    // Contoh konkret angka/kasus
}

// ============================================================================
// SIMULATION RESPONSE (Section 10 of Giant Types)
// ============================================================================

// Standard Response untuk simulasi (Preview + Download PDF)
export interface SimulationResponse {
    message: string;
    data: {
        preview: any;
        download: {
            pdf_url: string;
            mgc_token: string;
            filename_mgc: string;
        };
        recommendation: string;
    };
}