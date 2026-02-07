"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  ShieldCheck,
  Lock,
  User,
  Loader2,
  Mail,
  BarChart3,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Konfirmasi password tidak cocok!");
      setIsLoading(false);
      return;
    }

    try {
      await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });

      toast.success("Akun agen berhasil dibuat! Silakan login.");
      router.push("/login");
    } catch (error: any) {
      console.error("Register Error:", error);
      toast.error(error.message || "Gagal melakukan registrasi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* === LEFT SIDE - BRAND NARRATIVE === */}
      {/* Background: Dark Blue Slate untuk kesan korporat yang dalam */}
      <div className="hidden md:flex flex-col bg-slate-900 text-white p-12 justify-between relative overflow-hidden">

        {/* Background Gradients (Blue & Cyan) */}
        <div className="absolute top-0 right-0 w-125 h-125 bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-125 h-125 bg-cyan-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="z-10 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10">
              <Image
                src="/images/logokeuanganku.png"
                alt="Logo Keuanganku"
                width={140}
                height={40}
                className="object-contain brightness-0 invert" // Membuat logo putih agar kontras di background gelap
                priority
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider">
            Enterprise System
          </div>
        </div>

        <div className="z-10 space-y-10 relative">
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
              Transformasi <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">
                Konsultasi Finansial
              </span>
            </h2>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">
              Bergabunglah dengan jaringan agen profesional yang menggunakan data untuk memberikan solusi, bukan sekadar janji.
            </p>
          </div>

          <div className="grid gap-6">
            <FeatureItem
              icon={<BarChart3 className="w-5 h-5 text-blue-300" />}
              title="Analisa Berbasis Data"
              desc="Visualisasi arus kas yang presisi."
            />
            <FeatureItem
              icon={<ShieldCheck className="w-5 h-5 text-cyan-300" />}
              title="Simulasi Risiko Riil"
              desc="Hitungan proteksi yang logis & transparan."
            />
          </div>
        </div>

        <div className="z-10 pt-8 border-t border-white/10 relative">
          <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Tersertifikasi oleh Asosiasi Perencana Keuangan
          </p>
        </div>
      </div>

      {/* === RIGHT SIDE - FORM === */}
      <div className="flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">

        {/* Decorative BG Right Side */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <Card className="w-full max-w-md border-none shadow-[0_20px_50px_rgba(30,58,138,0.12)] bg-white/80 backdrop-blur-xl rounded-3xl relative z-10">
          <CardHeader className="space-y-1 text-center pb-8">
            <CardTitle className="text-2xl font-bold text-slate-900">Registrasi Mitra</CardTitle>
            <CardDescription className="text-slate-500">
              Buat akun untuk akses dashboard Pro-Agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-5">

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-700 font-bold text-xs uppercase tracking-wide">Nama Lengkap & Gelar</Label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Contoh: Budi Santoso, CFP®"
                    className="pl-11 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-bold text-xs uppercase tracking-wide">Email Profesional</Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nama@agency.co.id"
                    className="pl-11 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password Group */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-bold text-xs uppercase tracking-wide">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••"
                      className="pl-11 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-700 font-bold text-xs uppercase tracking-wide">Konfirmasi</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••"
                      className="pl-11 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold h-12 mt-4 rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.01]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifikasi Data...
                  </>
                ) : (
                  "Daftarkan Akun Agen"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-5 border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-500 text-center font-medium">
              Sudah memiliki akun?{" "}
              <Link href="/login" className="text-blue-600 font-bold hover:text-indigo-600 hover:underline transition-colors">
                Login Dashboard
              </Link>
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest justify-center opacity-70">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              256-bit Secure Encryption
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// Helper Component untuk Left Side
function FeatureItem({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-default">
      <div className="mt-1 bg-slate-800 p-2.5 rounded-xl border border-slate-700 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="font-bold text-white text-base">{title}</p>
        <p className="text-sm text-slate-400 leading-snug">{desc}</p>
      </div>
    </div>
  )
}