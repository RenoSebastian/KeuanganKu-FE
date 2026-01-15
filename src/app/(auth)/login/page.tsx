"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { LogIn, AlertCircle } from "lucide-react";
import api from "@/lib/axios"; // Import Helper Axios kita tadi

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Tembak API Backend
      const response = await api.post("/auth/login", formData);
      
      // 2. Ambil Token & User Data
      const { access_token, user } = response.data;

      // 3. Simpan ke LocalStorage (Sederhana & Efektif)
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      // 4. Redirect ke Dashboard
      router.push("/");
      
    } catch (err: any) {
      // Handle Error dari Backend
      const msg = err.response?.data?.message || "Login gagal. Periksa koneksi Anda.";
      setError(Array.isArray(msg) ? msg[0] : msg); // Kadang message berupa array
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-5">
      <Card className="w-full max-w-md p-8 bg-white/80 backdrop-blur-sm border-white shadow-xl rounded-3xl">
        {/* LOGO SECTION */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-48 h-20 mb-2">
             <Image 
               src="/images/pamjaya-logo.png" 
               alt="Logo PAM JAYA"
               fill
               className="object-contain"
               priority
             />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Koperasi Keuangan</h1>
          <p className="text-xs text-slate-500 font-medium">Masuk untuk mengelola finansial Anda</p>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-xs font-bold text-red-600">{error}</p>
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 ml-1">Email Karyawan</label>
            <Input 
              type="email" 
              placeholder="nama@pamjaya.co.id"
              className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 ml-1">Password</label>
            <Input 
              type="password" 
              placeholder="••••••••"
              className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl bg-blue-700 hover:bg-blue-800 text-sm font-bold shadow-lg shadow-blue-700/20 mt-4"
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : (
              <span className="flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Masuk Aplikasi
              </span>
            )}
          </Button>
        </form>

        <p className="text-center text-[10px] text-slate-400 mt-8 font-medium">
          &copy; 2026 PAM JAYA. All Rights Reserved.
        </p>
      </Card>
    </div>
  );
}