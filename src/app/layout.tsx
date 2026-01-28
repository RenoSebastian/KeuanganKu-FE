import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KeuanganKu - MAXIPRO",
  description: "Aplikasi Perencanaan Keuangan Karyawan",
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
  themeColor: "#0056b3",
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
      {/* REVISI: 
          1. Hapus 'overflow-hidden' agar bisa scroll lagi.
          2. Hapus 'h-[100dvh]' ganti jadi 'min-h-screen' (standar web).
          3. Hapus 'w-screen' (biarkan default width auto).
      */}
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased min-h-screen overscroll-none`}>
        {children}
      </body>
    </html>
  );
}