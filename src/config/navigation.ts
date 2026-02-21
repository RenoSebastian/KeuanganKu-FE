import {
  Home,
  Calculator,
  Wallet,
  History,
  User,
  LayoutDashboard,
  Users,
  Database,
  Settings,
  ShieldAlert,
  BarChart3,
  Trophy,
  Archive,
  BookOpen,
  BookOpenCheck,
  Activity // [NEW] Icon untuk Risk Profile
} from "lucide-react";

export const NAVIGATION_CONFIG = {
  // Menu Umum (Pegawai/User Biasa)
  main: [
    { label: "Dashboard", icon: Home, href: "/dashboard" },
    { label: "Financial Checkup", icon: Calculator, href: "/calculator/checkup" },
    { label: "Kalkulator Keuangan", icon: Wallet, href: "/finance" },
    { label: "Profil Risiko", icon: Activity, href: "/risk-profile" },
    { label: "Learning Center", icon: BookOpenCheck, href: "/learning" },
    // { label: "Riwayat", icon: History, href: "/history" },
    { label: "Profil", icon: User, href: "/profile" },
  ],

  // Menu Khusus Admin
  admin: [
    { label: "Dashboard Admin", icon: LayoutDashboard, href: "/admin/dashboard" },
    { label: "Manajemen User", icon: Users, href: "/admin/users" },
    { label: "Data Master", icon: Database, href: "/admin/master-data" },
    { label: "Modul Edukasi", icon: BookOpen, href: "/admin/education" },
    { label: "Data Maintenance", icon: Archive, href: "/admin/maintenance" },
    { label: "Konfigurasi", icon: Settings, href: "/admin/settings" },
  ],

  // Menu Khusus Direksi (Disembunyikan sementara untuk rilis Fase 1)
  director: [
    /* --- TODO: UNCOMMENT KODE DI BAWAH INI JIKA FITUR DIRECTOR SIAP DIRILIS ---
    {
      label: "Executive Summary",
      icon: BarChart3,
      href: "/director/dashboard"
    },
    {
      label: "Risk Monitor",
      icon: ShieldAlert,
      href: "/director/risk-monitor"
    },
    {
      label: "Peringkat Unit",
      icon: Trophy,
      href: "/director/unit-rankings"
    },
    ------------------------------------------------------------------------- */
  ]
};