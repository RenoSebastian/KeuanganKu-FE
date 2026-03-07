"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { OtpVerificationForm } from "@/components/features/auth/otp-verification-form";
import { cn } from "@/lib/utils";

type RegistrationStep = 1 | 2;

export default function RegisterPage() {
  // [FIX]: Inisialisasi router agar tidak error 'Cannot find name router'
  const router = useRouter();

  const [step, setStep] = useState<RegistrationStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterPhase1 = async (e: React.FormEvent) => {
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

      setStep(2);
      toast.success("OTP Berhasil Dikirim", {
        description: "Silakan periksa kotak masuk email Anda."
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal melakukan registrasi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col md:grid md:grid-cols-2 bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">

      {/* === LEFT SIDE: BRAND NARRATIVE (DESKTOP) === */}
      <div className="hidden md:flex flex-col bg-slate-900 text-white p-12 lg:p-16 justify-between relative overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-150 h-150 bg-blue-600 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -bottom-40 -left-20 w-150 h-150 bg-indigo-600/30 rounded-full blur-[100px]"
        />

        <div className="z-10 relative">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-all mb-10 text-sm font-bold group">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Beranda
          </Link>

          {/* Logo Tanpa Background (Seamless) */}
          <div className="mb-8 flex items-center">
            <Image src="/images/logokeuanganku.png" alt="Logo" width={180} height={45} className="object-contain brightness-0 invert" priority />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
            Enterprise Agent Portal
          </div>
        </div>

        <div className="z-10 relative space-y-8">
          <h2 className="text-4xl lg:text-6xl font-black leading-[1.1] tracking-tighter">
            Berikan Masa Depan <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-cyan-400 to-indigo-400">
              Terukur Untuk Klien
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-md font-medium leading-relaxed">
            Gabung dengan komunitas agen cerdas yang beralih dari sekadar jualan ke solusi berbasis data finansial yang akurat.
          </p>

          <div className="flex flex-col gap-6 pt-4">
            <FeatureItem
              icon={<BarChart3 className="text-blue-400" />}
              title="Dashboard Wealth Management"
              desc="Kelola portofolio klien secara terpusat dan realtime."
            />
            <FeatureItem
              icon={<ShieldCheck className="text-cyan-400" />}
              title="Enkripsi Level Korporasi"
              desc="Keamanan data klien adalah prioritas nomor satu kami."
            />
          </div>
        </div>

        <div className="z-10 relative pt-8 border-t border-white/5">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} KeuanganKu &bull; System Verified
          </p>
        </div>
      </div>

      {/* === RIGHT SIDE: FORM (MOBILE & TABLET) === */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">

        <div className="md:hidden absolute top-0 inset-x-0 h-64 bg-slate-900 -z-10" />
        <div className="md:hidden absolute top-48 inset-x-0 h-32 bg-[#F8FAFC] rounded-t-[3rem] -z-10" />

        <div className="w-full max-w-md flex flex-col gap-6 relative z-10">

          {/* Header Progress Tracker */}
          <div className="flex items-center justify-between px-4">
            <button
              onClick={() => step === 2 ? setStep(1) : router.push('/login')}
              className="w-10 h-10 rounded-2xl bg-white md:bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm active:scale-90 transition-all"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
            <div className="flex gap-2">
              <div className={cn("h-1.5 rounded-full transition-all duration-500", step === 1 ? "w-8 bg-blue-600" : "w-4 bg-slate-200")} />
              <div className={cn("h-1.5 rounded-full transition-all duration-500", step === 2 ? "w-8 bg-blue-600" : "w-4 bg-slate-200")} />
            </div>
          </div>

          <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white/95 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="text-center pt-10 pb-6">
              {/* Logo Khusus Mobile Tanpa Background */}
              <div className="md:hidden flex justify-center mb-6">
                <Image src="/images/logokeuanganku.png" alt="Logo" width={140} height={40} className="object-contain" />
              </div>
              <CardTitle className="text-3xl font-black text-slate-900 tracking-tighter">
                {step === 1 ? "Daftar Akun" : "Verifikasi Email"}
              </CardTitle>
              <CardDescription className="font-medium text-slate-500 px-4">
                {step === 1 ? "Lengkapi data identitas profesional Anda" : `Kami telah mengirimkan kode OTP ke ${formData.email}`}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-7 sm:px-10 pb-10">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.form
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleRegisterPhase1}
                    className="space-y-5"
                  >
                    {/* Input Fields */}
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Lengkap</Label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                          <User size={18} />
                        </div>
                        <Input
                          name="fullName"
                          placeholder="Budi Santoso, RFP"
                          className="pl-12 h-15 bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 rounded-2xl transition-all text-base"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Profesional</Label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                          <Mail size={18} />
                        </div>
                        <Input
                          name="email"
                          type="email"
                          inputMode="email"
                          placeholder="nama@perusahaan.com"
                          className="pl-12 h-15 bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 rounded-2xl transition-all text-base"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</Label>
                        <div className="relative group">
                          <Input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="h-15 bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 rounded-2xl transition-all text-base"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Konfirmasi</Label>
                        <div className="relative group">
                          <Input
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="h-15 bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 rounded-2xl transition-all text-base"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                          />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-15 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[13px] rounded-2xl shadow-xl shadow-slate-200 mt-4 active:scale-95 transition-all"
                    >
                      {isLoading ? <Loader2 className="animate-spin" /> : "Kirim Kode Verifikasi"}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <OtpVerificationForm
                      email={formData.email}
                      onBack={() => setStep(1)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>

            {step === 1 && (
              <CardFooter className="flex flex-col gap-8 bg-slate-50/50 py-8 px-10">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Sudah terdaftar sebagai agen?</span>
                  <Link href="/login" className="text-blue-600 font-black text-sm hover:underline decoration-2 underline-offset-4">
                    Masuk Portal KeuanganKu
                  </Link>
                </div>

                <div className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-100 rounded-full shadow-sm">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    AES-256 Bit Data Encryption
                  </span>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-5 p-5 rounded-[2rem] hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group cursor-default">
      <div className="bg-slate-800 p-3.5 rounded-2xl shadow-inner group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <div>
        <p className="font-black text-white text-[16px] mb-1 tracking-tight">{title}</p>
        <p className="text-[14px] text-slate-500 leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  );
}