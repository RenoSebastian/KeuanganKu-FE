import { z } from "zod";

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export const SchoolLevelEnum = z.enum(["TK", "SD", "SMP", "SMA", "S1", "S2"]);

export type SchoolLevelType = z.infer<typeof SchoolLevelEnum>;

// Default durasi untuk UX auto-fill (Bisa diedit user)
export const DEFAULT_STAGE_DURATION: Record<SchoolLevelType, number> = {
    TK: 2,
    SD: 6,
    SMP: 3,
    SMA: 3,
    S1: 4,
    S2: 2,
};

// ============================================================================
// 1. STAGE SCHEMA (VALIDASI JENJANG & BIAYA)
// ============================================================================

export const educationStageSchema = z.object({
    level: SchoolLevelEnum,

    startYear: z.coerce
        .number()
        .min(new Date().getFullYear(), { message: "Tahun masuk minimal tahun ini" }),

    duration: z.coerce
        .number()
        .min(1, { message: "Durasi minimal 1 tahun" }),

    // --- KOMPONEN BIAYA ---
    // Hapus invalid_type_error di dalam coerce.number() untuk menghindari TS Error 2353

    costEntry: z.coerce
        .number()
        .min(0, { message: "Uang pangkal tidak boleh negatif" }),

    costMonthly: z.coerce.number().optional(),
    costSemester: z.coerce.number().optional(),
    costFull: z.coerce.number().optional(),

    // Field Kalkulasi (Opsional, diisi oleh Logic FE nanti)
    calculatedFutureValue: z.number().optional(),
    calculatedMonthlySaving: z.number().optional(),
})
    .superRefine((data, ctx) => {
        // --- VALIDASI KONDISIONAL BERDASARKAN JENJANG ---

        // 1. Validasi S1 (Wajib UKT Semester)
        if (data.level === "S1") {
            if ((data.costSemester || 0) <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "UKT per semester wajib diisi untuk S1",
                    path: ["costSemester"],
                });
            }
        }
        // 2. Validasi S2 (Wajib Biaya Full/Lumpsum)
        else if (data.level === "S2") {
            if ((data.costFull || 0) <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Biaya total (paket) wajib diisi untuk S2",
                    path: ["costFull"],
                });
            }
        }
        // 3. Validasi Sekolah Biasa (TK - SMA) Wajib SPP Bulanan
        else {
            if ((data.costMonthly || 0) <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "SPP Bulanan wajib diisi untuk jenjang ini",
                    path: ["costMonthly"],
                });
            }
        }
    });

// ============================================================================
// 2. CHILD SCHEMA (DATA ANAK)
// ============================================================================

export const educationChildSchema = z.object({
    // ID Lokal untuk key di map/array (generate uuid di FE)
    localId: z.string().optional(),

    childName: z.string().min(1, { message: "Nama anak wajib diisi" }),

    childDob: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', {
        message: "Tanggal lahir tidak valid",
    }),

    // Array Jenjang Sekolah
    stages: z.array(educationStageSchema).min(1, {
        message: "Minimal pilih 1 jenjang sekolah untuk disimulasikan"
    }),
});

// ============================================================================
// 3. MAIN SIMULATION SCHEMA (ROOT FORM)
// ============================================================================

export const educationSimulationSchema = z.object({
    // --- A. IDENTITAS KLIEN (ORANG TUA) ---
    clientName: z.string().min(1, { message: "Nama klien wajib diisi" }),

    clientDob: z.string().optional(), // Opsional agar tidak blocking sales flow

    clientCity: z.string().min(1, { message: "Kota domisili wajib diisi" }),

    clientJob: z.string().optional(),
    clientPhone: z.string().optional(),

    // --- B. ASUMSI EKONOMI ---
    inflationRate: z.coerce
        .number()
        .min(0, "Minimal 0%")
        .max(100, "Maksimal 100%")
        .default(10), // Default Inflasi Pendidikan 10%

    returnRate: z.coerce
        .number()
        .min(0)
        .max(100)
        .default(12), // Default Return Investasi 12% (Saham/Campuran)

    // --- C. DATA ANAK & RENCANA ---
    childrenPlans: z.array(educationChildSchema).min(1, {
        message: "Masukkan minimal data 1 anak",
    }),
});

// ============================================================================
// TYPES EXPORT
// ============================================================================

export type EducationStage = z.infer<typeof educationStageSchema>;
export type EducationChild = z.infer<typeof educationChildSchema>;
export type EducationSimulationForm = z.infer<typeof educationSimulationSchema>;