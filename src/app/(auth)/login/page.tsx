"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulasi loading network agar terasa seperti aplikasi beneran
    setTimeout(() => {
      setIsLoading(false);
      router.push("/"); // Redirect ke Dashboard
    }, 1500);
  };

  return (
    // CONTAINER UTAMA: Full Height (100dvh) & Kunci Scroll
    <div className="relative w-full h-[100dvh] overflow-hidden flex flex-col justify-center items-center bg-slate-900 font-sans px-4">
      
      {/* 1. BACKGROUND LAYER (Full Screen) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/bg1.png" // Pastikan gambar ini ada
          alt="Background Plant"
          fill
          className="object-cover opacity-90"
          priority
        />
        {/* Overlay Gradient: Gelap di bawah agar teks putih terbaca, Terang di atas */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/20 to-white/10"></div>
      </div>

      {/* 2. KONTEN (Z-Index Tinggi) */}
      <div className="relative z-10 w-full max-w-sm px-8 flex flex-col items-center">
        
        {/* LOGO SECTION */}
        <div className="mb-10 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-700">
           {/* Logo PAM JAYA */}
           <div className="relative w-64 h-32 mb-2">
            <Image 
              src="/images/pamjaya-logo.png" 
              alt="Logo PAM"
              fill 
              className="object-contain drop-shadow-md brightness-100" // Hack biar logo jadi putih jika aslinya gelap (opsional)
            />
             {/* Jika logo aslinya sudah berwarna dan bagus, hapus class 'brightness-0 invert' */}
           </div>
           
           {/* Judul Aplikasi */}
           <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-lg">
             Keuanganku
           </h1>
        </div>

        {/* FORM SECTION (Glassmorphism) */}
        <div className="w-full backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-6 animate-in zoom-in-95 duration-500 delay-150">
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Input Email/NIP */}
            <div className="space-y-1">
              <Input 
                icon={<Mail className="w-4 h-4" />}
                placeholder="Email / NIP"
                className="bg-white/80 border-white/50 focus:bg-white h-12 rounded-xl text-slate-800 placeholder:text-slate-500"
                required
              />
            </div>

            {/* Input Password */}
            <div className="space-y-1">
              <Input 
                type="password"
                icon={<Lock className="w-4 h-4" />}
                placeholder="Kata Sandi"
                className="bg-white/80 border-white/50 focus:bg-white h-12 rounded-xl text-slate-800 placeholder:text-slate-500"
                required
              />
            </div>

            {/* Tombol Masuk */}
            <Button 
              type="submit" 
              fullWidth 
              size="lg"
              className="mt-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/30 border border-white/10"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>

          </form>
        </div>

        {/* FOOTER TEXT */}
        <p className="mt-8 text-xs text-blue-100/60 font-medium tracking-wide">
          Aplikasi Internal PAM JAYA
        </p>

      </div>
    </div>
  );
}