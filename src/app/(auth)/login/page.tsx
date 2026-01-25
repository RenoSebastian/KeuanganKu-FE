"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label"; 
import { LogIn, AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { authService } from "@/services/auth.service"; // Import Service Baru

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Panggil Service Login
      // Kita simpan responsenya ke variabel untuk dicek role-nya
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });

      // 2. Cek Role & Redirect Sesuai Hak Akses
      const role = response.user.role;

      if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (role === "DIRECTOR") {
        router.push("/director/dashboard");
      } else {
        // Default untuk USER / UNIT_HEAD
        router.push("/");
      }
      
    } catch (err: any) {
      console.error("Login failed:", err);
      // Handle Error dari Backend
      const msg = err.response?.data?.message || "Gagal masuk aplikasi. Periksa email/password.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC]">
      {/* LEFT SIDE - BRANDING & ILLUSTRATION */}
      <div className="hidden lg:flex w-1/2 bg-brand-600 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
           <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-brand-400/20 blur-3xl"></div>
        </div>

        {/* Logo Area */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/10">
            <Image 
              src="/images/pamjaya-logo.png" 
              alt="PAM JAYA Logo" 
              width={40} 
              height={40} 
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">KeuanganKu</h1>
            <p className="text-xs text-brand-100 font-medium">PAM JAYA Application</p>
          </div>
        </div>

        {/* Illustration / Hero Text */}
        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Kelola Kesehatan Finansial Anda dengan Lebih Bijak
          </h2>
          <p className="text-brand-100 text-lg leading-relaxed mb-8">
            Platform terintegrasi untuk perencanaan keuangan, simulasi dana pensiun, dan analisis kesehatan finansial khusus karyawan PAM JAYA.
          </p>
          
          <div className="flex gap-4">
             <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex-1">
                <h3 className="font-bold text-2xl mb-1">100%</h3>
                <p className="text-xs text-brand-100">Aman & Terpercaya</p>
             </div>
             <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex-1">
                <h3 className="font-bold text-2xl mb-1">24/7</h3>
                <p className="text-xs text-brand-100">Akses Kapan Saja</p>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-brand-200 opacity-80">
          © 2026 PAM JAYA. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
         <div className="w-full max-w-md">
          
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden flex justify-center mb-8">
            <Image src="/images/pamjaya-logo.png" alt="Logo" width={60} height={60} />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Selamat Datang Kembali</h2>
            <p className="text-slate-500 mt-2">Silakan masuk menggunakan akun karyawan Anda</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 leading-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Email Perusahaan</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                <Input 
                  type="email" 
                  placeholder="nama@pamjaya.co.id" 
                  className="pl-11 h-12 bg-white border-slate-200 focus:border-brand-500 focus:ring-brand-500 rounded-xl"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-slate-700 font-semibold">Kata Sandi</Label>
                <Link href="/forgot-password" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                  Lupa kata sandi?
                </Link>
              </div>
              <div className="relative">
                 <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                 <Input 
                   type={showPassword ? "text" : "password"} 
                   placeholder="••••••••" 
                   className="pl-11 pr-11 h-12 bg-white border-slate-200 focus:border-brand-500 focus:ring-brand-500 rounded-xl"
                   value={formData.password}
                   onChange={(e) => setFormData({...formData, password: e.target.value})}
                   required
                 />
                 <button 
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                 >
                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                 </button>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="primary" // Pastikan variant sesuai shadcn (default/primary)
              className="w-full mt-6 h-12 text-base rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02] bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : (
                <span className="flex items-center gap-2 justify-center">
                  <LogIn className="w-5 h-5" /> Masuk Aplikasi
                </span>
              )}
            </Button>
          </form>
          
          {/* REGISTER LINK */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Belum memiliki akun?{" "}
              <Link href="/register" className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-all">
                Daftar Pegawai Baru
              </Link>
            </p>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center">
             <p className="text-[10px] text-slate-400 font-semibold">
               Protected by PAM JAYA Security System
             </p>
          </div>
         </div>
      </div>
    </div>
  );
}