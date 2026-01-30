/**
 * @file retention.ts
 * @description Definisi tipe data statis untuk Modul Retention & Maintenance.
 * Kontrak ini harus sinkron dengan DTO Backend (Retention Module).
 */

// --- ENUMS & CONSTANTS ---

export enum RetentionEntityType {
    FINANCIAL_CHECKUP = 'FINANCIAL_CHECKUP',
    PENSION = 'PENSION',
    GOAL = 'GOAL',
    BUDGET = 'BUDGET',
    INSURANCE = 'INSURANCE',
}

// Mapping label untuk UI yang lebih manusiawi
export const EntityLabels: Record<RetentionEntityType, string> = {
    [RetentionEntityType.FINANCIAL_CHECKUP]: 'Financial Checkup (Riwayat Kesehatan)',
    [RetentionEntityType.PENSION]: 'Dana Pensiun (Simulasi)',
    [RetentionEntityType.GOAL]: 'Financial Goals (Tujuan Keuangan)',
    [RetentionEntityType.BUDGET]: 'Budgeting (Anggaran Bulanan)',
    [RetentionEntityType.INSURANCE]: 'Asuransi & Proteksi',
};

// --- DATA STRUCTURES (API RESPONSES) ---

export interface TableStatItem {
    tableName: string;
    rowCount: number;
    totalBytes: number;
    formattedSize: string;
    indexBytes: number;
}

export interface DatabaseStats {
    tables: TableStatItem[];
    totalDatabaseSize: number;
    formattedTotalSize: string;
}

// --- PAYLOADS (API REQUESTS) ---

export interface ExportQuery {
    entityType: RetentionEntityType;
    /** Format: YYYY-MM-DD */
    cutoffDate: string;
}

export interface PrunePayload extends ExportQuery {
    /**
     * Token keamanan (HMAC) yang diekstrak dari footer file JSON hasil export.
     * Wajib ada untuk otorisasi penghapusan.
     */
    pruneToken: string;
}

export interface PruneResponse {
    deletedCount: number;
    message: string;
}

// --- STREAM ENVELOPE STRUCTURE ---
// Struktur ini mencerminkan format JSON yang digenerate oleh ExportManagerService di BE.

export interface StreamMetadata {
    entityType: string;
    cutoffDate: string;
    totalRecords: number;
    exportedAt: string;
}

export interface StreamSecurity {
    integrity: string; // Expect: "END_OF_STREAM_OK"
    pruneToken: string;
}

// Note: Kita tidak mendefinisikan 'records' secara spesifik di sini
// karena kita tidak akan mem-parse array records di browser (memori intensif).
// Kita hanya butuh Metadata dan Security footer.