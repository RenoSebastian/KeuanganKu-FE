"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LogIn, Eye, EyeOff, Lock, Mail, AlertCircle, ArrowLeft, ShieldCheck, Briefcase, Info } from "lucide-react";
import { authService } from "@/services/auth.service";
import Cookies from "js-cookie";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const kickReason = searchParams.get('reason');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  // [PWA UX] Menangani pesan dari sistem Kick-out (Fase 3 & 4)
  useEffect(() => {
    if (kickReason === 'kicked') {
      setError("Akses terputus: Akun Anda baru saja digunakan untuk login di perangkat lain.");
    } else if (kickReason === 'expired') {
      setInfoMessage("Sesi Anda telah berakhir demi keamanan. Silakan login kembali.");
    }
  }, [kickReason]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setInfoMessage("");

    try {
      // Typing sudah aman berkat modifikasi Omit di auth.service.ts
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });

      if (response.access_token) {
        // [SECURITY] Tambahkan secure: true jika production (HTTPS)
        Cookies.set('token', response.access_token, { expires: 1, secure: process.env.NODE_ENV === 'production' });
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      const role = response.user.role;
      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        const dashboardPath = role === 'DIRECTOR' ? '/_director/dashboard' : role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
        router.push(dashboardPath);
      }

    } catch (err: any) {
      setError(err.response?.status === 403 || err.response?.status === 401
        ? "Kredensial tidak valid. Periksa kembali email dan password Anda."
        : "Terjadi kesalahan sistem. Hubungi IT Support.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:shadow-[0_20px_50px_rgba(30,58,138,0.08)] bg-white sm:bg-white/95 backdrop-blur-xl overflow-hidden rounded-[2rem]">
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleLogin} className="space-y-5">

          {/* Dynamic Alert Section */}
          {(error || infoMessage) && (
            <div className={`p-4 rounded-2xl text-[13px] flex items-start gap-3 border animate-in fade-in slide-in-from-top-2 ${error ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
              {error ? (
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
              )}
              <span className="font-medium leading-relaxed">{error || infoMessage}</span>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 font-bold text-sm ml-1">Email Korporat</Label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300" />
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="nama@perusahaan.co.id"
                // [PWA] h-14 untuk Touch Target yang lebih nyaman di jempol
                className="pl-12 h-14 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all rounded-2xl text-[15px]"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <Label htmlFor="password" id="password-label" className="text-slate-700 font-bold text-sm">Kata Sandi</Label>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                // [PWA] Hindari auto-zoom di iOS dengan set font size minimal 16px (text-base)
                className="pl-12 pr-12 h-14 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all rounded-2xl text-[16px] sm:text-[15px]"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100"
                tabIndex={-1}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-14 mt-2 text-[15px] font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Mengautentikasi...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                <LogIn className="w-5 h-5" /> Masuk Dashboard
              </span>
            )}
          </Button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-6">
          <div className="space-y-1">
            <p className="text-[13px] text-slate-500 font-medium">Belum memiliki akses Pro-Agent?</p>
            <Link href="/register" className="text-blue-600 font-bold text-[14px] hover:text-blue-800 active:text-blue-900 transition-colors inline-block py-2 px-4 rounded-xl hover:bg-blue-50">
              Registrasi Akun Baru
            </Link>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Pusat Bantuan IT</p>
            <a href="tel:+628122377761" className="text-[13px] text-slate-600 font-bold hover:text-blue-600 transition-colors flex items-center justify-center gap-2 py-1">
              Hubungi Support KeuanganKu
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    // [PWA] min-h-[100dvh] menangani tinggi layar dinamis di mobile browser
    // pt-safe pb-safe untuk menghindari notch/home indicator
    <div className="min-h-dvh w-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">

      {/* Background Decoration: Blue & Professional */}
      <div className="absolute top-0 right-0 w-[80%] sm:w-[60%] h-[60%] sm:h-full bg-blue-600/5 -skew-x-12 transform origin-top translate-x-1/4 sm:translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[60%] sm:w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />

      {/* Back Button - Responsive positioning */}
      <Link
        href="/"
        className="absolute top-4 sm:top-8 left-4 sm:left-8 z-50 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors p-3 rounded-xl hover:bg-white/60 active:bg-slate-200"
      >
        <ArrowLeft className="w-5 h-5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Kembali</span>
      </Link>

      {/* PWA Main Container - Full width on mobile, max-width on tablet/desktop */}
      <div className="relative z-10 w-full max-w-110 px-4 sm:px-6 py-8 flex flex-col gap-6 sm:gap-8 flex-1 justify-center">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 bg-transparent sm:bg-white/60 sm:backdrop-blur-sm sm:p-5 sm:rounded-3xl sm:border sm:border-white/40 sm:shadow-sm text-center sm:text-left">
          {/* Logo Container */}
          <div className="relative w-24 h-24 sm:w-20 sm:h-20 shrink-0 bg-white rounded-4xl sm:rounded-2xl p-3 sm:p-2 shadow-sm border border-slate-100 mx-auto sm:mx-0">
            <Image
              src="/images/logokeuanganku.png"
              alt="Logo Keuanganku"
              width={360}
              height={360}
              className="object-contain w-full h-full"
              priority
            />
          </div>

          <div className="flex flex-col items-center sm:items-start mt-2 sm:mt-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-widest mb-2 sm:mb-1.5">
              <Briefcase className="w-3.5 h-3.5" /> Enterprise
            </div>
            <h1 className="text-2xl sm:text-xl font-extrabold text-slate-900 leading-tight mb-1">
              Pro-Agent Portal
            </h1>
            <p className="text-slate-500 text-[13px] sm:text-xs font-medium leading-relaxed max-w-62.5 sm:max-w-none">
              Akses alat visualisasi finansial & manajemen klien.
            </p>
          </div>
        </div>

        {/* Login Form Wrapper */}
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center p-12 bg-white/50 rounded-[2rem] animate-pulse">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
            <span className="text-slate-400 text-sm font-medium">Memuat Secure Gateway...</span>
          </div>
        }>
          <LoginForm />
        </Suspense>

        {/* Footer Badge */}
        <div className="flex flex-col items-center space-y-4 mt-2 sm:mt-4 pb-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur shadow-sm border border-slate-100 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Secure 256-bit Connection
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} KeuanganKu System.
          </p>
        </div>

      </div>
    </div>
  );
}