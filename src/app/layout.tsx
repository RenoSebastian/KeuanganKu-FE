import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KeuanganKu - MAXIPRO",
  description: "Aplikasi Perencanaan Keuangan Karyawan",
  manifest: "/manifest.json", // [FIX] Memastikan file manifest dikenali oleh App Wrapper/Browser
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KeuanganKu",
  },
  formatDetection: {
    telephone: false, // [FIX] Mencegah deretan angka dikira nomor telepon & diblok biru oleh iOS
  },
};

export const viewport: Viewport = {
  themeColor: "#082f49", // Disamakan dengan warna brand (brand-950) agar serasi dengan status bar HP
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // [FIX] Kunci utama pencegah Zoom-in liar di iOS
  userScalable: false,
  viewportFit: "cover", // [FIX] Memastikan aplikasi merambah hingga ke area Poni (Notch)
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      {/* REVISI PWA NATIVE FEEL:
        1. 'min-h-screen' -> Memastikan tinggi body penuh
        2. 'overscroll-none' -> Mencegah pull-to-refresh (karet gelang) bawaan browser
        3. 'select-none' -> Mencegah teks terblok biru saat user menekan layar agak lama
      */}
      <body
        className={`${inter.className} bg-slate-50 text-slate-900 antialiased min-h-screen overscroll-none select-none`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}