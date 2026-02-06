"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LogIn, Eye, EyeOff, Lock, Mail, AlertCircle, ArrowLeft, ShieldCheck, Presentation } from "lucide-react";
import { authService } from "@/services/auth.service";
import Cookies from "js-cookie";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });

      if (response.access_token) {
        Cookies.set('token', response.access_token, { expires: 1, secure: true });
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      const role = response.user.role;
      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        const dashboardPath = role === 'DIRECTOR' ? '/director/dashboard' : role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
        router.push(dashboardPath);
      }

    } catch (err: any) {
      setError(err.response?.status === 403 || err.response?.status === 401
        ? "Kredensial tidak valid. Periksa kembali email agen Anda."
        : "Terjadi kesalahan sistem. Hubungi IT Support.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white/90 backdrop-blur-md overflow-hidden">
      <CardContent className="p-8">
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2 border border-red-100 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 font-semibold">Email Agen</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder="nama@perusahaan-asuransi.com"
                className="pl-10 h-12 bg-slate-50 border-slate-200 focus:ring-orange-500 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" id="password" className="text-slate-700 font-semibold">Password</Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10 h-12 bg-slate-50 border-slate-200 focus:ring-orange-500 transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-bold rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20 transition-all hover:scale-[1.02]"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2 italic">Memverifikasi Data...</span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                <Presentation className="w-5 h-5" /> Buka Dashboard Konsultasi
              </span>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-4">
          <p className="text-sm text-slate-500">
            Belum terdaftar sebagai Pro-Agent?{" "}
            <Link href="/register" className="text-orange-600 font-bold hover:underline">
              Daftar Sekarang
            </Link>
          </p>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-1">Butuh Bantuan Teknis?</p>
            <a href="tel:+6281224000269" className="text-sm text-slate-600 font-bold hover:text-orange-600 transition-colors">
              Hubungi Support: +62 812 2400 0269
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface-ground relative overflow-hidden font-sans">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-orange-500/5 -skew-x-12 transform origin-top" />

      <Link
        href="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-orange-600 transition-colors p-2"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </Link>

      <div className="relative z-10 w-full max-w-md px-6 py-2">
        <div className="mb-6 flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-slate-100 shadow-sm">
          {/* Ukuran Logo tetap besar secara visual tapi hemat ruang vertikal */}
          <div className="relative w-24 h-24 shrink-0">
            <Image
              src="/images/logokeuanganku.png"
              alt="Logo Keuanganku"
              width={360}
              height={360}
              className="object-contain w-full h-full"
              priority
            />
          </div>

          <div className="text-left border-l pl-4 border-slate-200">
            <h1 className="text-lg font-extrabold text-slate-900 leading-tight">
              Pro-Agent Access
            </h1>
            <p className="text-slate-500 text-[11px] leading-snug mt-1">
              Alat visualisasi data & simulasi risiko profesional.
            </p>
          </div>
        </div>
        <Suspense fallback={<div className="text-center p-8 animate-pulse text-slate-400">Menyiapkan Workspace Agen...</div>}>
          <LoginForm />
        </Suspense>

        <div className="flex flex-col items-center mt-10 space-y-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-white shadow-sm border border-slate-100 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Verified Financial Consultation Tool</span>
          </div>
          <p className="text-[10px] text-slate-400">
            &copy; {new Date().getFullYear()} KEUANGANKU. Dari Selling ke Consulting.
          </p>
        </div>
      </div>
    </div>
  );
}