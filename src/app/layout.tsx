import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KeuanganKu - MAXIPRO",
  description: "Aplikasi Perencanaan Keuangan Karyawan",
  // [FIX]: Hapus baris 'manifest: "/manifest.json"' dari sini. 
  // Next.js App Router secara otomatis membaca file 'src/app/manifest.ts' Anda dan menyuntikkannya dengan benar.
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
    <html lang="id">
      <body 
        className={`${inter.className} bg-slate-50 text-slate-900 antialiased min-h-screen overscroll-none select-none`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}