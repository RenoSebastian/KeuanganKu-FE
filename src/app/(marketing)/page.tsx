import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  GraduationCap, 
  Umbrella, 
  Wallet,
  Activity
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image 
                src="/images/pamjaya-logo.png" 
                alt="Logo PAM JAYA" 
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">
              Keuangan<span className="text-blue-600">Ku</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/login">
              {/* FIX: Mengganti variant="default" menjadi "primary" */}
              <Button variant="primary" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
                Masuk Aplikasi
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <Image 
            src="/images/bg1.png" 
            alt="Background Pattern" 
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Platform Financial Wellness Eksklusif
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
            Wujudkan Masa Depan <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Finansial Sejahtera
            </span>
          </h1>
          
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700">
            Solusi cerdas bagi karyawan untuk melakukan checkup kesehatan keuangan, 
            merencanakan dana pendidikan anak, hingga persiapan masa pensiun yang tenang.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <Link href="/login">
              {/* FIX: Variant default dihapus (fallback ke primary) */}
              <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20">
                Mulai Cek Kesehatan <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-slate-300 text-slate-700 hover:bg-slate-50">
                Pelajari Fitur
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. FEATURES GRID */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Fitur Unggulan</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Satu aplikasi untuk seluruh kebutuhan perencanaan finansial Anda dan keluarga.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Activity className="w-8 h-8 text-white" />}
              color="bg-emerald-500"
              title="Financial Checkup"
              desc="Analisis otomatis rasio utang, aset, dan likuiditas untuk mengetahui skor kesehatan finansial Anda saat ini."
            />
            <FeatureCard 
              icon={<GraduationCap className="w-8 h-8 text-white" />}
              color="bg-blue-500"
              title="Dana Pendidikan"
              desc="Kalkulator pintar untuk estimasi biaya sekolah anak dari TK hingga Kuliah dengan memperhitungkan inflasi."
            />
            <FeatureCard 
              icon={<Umbrella className="w-8 h-8 text-white" />}
              color="bg-indigo-500"
              title="Perencanaan Pensiun"
              desc="Simulasi kebutuhan dana hari tua untuk memastikan gaya hidup Anda tetap terjaga setelah purna tugas."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-white" />}
              color="bg-rose-500"
              title="Proteksi Asuransi"
              desc="Hitung kebutuhan Uang Pertanggungan (UP) Jiwa yang ideal agar keluarga tercinta tetap terlindungi."
            />
            <FeatureCard 
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              color="bg-amber-500"
              title="Simulasi Tujuan"
              desc="Rencanakan pembelian rumah, kendaraan, atau ibadah haji dengan roadmap tabungan yang terukur."
            />
            <FeatureCard 
              icon={<Wallet className="w-8 h-8 text-white" />}
              color="bg-slate-700"
              title="Budgeting 50/30/20"
              desc="Panduan alokasi gaji bulanan untuk Kebutuhan, Keinginan, dan Tabungan sesuai standar global."
            />
          </div>
        </div>
      </section>

      {/* 4. TRUST & SECURITY */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-green-50 text-green-700 text-sm font-semibold">
              <ShieldCheck className="w-4 h-4" /> Keamanan Prioritas Utama
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Data Anda Bersifat Pribadi & Rahasia</h2>
            <p className="text-lg text-slate-600">
              Sistem kami menggunakan enkripsi standar industri. Data finansial yang Anda masukkan hanya digunakan untuk keperluan kalkulasi analisis pribadi Anda dan diagregasi secara anonim untuk laporan manajemen risiko.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-700">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                Tidak ada data gaji spesifik yang dipublikasikan.
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                Akses data detail dibatasi dengan Audit Trail ketat.
              </li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-50">
               {/* Placeholder Illustration */}
               <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <p className="font-medium text-slate-400">Enkripsi End-to-End</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 grayscale opacity-70">
                <Image 
                  src="/images/pamjaya-logo.png" 
                  alt="Logo PAM JAYA" 
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-semibold text-white tracking-tight">
                KeuanganKu System
              </span>
            </div>
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} PAM JAYA Financial Wellness. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// FIX: Menghapus CardContent dan menggunakan div biasa (padding langsung di Card)
function FeatureCard({ icon, color, title, desc }: { icon: React.ReactNode, color: string, title: string, desc: string }) {
  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white p-8">
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shadow-lg mb-6`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">
        {desc}
      </p>
    </Card>
  );
}