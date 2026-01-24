import { 
  Home, Calculator, Wallet, History, User, 
  LayoutDashboard, Users, Database, Settings, 
  ShieldAlert
} from "lucide-react";

export const NAVIGATION_CONFIG = {
  main: [
    { label: "Dashboard", icon: Home, href: "/" },
    { label: "Kalkulator", icon: Calculator, href: "/calculator/budget" },
    { label: "Keuangan", icon: Wallet, href: "/finance" },
    { label: "Riwayat", icon: History, href: "/history" },
    { label: "Profil", icon: User, href: "/profile" },
  ],
  admin: [
    { label: "Dashboard Admin", icon: LayoutDashboard, href: "/admin/dashboard" },
    { label: "Manajemen User", icon: Users, href: "/admin/users" },
    { label: "Data Master", icon: Database, href: "/admin/master-data" },
    { label: "Konfigurasi", icon: Settings, href: "/admin/settings" },
  ],
  director: [
    { label: "Director Panel", icon: ShieldAlert, href: "/director" },
    // Menu spesifik direksi bisa ditambah di sini jika perlu (misal: Risk Monitor)
    // { label: "Risk Monitor", icon: ShieldCheck, href: "/director/risk-monitor" },
  ]
};