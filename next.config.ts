/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development", // PWA mati di dev, jadi aman
});

const nextConfig = {
  // --- BARIS INI SOLUSINYA ---
  // Memberitahu Next.js untuk tetap pakai Turbopack walau ada config webpack
  turbopack: {}, 
  // ---------------------------

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

module.exports = withPWA(nextConfig);