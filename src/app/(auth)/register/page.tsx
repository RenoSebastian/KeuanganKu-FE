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
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";

// Import komponen OTP Feature yang kita buat di Fase 3
import { OtpVerificationForm } from "@/components/features/auth/otp-verification-form";

// Mendefinisikan tipe langkah (Wizard Steps)
type RegistrationStep = 1 | 2;

export default function RegisterPage() {
  const router = useRouter();

  // State Machine untuk mengontrol UI flow
  const [step, setStep] = useState<RegistrationStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Menyimpan data registrasi sementara di memori FE
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Logic Phase 1: Request OTP
  const handleRegisterPhase1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Konfirmasi password tidak cocok!");
      setIsLoading(false);
      return;
    }

    try {
      // Panggil Service Phase 1
      await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });

      // Transisi ke Phase 2 (Verifikasi OTP)
      setStep(2);
      toast.success("OTP Terkirim", {
        description: "Silakan periksa kotak masuk atau folder spam email Anda."
      });

    } catch (error: any) {
      console.error("Register Error:", error);
      toast.error(error.response?.data?.message || error.message || "Gagal melakukan registrasi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // [PWA] Menggunakan min-h-[100dvh] dan safe-area untuk handling browser mobile modern
    <div className="min-h-dvh flex flex-col md:grid md:grid-cols-2 font-sans selection:bg-blue-100 selection:text-blue-900 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">

      {/* === LEFT SIDE - BRAND NARRATIVE (Desktop/Tablet Only) === */}
      <div className="hidden md:flex flex-col bg-slate-900 text-white p-8 lg:p-12 justify-between relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-125 h-125 bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-125px h-125px bg-cyan-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="z-10 relative">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
              <Image
                src="/images/logokeuanganku.png"
                alt="Logo Keuanganku"
                width={140}
                height={40}
                className="object-contain brightness-0 invert"
                priority
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
            SaaS For Professional Agent
          </div>
        </div>

        <div className="z-10 space-y-10 relative mt-8 lg:mt-0">
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-5xl font-extrabold leading-tight tracking-tight">
              Tingkatkan Skala <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">
                Bisnis Konsultasi Anda
              </span>
            </h2>
            <p className="text-base lg:text-lg text-slate-400 max-w-md leading-relaxed">
              Bergabunglah dengan jaringan agen asuransi profesional yang menggunakan data untuk memberikan solusi riil kepada klien.
            </p>
          </div>

          <div className="grid gap-5">
            <FeatureItem
              icon={<BarChart3 className="w-5 h-5 text-blue-300" />}
              title="Analisa Berbasis Data"
              desc="Visualisasi arus kas dan portofolio yang presisi."
            />
            <FeatureItem
              icon={<ShieldCheck className="w-5 h-5 text-cyan-300" />}
              title="Simulasi Risiko Riil"
              desc="Hitungan proteksi yang logis & transparan untuk klien."
            />
          </div>
        </div>

        <div className="z-10 pt-8 border-t border-white/10 relative mt-12">
          <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Keamanan OTP & Enkripsi Data Setara Bank
          </p>
        </div>
      </div>

      {/* === RIGHT SIDE - FORM (Mobile & Desktop) === */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 relative overflow-hidden">

        {/* [PWA] Mobile Specific Decorations & Back Button */}
        <div className="md:hidden absolute top-0 right-0 w-[80%] h-[50%] bg-blue-600/5 -skew-x-12 transform origin-top translate-x-1/4" />

        {/* Tombol Back dinamis berdasarkan Step */}
        {step === 1 ? (
          <Link
            href="/login"
            className="md:hidden absolute top-4 left-4 z-50 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        ) : null}

        {/* Decorative BG Right Side (Desktop) */}
        <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <Card className="w-full max-w-md border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:shadow-[0_20px_50px_rgba(30,58,138,0.08)] bg-white/95 backdrop-blur-xl rounded-[2rem] relative z-10 mt-8 md:mt-0 transition-all duration-500 ease-in-out">
          <CardHeader className="space-y-2 text-center pb-6 sm:pb-8 pt-8">
            {/* Logo Khusus Mobile */}
            <div className="md:hidden flex justify-center mb-2">
              <div className="relative w-16 h-16 bg-white rounded-2xl p-2 shadow-sm border border-slate-100">
                <Image src="/images/logokeuanganku.png" alt="Logo" width={100} height={100} className="object-contain w-full h-full" />
              </div>
            </div>

            {/* Dinamis Header Title Berdasarkan State */}
            {step === 1 && (
              <>
                <CardTitle className="text-2xl font-extrabold text-slate-900">Registrasi Agen Baru</CardTitle>
                <CardDescription className="text-slate-500 text-[13px] sm:text-sm px-4">
                  Buat identitas profesional Anda untuk akses portal SaaS KeuanganKu
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="px-6 sm:px-8 pb-8">

            {/* === CONDITIONAL RENDERING STATE MACHINE === */}

            {step === 1 && (
              <form onSubmit={handleRegisterPhase1} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-700 font-bold text-xs uppercase tracking-wider ml-1">Nama Lengkap & Gelar</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                    <Input
                      id="fullName"
                      name="fullName"
                      autoComplete="name"
                      placeholder="Contoh: Budi Santoso, RFP"
                      className="pl-12 h-14 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all text-[16px] sm:text-[15px]"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-bold text-xs uppercase tracking-wider ml-1">Email Aktif (Verifikasi)</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="nama@email.com"
                      className="pl-12 h-14 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all text-[16px] sm:text-[15px]"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Password Group */}
                <div className="grid grid-cols-1 gap-5 sm:gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700 font-bold text-xs uppercase tracking-wider ml-1">Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-12 pr-10 h-14 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all text-[16px] sm:text-[15px]"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-700 font-bold text-xs uppercase tracking-wider ml-1">Konfirmasi</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-12 pr-10 h-14 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all text-[16px] sm:text-[15px]"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 text-[15px] mt-2 rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Mengirim OTP...
                    </span>
                  ) : (
                    "Lanjutkan Verifikasi Email"
                  )}
                </Button>
              </form>
            )}

            {/* === COMPONENT DELEGATION UNTUK FASE 2 === */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <OtpVerificationForm
                  email={formData.email}
                  onBack={() => setStep(1)} // Fungsi ini mengembalikan state UI ke step 1
                />
              </div>
            )}

          </CardContent>

          {/* Sembunyikan Footer Login jika sedang di step OTP agar fokus */}
          {step === 1 && (
            <CardFooter className="flex flex-col space-y-6 border-t border-slate-100 pt-6 px-6 sm:px-8 pb-8">
              <p className="text-[13px] text-slate-500 text-center font-medium">
                Sudah memiliki akun agen?{" "}
                <Link href="/login" className="text-blue-600 font-bold hover:text-blue-800 active:text-blue-900 transition-colors inline-block py-1 px-2 rounded-lg hover:bg-blue-50">
                  Masuk Portal
                </Link>
              </p>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full justify-center opacity-80 w-max mx-auto">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  256-bit Secure Encryption
                </span>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

// Helper Component untuk Left Side (Desktop Only)
function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-default group">
      <div className="mt-1 bg-slate-800/80 p-3 rounded-3xl border border-slate-700 shadow-sm group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <div>
        <p className="font-bold text-white text-[15px] mb-1">{title}</p>
        <p className="text-[13px] text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}