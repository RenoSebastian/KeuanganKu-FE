import { 
  Calculator, GraduationCap, Home, History, 
  Umbrella, ShieldCheck, Stethoscope 
} from "lucide-react";

export const USER_PROFILE = {
  name: "Budi Santoso",
  nip: "1020304050",
  role: "Karyawan",
  // [NEW] Data Sesuai Flowchart
  email: "budi.santoso@pamjaya.co.id",
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