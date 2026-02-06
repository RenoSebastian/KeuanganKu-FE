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
  LineChart,
  ShieldCheck,
  Users,
  Lock,
  User,
  Loader2,
  Mail,
  BarChart3,
  Presentation
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
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Side - Brand Narrative (Financial Conversation Tool) */}
      <div className="hidden md:flex flex-col bg-[#0f172a] text-white p-12 justify-between relative overflow-hidden">
        <div className="z-10">
          <div className="flex items-center gap-3 mb-2">
            {/* Mengganti icon Presentation dengan Logo Image sesuai path yang diberikan */}
            <Image
              src="/images/logokeuanganku.png"
              alt="Logo Keuanganku"
              width={180} // Ukuran disesuaikan agar proporsional sebagai identitas utama
              height={50}
              className="object-contain"
              priority
            />
          </div>
          <p className="text-slate-400 font-medium ml-1">Sistem Kesehatan Finansial</p>
        </div>

        <div className="z-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold leading-tight">
              Ubah Diskusi Menjadi <br />
              <span className="text-orange-500">Percakapan Logis</span>
            </h2>
            <p className="text-lg text-slate-300 max-w-md leading-relaxed">
              Bantu klien memahami kondisi keuangannya melalui visualisasi data. Berhenti sekadar menjual, mulailah memberikan solusi nyata.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-blue-500/20 p-2 rounded-md">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-white">Bukan Sekadar Angka</p>
                <p className="text-sm text-slate-400">Visualisasikan arus kas dan potensi kebocoran klien secara instan.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 bg-green-500/20 p-2 rounded-md">
                <ShieldCheck className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-white">Jembatan Logis Proteksi</p>
                <p className="text-sm text-slate-400">Tunjukkan konsekuensi risiko agar asuransi muncul sebagai kebutuhan.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="z-10 pt-10 border-t border-slate-800">
          <p className="text-sm italic text-slate-500">
            "Biarkan data yang bicara, Anda yang memandu solusinya."
          </p>
        </div>

        {/* Decorative background gradients */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-8 bg-slate-50">
        <Card className="w-full max-w-md border-none shadow-2xl bg-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-slate-900">Registrasi Agen</CardTitle>
            <CardDescription>
              Daftarkan diri Anda untuk mulai menggunakan alat bantu konsultasi profesional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap & Gelar</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Contoh: Nama Lengkap, CFP®"
                    className="pl-10 focus-visible:ring-orange-500"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Profesional</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@agency.com"
                    className="pl-10 focus-visible:ring-orange-500"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••"
                      className="pl-10 focus-visible:ring-orange-500"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••"
                      className="pl-10 focus-visible:ring-orange-500"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold h-11 mt-2 transition-all shadow-lg shadow-orange-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
                  </>
                ) : (
                  "Aktifkan Akses Agen"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t pt-6">
            <p className="text-sm text-slate-600 text-center">
              Sudah memiliki akun agen?{" "}
              <Link href="/login" className="text-orange-600 font-bold hover:underline">
                Login di sini
              </Link>
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest justify-center">
              <ShieldCheck className="w-3 h-3" />
              Secure Data Encryption
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}