/**
 * ======================================================
 * PDF BUDGETING — TYPES
 * ======================================================
 * Kontrak data khusus untuk:
 * - HTML Renderer Budgeting
 * - PDF Generator Budgeting
 *
 * ❗ Tidak bergantung ke FE / UI component
 * ❗ Aman dipakai di server / worker / edge
 */

/**
 * Data utama yang akan dirender ke HTML
 */
export interface BudgetPDFData {
    name: string;
    monthYear: string;

    fixedIncome: number;
    variableIncome: number;

    safeToSpend: number;

    allocations: BudgetPDFAllocation[];
}

/**
 * Alokasi per pos (hasil simulasi)
 */
export interface BudgetPDFAllocation {
    label: string;
    percentage: number;
    amount: number;
    description: string;

    /**
     * Hex color untuk visual PDF
     * contoh: #2563eb
     */
    color: string;
}
