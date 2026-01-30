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
  Archive // [NEW] Icon untuk Maintenance/Retention
} from "lucide-react";

export const NAVIGATION_CONFIG = {
  main: [
    { label: "Dashboard", icon: Home, href: "/" },
    { label: "Financial Checkup", icon: Calculator, href: "/finance/checkup" },
    { label: "Kalkulator Keuangan", icon: Wallet, href: "/finance" },
    { label: "Riwayat", icon: History, href: "/history" },
    { label: "Profil", icon: User, href: "/profile" },
  ],
  admin: [
    { label: "Dashboard Admin", icon: LayoutDashboard, href: "/admin/dashboard" },
    { label: "Manajemen User", icon: Users, href: "/admin/users" },
    { label: "Data Master", icon: Database, href: "/admin/master-data" },
    // [NEW] Menu Data Maintenance
    // Diletakkan sebelum Settings agar Settings tetap di paling bawah (konvensi UX)
    { label: "Data Maintenance", icon: Archive, href: "/admin/maintenance" },
    { label: "Konfigurasi", icon: Settings, href: "/admin/settings" },
  ],
  director: [
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
  ]
};