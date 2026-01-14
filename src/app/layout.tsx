import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Keuanganku PWA",
  manifest: "/manifest.json",
};

// [UPDATE PENTING]: Konfigurasi Viewport Mobile-Native
export const viewport: Viewport = {
  themeColor: "#0056b3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Mencegah zoom cubit (biar kayak app asli)
  viewportFit: "cover", // Agar konten tembus sampai area poni/notch
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      {/* Tambahkan h-[100dvh] dan overflow-hidden di sini */}
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased h-[10dvh] w-screen overflow-hidden overscroll-none`}>
        {children}
      </body>
    </html>
  );
}