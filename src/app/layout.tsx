import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KeuanganKu",
  description: "Sistem Perencanaan Keuangan untuk Agen Profesional",
  // Penambahan konfigurasi icons
  icons: {
    icon: "/icons/icon.png",
    shortcut: "/icons/icon.png",
    // Menambahkan apple-touch-icon meningkatkan kompatibilitas PWA jika diakses via perangkat iOS
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KeuanganKu",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#082f49",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-slate-50 text-slate-900 antialiased min-h-screen overscroll-none select-none`}
      >
        {children}
        {/* Toaster diletakkan di Root agar notifikasi (seperti OTP sukses) bisa melintasi semua halaman */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}