import { 
  Calculator, GraduationCap, Home, History, 
  Umbrella, ShieldCheck, Stethoscope 
} from "lucide-react";
import { DirectorDashboardStats, RiskyEmployeeDetail, UnitHealthRanking } from "./types";

export const USER_PROFILE = {
  name: "Budi Santoso",
  nip: "1020304050",
  role: "Karyawan",
  // [NEW] Data Sesuai Flowchart
  email: "budi.santoso@maxipro.co.id",
  unit: "Divisi Teknologi Informasi",
  birthDate: "1990-05-15",
  dependents: 2, // Jumlah Tanggungan (Istri/Anak)
  maritalStatus: "Menikah",
  joinDate: "2015-08-01"
};

export const FINANCIAL_SUMMARY = {
  income: 8400000,
  expense: 5200000,
  balance: 3200000,
  score: 81,
  status: "Sehat",
  lastAnalysisDate: "24 April 2024",
  recommendation: "Pengaturan keuangan Anda sudah baik, terus pertahankan!"
};

export const MENU_ITEMS = [
  { 
    id: 1, 
    label: "Atur Anggaran", 
    desc: "Mengatur penghasilan",
    icon: Calculator, 
    href: "/calculator/budget", 
    color: "text-blue-600 bg-blue-100",
    bg: "bg-white"
  },
  { 
    id: 2, 
    label: "Dana Pendidikan", 
    desc: "Rencanakan tabungan",
    icon: GraduationCap, 
    href: "/calculator/education", 
    color: "text-orange-600 bg-orange-100",
    bg: "bg-white"
  },
  { 
    id: 3, 
    label: "Rencana Rumah", 
    desc: "Hitung biaya beli",
    icon: Home, 
    href: "/calculator/house", 
    color: "text-emerald-600 bg-emerald-100",
    bg: "bg-white"
  },
  { 
    id: 4, 
    label: "Persiapan Pensiun", 
    desc: "Siapkan hari tua",
    icon: Umbrella, 
    href: "/calculator/pension", 
    color: "text-purple-600 bg-purple-100",
    bg: "bg-white"
  },
  { 
    id: 5, 
    label: "Proteksi Diri", 
    desc: "Kebutuhan asuransi",
    icon: ShieldCheck, 
    href: "/calculator/insurance", 
    color: "text-cyan-600 bg-cyan-100",
    bg: "bg-white"
  },
  { 
    id: 6, 
    label: "Cek Kesehatan", 
    desc: "Analisa status",
    icon: Stethoscope, 
    href: "/calculator/checkup", 
    color: "text-indigo-600 bg-indigo-100",
    bg: "bg-white"
  },
  { 
    id: 7, 
    label: "Riwayat Analisa", 
    desc: "Pantau progress",
    icon: History, 
    href: "/history", 
    color: "text-slate-600 bg-slate-100",
    bg: "bg-white"
  },
];

export const HISTORY_DATA = [
  {
    id: "H-001",
    date: "24 April 2024",
    score: 81,
    status: "Sehat",
    summary: "Cashflow positif, dana darurat aman.",
    file: "laporan-apr-2024.pdf"
  },
  {
    id: "H-002",
    date: "12 Januari 2024",
    score: 65,
    status: "Waspada",
    summary: "Cicilan hutang melebihi 30% gaji.",
    file: "laporan-jan-2024.pdf"
  },
  {
    id: "H-003",
    date: "10 Oktober 2023",
    score: 45,
    status: "Risiko",
    summary: "Defisit bulanan, tidak ada tabungan.",
    file: "laporan-okt-2023.pdf"
  },
  {
    id: "H-004",
    date: "05 Agustus 2023",
    score: 70,
    status: "Waspada",
    summary: "Dana darurat belum ideal.",
    file: "laporan-ags-2023.pdf"
  }
];

// --- DATA DUMMY UNTUK ROLE DIREKSI ---

export const DIRECTOR_STATS_MOCK: DirectorDashboardStats = {
  totalEmployees: 1450,
  avgHealthScore: 72,
  riskyEmployeesCount: 12,
  totalAssetsManaged: 45000000000, // 45 Miliar
  monthlyHealthTrend: [65, 68, 70, 72, 71, 72]
};

export const UNIT_HEALTH_RANKING_MOCK: UnitHealthRanking[] = [
  { id: "U-1", unitName: "Divisi Teknologi Informasi", avgScore: 85, employeeCount: 45, status: "SEHAT" },
  { id: "U-2", unitName: "Divisi Keuangan", avgScore: 82, employeeCount: 30, status: "SEHAT" },
  { id: "U-3", unitName: "Divisi HR & Umum", avgScore: 70, employeeCount: 55, status: "WASPADA" },
  { id: "U-4", unitName: "Divisi Operasional Lapangan", avgScore: 48, employeeCount: 210, status: "BAHAYA" },
  { id: "U-5", unitName: "Divisi Pemasaran", avgScore: 76, employeeCount: 40, status: "SEHAT" },
];

export const RISKY_EMPLOYEES_MOCK: RiskyEmployeeDetail[] = [
  { 
    id: "EMP-001", 
    fullName: "Ahmad Junaedi", 
    unitName: "Divisi Operasional Lapangan", 
    healthScore: 30, 
    debtToIncomeRatio: 72, 
    lastCheckupDate: "2024-04-20",
    status: "BAHAYA" 
  },
  { 
    id: "EMP-002", 
    fullName: "Siti Aminah", 
    unitName: "Divisi HR & Umum", 
    healthScore: 42, 
    debtToIncomeRatio: 58, 
    lastCheckupDate: "2024-04-18",
    status: "WASPADA" 
  },
  { 
    id: "EMP-003", 
    fullName: "Bambang Pamungkas", 
    unitName: "Divisi Operasional Lapangan", 
    healthScore: 35, 
    debtToIncomeRatio: 65, 
    lastCheckupDate: "2024-04-15",
    status: "BAHAYA" 
  },
];