import type { NextConfig } from "next";
import path from "path";

/**
 * STRATEGI CACHING PWA - KEUANGANKU
 * 1. Aset Statis (Gambar/Font) -> Cache First / StaleWhileRevalidate (Biar cepat)
 * 2. Halaman & API -> Network First (Biar data selalu AKURAT)
 */
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", // PWA mati di dev mode
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // 1. CACHE GAMBAR & FONT (Agresif)
      {
        urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-font-assets",
          expiration: { maxEntries: 4, maxAgeSeconds: 7 * 24 * 60 * 60 }, // 7 hari
        },
      },
      {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-image-assets",
          expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 }, // 24 jam
        },
      },
      // 2. API CALLS (KRUSIAL: Network First)
      // Jangan sampai data keuangan diambil dari cache jika internet ada!
      {
        urlPattern: /\/api\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "apis",
          expiration: { maxEntries: 16, maxAgeSeconds: 24 * 60 * 60 },
          networkTimeoutSeconds: 10, // Jika 10 detik loading, baru ambil cache
        },
      },
      // 3. NAVIGASI HALAMAN (Network First)
      // Memastikan user dapat UI terbaru, bukan UI usang dari cache
      {
        urlPattern: ({ request }: any) => request.mode === 'navigate',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages',
          expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
          networkTimeoutSeconds: 10,
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  // [FIX] Memaksa Next.js menggunakan folder ini sebagai root, 
  // mengabaikan package-lock.json di C:\Users\PC
  outputFileTracingRoot: path.join(__dirname, "./"),
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default withPWA(nextConfig);