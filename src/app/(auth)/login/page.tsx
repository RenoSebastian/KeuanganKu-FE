"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  LogIn, Eye, EyeOff, Lock, Mail, AlertCircle,
  ArrowLeft, ShieldCheck, Info, Loader2
} from "lucide-react";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// [TAMBAHAN] Import Komponen Verifikator Login yang baru saja kita buat
import { LoginOtpForm } from "@/components/features/auth/login-otp-form";

// Mendefinisikan tipe langkah (State Machine)
type LoginStep = 1 | 2;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const kickReason = searchParams.get('reason');

  // [STATE MACHINE] Mengendalikan transisi tampilan
  const [step, setStep] = useState<LoginStep>(1);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    if (kickReason === 'kicked') {
      setError("Akun Anda baru saja login di perangkat lain.");
    } else if (kickReason === 'expired') {
      setInfoMessage("Sesi telah berakhir. Silakan login kembali.");
    }
  }, [kickReason]);

  const handleLoginPhase1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setInfoMessage("");

    try {
      // [LOGIKA BISNIS] Kita hanya meminta Backend untuk memverifikasi kredensial 
      // dan mengirimkan OTP (Deferred Session)
      await authService.login({
        email: formData.email,
        password: formData.password
      });

      // Transisi ke Phase 2 (Verifikasi OTP) secara mulus
      setStep(2);
      toast.success("Otorisasi Diperlukan", {
        description: "Kode keamanan telah dikirim ke kotak masuk Anda.",
      });

    } catch (err: any) {
      setError(err.response?.status === 403 || err.response?.status === 401
        ? "Email atau kata sandi tidak sesuai. Silakan coba lagi."
        : "Koneksi terganggu. Periksa internet Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="border-none shadow-2xl shadow-blue-900/5 bg-white/90 backdrop-blur-2xl overflow-hidden rounded-[2.5rem]">
        <CardContent className="p-7 sm:p-10 relative overflow-hidden">

          <AnimatePresence mode="wait">

            {/* ================================================================= */}
            {/* STATE 1: CREDENTIAL INPUT                                         */}
            {/* ================================================================= */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <form onSubmit={handleLoginPhase1} className="space-y-6">

                  {/* Alert Section */}
                  <AnimatePresence mode="wait">
                    {(error || infoMessage) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={cn(
                          "p-4 rounded-2xl text-[13px] flex items-start gap-3 border font-medium mb-6",
                          error ? "bg-red-50 text-red-700 border-red-100" : "bg-blue-50 text-blue-700 border-blue-100"
                        )}
                      >
                        {error ? <AlertCircle className="w-5 h-5 shrink-0" /> : <Info className="w-5 h-5 shrink-0" />}
                        <span>{error || infoMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-5">
                    {/* Email */}
                    <div className="space-y-2.5">
                      <Label htmlFor="email" className="text-slate-600 font-bold text-[13px] ml-1 uppercase tracking-wider">Email</Label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 group-focus-within:bg-blue-600 group-focus-within:text-white transition-all duration-300">
                          <Mail size={18} />
                        </div>
                        <Input
                          id="email"
                          type="email"
                          inputMode="email"
                          placeholder="nama@email.com"
                          className="pl-16 h-15 bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all rounded-2xl text-base"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center ml-1">
                        <Label htmlFor="password" className="text-slate-600 font-bold text-[13px] uppercase tracking-wider">Kata Sandi</Label>
                        {/* [NEW] Navigasi ke Forgot Password */}
                        <Link
                          href="/forgot-password"
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider"
                          tabIndex={-1}
                        >
                          Lupa Sandi?
                        </Link>
                      </div>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 group-focus-within:bg-blue-600 group-focus-within:text-white transition-all duration-300">
                          <Lock size={18} />
                        </div>
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-16 pr-12 h-15 bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all rounded-2xl text-base"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-15 mt-4 text-base font-black uppercase tracking-widest rounded-2xl bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-200 transition-all active:scale-[0.97]"
                  >
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-3">
                        Lanjutkan <LogIn size={20} />
                      </span>
                    )}
                  </Button>
                </form>

                <div className="mt-10 pt-8 border-t border-slate-50 text-center space-y-8">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-tight">Belum punya akses?</span>
                    <Link href="/register" className="text-blue-600 font-black text-sm hover:underline decoration-2 underline-offset-4">
                      Daftar Akun Agent
                    </Link>
                  </div>

                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">
                      Bank-Grade Security
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ================================================================= */}
            {/* STATE 2: OTP VERIFICATION (COMPONENT DELEGATION)                  */}
            {/* ================================================================= */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <LoginOtpForm
                  email={formData.email}
                  onBack={() => setStep(1)}
                />
              </motion.div>
            )}

          </AnimatePresence>

        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-dvh w-full flex flex-col items-center justify-center bg-[#F8FAFC] relative overflow-hidden p-4 sm:p-6">

      {/* Immersive Background Decorations */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[10%] -right-[10%] w-[70%] h-[70%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 30, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[5%] -left-[5%] w-[50%] h-[50%] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"
      />

      <div className="relative z-10 w-full max-w-md flex flex-col gap-8">

        {/* Portal Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative flex items-center justify-center p-2"
          >
            <Image
              src="/images/logokeuanganku.png"
              alt="Logo KeuanganKu"
              width={240}  // Ditingkatkan (aslinya tampil 80px, kita kasih 240px agar tajam)
              height={180} // Sesuaikan rasio
              className="object-contain w-auto h-20 sm:h-16"
              priority
              quality={100} // Tambahkan ini agar kompresi tidak terlalu tinggi
            />
          </motion.div>

          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
              Selamat Datang
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Portal Keamanan Agen Asuransi.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <Suspense fallback={
          <div className="h-125 w-full flex items-center justify-center bg-white rounded-[2.5rem] shadow-sm">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        }>
          <LoginForm />
        </Suspense>

        {/* Footer */}
        <footer className="text-center">
          <p className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} KeuanganKu &bull; V2.0
          </p>
        </footer>
      </div>

      {/* Floating Back Button */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-50 flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-xl shadow-slate-200 text-slate-400 hover:text-blue-600 transition-all active:scale-90"
      >
        <ArrowLeft size={20} strokeWidth={2.5} />
      </Link>
    </div>
  );
}