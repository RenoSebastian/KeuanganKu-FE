"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  UserPlus, Mail, Lock, User, Loader2, Building2, 
  BadgeCheck, Eye, EyeOff, AlertCircle 
} from "lucide-react";
import api from "@/lib/axios";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    nip: "", 
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error saat user mengetik
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.passwordConfirm) {
      setError("Konfirmasi password tidak cocok!");
      setIsLoading(false);
      return;
    }

    try {
      // Mapping data sesuai DTO Backend
      const payload = {
        nip: formData.nip,
        fullName: formData.name, 
        email: formData.email,
        password: formData.password,
        unitKerjaId: "KANTOR_PUSAT", // Default sementara
      };

      await api.post("/auth/register", payload);

      // Redirect ke login setelah sukses
      // Kita bisa tambahkan toast/alert sukses di sini jika ada librarynya
      alert("Registrasi Berhasil! Silakan login untuk melanjutkan.");
      router.push("/login");

    } catch (error: any) {
      console.error("Register Error:", error);
      const msg = error.response?.data?.message 
        ? (Array.isArray(error.response.data.message) 
            ? error.response.data.message.join(", ") 
            : error.response.data.message)
        : "Gagal mendaftar. Cek kembali data Anda.";
      
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface-ground relative overflow-hidden py-10">
      
      {/* --- BACKGROUND DECORATION (Consistent with Login) --- */}
      <div className="absolute inset-0 bg-brand-900">
         <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-10 mix-blend-overlay"></div>
         <div className="absolute top-0 left-0 w-2008h-200brand-500/20 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
         <div className="absolute bottom-0 right-0 w-150 h-150 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative z-10 w-full max-w-lg px-5">
        <Card className="p-8 md:p-10 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl shadow-brand-900/30 rounded-[2.5rem]">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col items-center mb-8 text-center">
             <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-4 shadow-inner text-brand-600">
                <Building2 className="w-8 h-8" />
             </div>
             <h1 className="text-2xl font-black text-brand-900 tracking-tight">
               Registrasi Pegawai
             </h1>
             <p className="text-sm text-slate-500 font-medium mt-1 max-w-xs">
               Bergabung dengan ekosistem koperasi digital MAXIPRO
             </p>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-rose-600 leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            
            {/* NIP Field */}
            <div className="space-y-2">
              <Label variant="field">Nomor Induk Pegawai (NIP)</Label>
              <div className="relative group">
                <BadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                <Input 
                  name="nip"
                  placeholder="Contoh: 19900101..." 
                  className="pl-12 h-12 bg-slate-50 border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl font-medium font-mono"
                  value={formData.nip}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Nama Lengkap */}
            <div className="space-y-2">
              <Label variant="field">Nama Lengkap</Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                <Input 
                  name="name"
                  placeholder="Nama Sesuai SK" 
                  className="pl-12 h-12 bg-slate-50 border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl font-medium"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label variant="field">Email Kantor</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                <Input 
                  name="email"
                  type="email"
                  placeholder="nama@maxipro.co.id" 
                  className="pl-12 h-12 bg-slate-50 border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl font-medium"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label variant="field">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                  <Input 
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="******" 
                    className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl font-medium"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label variant="field">Ulangi Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                  <Input 
                    name="passwordConfirm"
                    type={showPassword ? "text" : "password"}
                    placeholder="******" 
                    className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl font-medium"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
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
                  <UserPlus className="w-5 h-5" /> Daftar Sekarang
                </span>
              )}
            </Button>

          </form>

          {/* FOOTER LINK */}
          <div className="mt-8 text-center pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              Sudah memiliki akun aktif?{" "}
              <Link href="/login" className="text-brand-600 font-bold hover:text-brand-700 hover:underline transition-all">
                Login disini
              </Link>
            </p>
          </div>

        </Card>
      </div>
    </div>
  );
}