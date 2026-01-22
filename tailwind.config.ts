import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- 1. CORE BRAND IDENTITY (PAM JAYA BLUE) ---
        // Menggunakan gradasi dari Deep Blue (Integritas) ke Water Cyan (Kejernihan)
        brand: {
          50: "#f0f9ff", // Backgrounds sangat tipis
          100: "#e0f2fe", // Highlight lembut
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0093E9", // PRIMARY ACCENT (Cyan - Kejernihan Air)
          600: "#0284c7",
          700: "#005C97", // PRIMARY BRAND (Deep Blue - Otoritas & Trust)
          800: "#075985",
          900: "#0c4a6e", // Text Heading / Footer
          950: "#082f49",
        },
        
        // --- 2. SEMANTIC / FUNCTIONAL COLORS ---
        // Hanya gunakan ini untuk MENANDAKAN status, bukan dekorasi
        status: {
          success: "#10b981", // Emerald 500 (Sehat/Aman)
          warning: "#f59e0b", // Amber 500 (Waspada/Perhatian)
          danger: "#e11d48",  // Rose 600 (Bahaya/Defisit)
          info: "#3b82f6",    // Blue 500 (Informasi Netral)
        },

        // --- 3. NEUTRAL SURFACE ---
        // Untuk Background, Card, dan Teks agar mata tidak lelah
        surface: {
          ground: "#f8fafc", // Slate 50 (Background utama aplikasi)
          section: "#f1f5f9", // Slate 100 (Background section/sidebar)
          card: "#ffffff",    // White (Card background)
          border: "#e2e8f0",  // Slate 200 (Garis tipis)
        }
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      backgroundImage: {
        // Gradien standar PAM JAYA (Digunakan di Header/Button Utama)
        'pam-gradient': "linear-gradient(135deg, #005C97 0%, #0093E9 100%)",
        // Gradien kaca halus untuk overlay
        'glass-gradient': "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)",
      },
      boxShadow: {
        'glow-blue': '0 0 20px -5px rgba(0, 147, 233, 0.3)', // Efek glowing halus untuk elemen aktif
        'card-hover': '0 10px 40px -10px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
};

export default config;