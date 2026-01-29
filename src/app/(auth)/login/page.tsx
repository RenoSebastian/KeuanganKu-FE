// File: src/app/(auth)/login/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
// [UPDATE] Added ArrowLeft icon import
import { LogIn, Eye, EyeOff, Lock, Mail, AlertCircle, ArrowLeft } from "lucide-react";
import { authService } from "@/services/auth.service";
import Cookies from "js-cookie";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

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
        if (role === 'DIRECTOR') {
          router.push('/director/dashboard');
        } else if (role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      }

    } catch (err: any) {
      console.error("Login Failed:", err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError("Email atau password salah. Silakan coba lagi.");
      } else {
        setError("Terjadi kesalahan sistem. Hubungi administrator.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">

      {/* [UPDATE] Back to Landing Page Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-white/60"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </Link>

      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-64 bg-blue-600/10 -skew-y-3 origin-top-left" />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-4">
            <Image
              src="/images/maxipro.webp"
              alt="Logo"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Selamat Datang Kembali</h1>
          <p className="text-slate-500 mt-2">Masuk untuk mengakses Financial Checkup Anda</p>
        </div>

        <Card className="p-8 border-slate-200 shadow-xl bg-white/80 backdrop-blur-sm">
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Perusahaan</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@maxipro.co.id"
                  className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  <LogIn className="w-5 h-5" /> Masuk Aplikasi
                </span>
              )}
            </Button>
          </form>

          {/* Footer Register */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Belum memiliki akun?{" "}
              <Link href="/register" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                Daftar Akun
              </Link>
            </p>
            <p className="text-sm text-slate-500 mt-4">
              Jika Anda mengalami kendala atau masalah saat login, silakan hubungi admin di nomor{" "}
              <a href="tel:+6281224000269" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                +6281224000269
              </a>.
            </p>
          </div>
        </Card>

        {/* Footer Copyright */}
        <p className="text-center text-xs text-slate-400 mt-8">
          &copy; {new Date().getFullYear()} MAXIPRO Financial Wellness. All rights reserved.
        </p>
      </div>
    </div>
  );
}