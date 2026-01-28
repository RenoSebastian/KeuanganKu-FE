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
import { LogIn, Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import { authService } from "@/services/auth.service";
import Cookies from "js-cookie"; // Pastikan package ini ada (npm i js-cookie)

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl'); // URL tujuan sebelum ditendang middleware

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
      // 1. Panggil API Login
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });

      // 2. Simpan Token ke Cookie (PENTING untuk Middleware)
      // Kita set expiry 1 hari sesuai Backend
      if (response.access_token) {
        Cookies.set('token', response.access_token, { expires: 1, secure: true });
        
        // Opsional: Simpan data user di localStorage untuk akses cepat di Client Component
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      // 3. Redirect Sesuai Role
      const role = response.user.role;
      
      // Jika ada callbackUrl (misal user tadi mau buka /finance tapi disuruh login dulu)
      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        // Default Redirect
        if (role === 'DIRECTOR') {
          router.push('/director/dashboard');
        } else if (role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard'); // User Biasa
        }
      }

    } catch (err: any) {
      console.error("Login Failed:", err);
      // Tampilkan pesan error yang user-friendly
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
      {/* Background Decoration (Optional, Minimalis) */}
      <div className="absolute top-0 left-0 w-full h-64 bg-blue-600/10 -skew-y-3 origin-top-left" />
      
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg mb-4">
            <Image 
              src="/images/maxipro.webp" 
              alt="Logo" 
              width={40} 
              height={40} 
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
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
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
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> 
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