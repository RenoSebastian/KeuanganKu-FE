"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LogIn, Eye, EyeOff, Lock, Mail, AlertCircle, ArrowLeft, ShieldCheck, Briefcase } from "lucide-react";
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
    // [UPDATE] Shadow lebih soft & kebiruan
    <Card className="border-none shadow-[0_20px_50px_rgba(30,58,138,0.1)] bg-white/95 backdrop-blur-xl overflow-hidden rounded-3xl">
      <CardContent className="p-8">
        <form onSubmit={handleLogin} className="space-y-6">

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm flex items-start gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 font-bold text-sm">Email Korporat</Label>
            <div className="relative group">
              {/* [UPDATE] Icon color active: Blue */}
              <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300" />
              <Input
                id="email"
                type="email"
                placeholder="nama@perusahaan.co.id"
                // [UPDATE] Focus ring: Blue
                className="pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all rounded-xl"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" id="password" className="text-slate-700 font-bold text-sm">Kata Sandi</Label>
            </div>
            <div className="relative group">
              {/* [UPDATE] Icon color active: Blue */}
              <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                // [UPDATE] Focus ring: Blue
                className="pl-11 pr-11 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all rounded-xl"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          {/* [UPDATE] Background Blue Gradient */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.01] hover:shadow-blue-600/40"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2 italic">Mengautentikasi...</span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                <LogIn className="w-5 h-5" /> Masuk Dashboard
              </span>
            )}
          </Button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-5">
          <p className="text-sm text-slate-500 font-medium">
            Belum memiliki akses Pro-Agent? <br />
            {/* [UPDATE] Link color Blue */}
            <Link href="/register" className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition-colors inline-block mt-1">
              Registrasi Akun Baru
            </Link>
          </p>

          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/50">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">Pusat Bantuan IT</p>
            <a href="tel:+6281224000269" className="text-sm text-slate-600 font-bold hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
              Hubungi Support
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* [UPDATE] Background Decoration: Blue & Professional */}
      <div className="absolute top-0 right-0 w-[60%] h-full bg-blue-600/5 -skew-x-12 transform origin-top translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />

      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-8 left-8 z-50 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-white/50"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </Link>

      <div className="relative z-10 w-full max-w-md px-6 py-4 flex flex-col gap-6">

        {/* Header Section */}
        <div className="flex items-center gap-5 bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white/40 shadow-sm">
          {/* Logo Container */}
          <div className="relative w-20 h-20 shrink-0 bg-white rounded-xl p-2 shadow-sm border border-slate-100">
            <Image
              src="/images/logokeuanganku.png"
              alt="Logo Keuanganku"
              width={360}
              height={360}
              className="object-contain w-full h-full"
              priority
            />
          </div>

          <div className="text-left">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Briefcase className="w-3 h-3" /> Enterprise
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 leading-none mb-1">
              Pro-Agent Portal
            </h1>
            <p className="text-slate-500 text-xs font-medium leading-snug">
              Akses alat visualisasi finansial & manajemen klien.
            </p>
          </div>
        </div>

        {/* Login Form Wrapper */}
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center p-12 bg-white/50 rounded-3xl animate-pulse">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
            <span className="text-slate-400 text-sm font-medium">Memuat Secure Gateway...</span>
          </div>
        }>
          <LoginForm />
        </Suspense>

        {/* Footer Badge */}
        <div className="flex flex-col items-center space-y-3 mt-4">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white shadow-sm shadow-blue-900/5 border border-slate-100 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Secure & Encrypted Connection
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} KeuanganKu Enterprise System.
          </p>
        </div>

      </div>
    </div>
  );
}