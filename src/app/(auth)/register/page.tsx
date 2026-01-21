"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { UserPlus, Mail, Lock, User, Loader2, Building2, Badge } from "lucide-react";
import api from "@/lib/axios";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nip: "", 
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.passwordConfirm) {
      alert("Password konfirmasi tidak cocok!");
      setIsLoading(false);
      return;
    }

    try {
      // --- PERBAIKAN DISINI ---
      // Mapping data agar sesuai DTO Backend (RegisterDto)
      const payload = {
        nip: formData.nip,
        fullName: formData.name, // BE minta 'fullName', bukan 'name'
        email: formData.email,
        password: formData.password,
        // Karena belum ada dropdown Unit Kerja, kita hardcode dulu biar lolos validasi
        unitKerjaId: "KANTOR_PUSAT", 
      };

      await api.post("/auth/register", payload);

      alert("Registrasi Berhasil! Silakan login.");
      router.push("/login");

    } catch (error: any) {
      console.error("Register Error:", error);
      // Menangkap pesan error spesifik dari Class Validator NestJS
      const msg = error.response?.data?.message 
        ? (Array.isArray(error.response.data.message) 
            ? error.response.data.message.join(", ") 
            : error.response.data.message)
        : "Gagal mendaftar. Cek kembali data Anda.";
      
      alert(`Gagal: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full">
        
        {/* Logo / Header */}
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl text-white mb-4 shadow-lg shadow-blue-200">
             <Building2 className="w-6 h-6" />
           </div>
           <h1 className="text-2xl font-bold text-slate-800">Daftar Akun Pegawai</h1>
           <p className="text-slate-500 text-sm mt-2">
             Isi data diri sesuai identitas kepegawaian Anda.
           </p>
        </div>

        <Card className="p-8 border-slate-200 shadow-xl bg-white/80 backdrop-blur-xl">
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* INPUT NIP */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase ml-1">Nomor Induk Pegawai (NIP)</label>
              <div className="relative">
                <Badge className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input 
                  name="nip"
                  placeholder="Contoh: 199001012024011001" 
                  className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all font-mono"
                  value={formData.nip}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Nama */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase ml-1">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input 
                  name="name"
                  placeholder="Nama Pegawai" 
                  className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase ml-1">Email Kantor</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input 
                  name="email"
                  type="email"
                  placeholder="nama@pamjaya.co.id" 
                  className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input 
                    name="password"
                    type="password"
                    placeholder="******" 
                    className="pl-9 h-11 bg-slate-50 border-slate-200"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase ml-1">Ulangi Pass</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input 
                    name="passwordConfirm"
                    type="password"
                    placeholder="******" 
                    className="pl-9 h-11 bg-slate-50 border-slate-200"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 mt-2"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Daftar Pegawai
            </Button>

          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-blue-600 font-bold hover:underline">
                Login disini
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}