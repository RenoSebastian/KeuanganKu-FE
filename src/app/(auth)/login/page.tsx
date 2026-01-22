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
import api from "@/lib/axios";

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
      // 1. Tembak API Backend
      const response = await api.post("/auth/login", formData);
      
      // 2. Ambil Token & User Data
      const { access_token, user } = response.data;

      // 3. Simpan ke LocalStorage
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      // 4. Smart Redirect
      const isProfileIncomplete = !user.age || !user.fixedIncome || user.fixedIncome === 0;

      if (isProfileIncomplete) {
        router.push("/profile?alert=incomplete");
      } else {
        router.push("/");
      }
      
    } catch (err: any) {
      const msg = err.response?.data?.message || "Login gagal. Periksa koneksi Anda.";
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface-ground relative overflow-hidden">
      
      {/* --- BACKGROUND DECORATION --- */}
      <div className="absolute inset-0 bg-brand-900">
         <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-10 mix-blend-overlay"></div>
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/20 rounded-full blur-[120px] pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-md px-5">
        <Card className="p-8 md:p-10 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl shadow-brand-900/30 rounded-[2.5rem]">
          
          {/* LOGO SECTION */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-40 h-16 mb-4">
               <Image 
                 src="/images/pamjaya-logo.png" 
                 alt="Logo PAM JAYA"
                 fill
                 className="object-contain"
                 priority
               />
            </div>
            <h1 className="text-2xl font-black text-brand-900 tracking-tight text-center">
              Koperasi Keuangan
            </h1>
            <p className="text-sm text-slate-500 font-medium text-center mt-1">
              Portal Finansial Terpadu Karyawan
            </p>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-rose-600 leading-relaxed">{error}</p>
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-2">
              <Label variant="field">Email Karyawan</Label>
              <div className="relative group">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                 <Input 
                   type="email" 
                   placeholder="nama@pamjaya.co.id"
                   className="pl-12 h-12 bg-slate-50 border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl font-medium"
                   value={formData.email}
                   onChange={(e) => setFormData({...formData, email: e.target.value})}
                   required
                 />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label variant="field">Password</Label>
              <div className="relative group">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                 <Input 
                   type={showPassword ? "text" : "password"} 
                   placeholder="••••••••"
                   className="pl-12 pr-12 h-12 bg-slate-50 border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl font-medium"
                   value={formData.password}
                   onChange={(e) => setFormData({...formData, password: e.target.value})}
                   required
                 />
                 <button 
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-600 transition-colors focus:outline-none"
                 >
                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                 </button>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="primary"
              fullWidth
              size="lg"
              className="mt-6 rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" /> Masuk Aplikasi
                </span>
              )}
            </Button>
          </form>
          
          {/* REGISTER LINK */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Belum memiliki akun?{" "}
              <Link href="/register" className="text-brand-600 font-bold hover:text-brand-700 hover:underline transition-all">
                Daftar Pegawai Baru
              </Link>
            </p>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center">
             <p className="text-[10px] text-slate-400 font-semibold">
               &copy; 2026 PAM JAYA. All Rights Reserved.
             </p>
          </div>

        </Card>
      </div>
    </div>
  );
}