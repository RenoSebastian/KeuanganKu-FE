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
  Activity,
  WalletCards,
  FileCheck, // [NEW] Icon untuk menu Verifikasi
  Tag,
} from "lucide-react";

export const NAVIGATION_CONFIG = {
  // Menu Umum (Pegawai/User Biasa)
  main: [
    { label: "Dashboard", icon: Home, href: "/dashboard" },
    { label: "Kalkulator Keuangan", icon: Wallet, href: "/finance" },
    // { label: "Learning Center", icon: BookOpenCheck, href: "/learning" },
    // { label: "Riwayat", icon: History, href: "/history" }, // Hidden for Phase 1
    { label: "Profil", icon: User, href: "/profile" },
    { label: "Subscription", icon: WalletCards, href: "/subscription" },
  ],

  // Menu Khusus Admin
  admin: [
    { label: "Dashboard Admin", icon: LayoutDashboard, href: "/admin/dashboard" },
    { label: "Verifikasi Bayar", icon: FileCheck, href: "/admin/verification" }, // [NEW] Halaman Audit Pembayaran
    { label: "Voucher Promo", icon: Tag, href: "/admin/vouchers" }, // Manajemen Voucher Diskon
    { label: "Manajemen User", icon: Users, href: "/admin/users" },
    { label: "Log Activity", icon: Database, href: "/admin/maintenance/logs" },
    { label: "Modul Edukasi", icon: BookOpen, href: "/admin/education" },
    { label: "Data Maintenance", icon: Archive, href: "/admin/maintenance" },
    { label: "Konfigurasi", icon: Settings, href: "/admin/settings" },
  ],
};