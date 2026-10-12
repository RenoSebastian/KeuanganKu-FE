import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KeuanganKu",
  description: "Sistem Perencanaan Keuangan untuk Agen Profesional",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  openGraph: {
    title: "KeuanganKu",
    description: "Sistem Perencanaan Keuangan untuk Agen Profesional",
    url: "https://keuanganku.id",
    siteName: "KeuanganKu",
    images: [
      {
        url: "/images/logokeuanganku.png",
        width: 800,
        height: 600,
        alt: "Logo KeuanganKu",
      },
    ],
    locale: "id_ID",
    type: "website",
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