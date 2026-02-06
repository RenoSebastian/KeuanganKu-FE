"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BadgeCheck, Briefcase, Mail, Lock, User, Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    nip: "",
    unitKerja: "",
    role: "USER", // Default role
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value });
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
      // Panggil Service Register - Typescript akan happy sekarang karena RegisterDto sudah update
      await authService.register({
        fullName: formData.fullName,
        nip: formData.nip,
        unitKerja: formData.unitKerja,
        role: formData.role,
        email: formData.email,
        password: formData.password
      });

      toast.success("Registrasi berhasil! Silakan login.");
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
      {/* Left Side - Image/Brand */}
      <div className="hidden md:flex flex-col bg-slate-900 text-white p-10 justify-between relative overflow-hidden">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-2">
            <Image 
              src="/images/logogeocitra.png" 
              alt="Logo Geo Citra" 
              width={40} 
              height={40} 
              className="brightness-0 invert"
            />
            <h1 className="text-2xl font-bold tracking-tight">GeoCitra</h1>
          </div>
          <p className="text-slate-400">Financial Planning & Employee Education Platform</p>
        </div>

        <div className="z-10 space-y-6">
          <h2 className="text-4xl font-extrabold leading-tight">
            Mulai Perjalanan <br/> <span className="text-blue-400">Finansial Cerdas</span>
          </h2>
          <p className="text-lg text-slate-300 max-w-md">
            Bergabunglah dengan ribuan pegawai lainnya untuk mengelola keuangan, dana pensiun, dan asuransi dengan lebih bijak.
          </p>
        </div>

        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-6 bg-slate-50">
        <Card className="w-full max-w-lg border-none shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-slate-800">Buat Akun Baru</CardTitle>
            <CardDescription className="text-center">
              Lengkapi data diri Anda untuk mengakses dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Full Name */}
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input 
                    name="fullName"
                    placeholder="Contoh: Budi Santoso" 
                    className="pl-10 bg-white" 
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* NIP Field */}
              <div className="space-y-2">
                <Label>Nomor Induk Pegawai (NIP)</Label>
                <div className="relative group">
                  <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input 
                    name="nip"
                    placeholder="Masukkan NIP Anda" 
                    className="pl-10 bg-white"
                    value={formData.nip}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Unit Kerja & Role Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Unit Kerja</Label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10" />
                    <Input 
                      name="unitKerja"
                      placeholder="Divisi IT" 
                      className="pl-10 bg-white"
                      value={formData.unitKerja}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Role Akses</Label>
                  <Select onValueChange={handleRoleChange} defaultValue="USER">
                    <SelectTrigger className="bg-white pl-10 relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <SelectValue placeholder="Pilih Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Pegawai (User)</SelectItem>
                      <SelectItem value="ADMIN">Admin Unit</SelectItem>
                      <SelectItem value="DIRECTOR">Direksi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label>Email Perusahaan</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input 
                    name="email"
                    type="email" 
                    placeholder="nama@perusahaan.co.id" 
                    className="pl-10 bg-white"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input 
                      name="password"
                      type="password" 
                      placeholder="******" 
                      className="pl-10 bg-white"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Konfirmasi</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input 
                      name="confirmPassword"
                      type="password" 
                      placeholder="******" 
                      className="pl-10 bg-white"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 mt-4" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mendaftarkan...
                  </>
                ) : (
                  "Daftar Sekarang"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t pt-4">
            <p className="text-sm text-slate-600">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-blue-600 font-bold hover:underline">
                Login disini
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
