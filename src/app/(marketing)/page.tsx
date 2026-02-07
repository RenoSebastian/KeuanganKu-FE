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
  Activity,
  CheckCircle2,
  LineChart,
  Mail,
  Building2,
  BarChart3,
  Users2,
  Briefcase
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50/30">

      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/40 bg-white/80 backdrop-blur-xl shadow-sm shadow-blue-900/5">
        <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex flex-col items-start justify-center">
            {/* Logo Wrapper */}
            <div className="relative w-32 h-10">
              <Image
                src="/images/logokeuanganku.png"
                alt="Logo KeuanganKu"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-[10px] text-blue-600 font-bold tracking-widest uppercase mt-0.5">
              Financial Conversation Tool
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="default"
                className="rounded-full px-6 shadow-lg shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 border-none transition-all hover:scale-105"
              >
                Login Pro-Agent
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-24 pb-40 lg:pt-32 lg:pb-60 overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/orang.png"
            alt="Agent Consulting"
            fill
            className="object-cover object-center opacity-100"
            priority
          />

          {/* Gradien Blur diperhalus dengan tone biru muda */}
          <div className="absolute inset-0 bg-linear-to-tr from-white via-white/20 to-blue-50/10"></div>

          {/* Overlay kontras */}
          <div className="absolute inset-0 bg-linear-to-r from-white/40 via-white/10 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-blue-100 text-blue-700 text-sm font-bold mb-8 shadow-sm">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Professional Agent Sales Toolkit
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-[1.15]">
              Bantu Klien Menjelaskan, <br />
              {/* Gradient Text: Blue to Cyan */}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-700 via-blue-600 to-cyan-500">
                Bukan Sekadar Meyakinkan.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed font-medium max-w-2xl">
              Alat bantu visual profesional untuk agen asuransi. Memetakan kondisi keuangan klien secara transparan dan mengubah skema proteksi menjadi kebutuhan nyata.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-700/20 border-none transition-transform hover:scale-105 font-bold">
                  Mulai Konsultasi Data <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-white/60 backdrop-blur-md border-slate-200 hover:bg-white hover:border-blue-200 text-slate-700 hover:text-blue-700 transition-all">
                  Lihat Fitur Agen
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VALUE PROPOSITION */}
      <section className="relative z-20 -mt-24 pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform group">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Visualisasi Arus Kas</h3>
              <p className="text-slate-500 leading-relaxed">Tampilkan grafik kebocoran keuangan klien secara instan dan logis.</p>
            </div>

            {/* Card 2 (Highlight) */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-900/5 border border-blue-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform relative overflow-hidden group">
              <div className="absolute top-0 w-full h-1.5 bg-linear-to-r from-blue-500 to-cyan-500"></div>
              <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center mb-6 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                <Users2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Multi-Klien Profiling</h3>
              <p className="text-slate-500 leading-relaxed">Kelola database prospek dan ringkasan diskusi keuangan dalam satu dashboard.</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform group">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Simulasi Risiko Nyata</h3>
              <p className="text-slate-500 leading-relaxed">Ubah risiko abstrak menjadi angka nyata yang dipahami klien kurang dari 10 menit.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. ABOUT SECTION - PARTNERSHIP */}
      <section className="relative py-28 bg-linear-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            <div className="flex flex-col items-center lg:items-start gap-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-bold tracking-widest uppercase shadow-sm">
                Strategic Partnership
              </div>
              <div className="flex items-center gap-8 bg-white rounded-3xl px-10 py-8 shadow-xl shadow-blue-900/5 border border-slate-100">
                <Image src="/images/maxipro.webp" alt="Logo KeuanganKu" width={160} height={80} className="object-contain grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100" />
                <div className="w-px h-16 bg-slate-200" />
                <Image src="/images/logogeocitra.png" alt="Logo Geocitra" width={180} height={180} className="object-contain" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-6">
                Professional Consulting
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
                Membangun Kepercayaan Klien <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-700 to-cyan-600">
                  Melalui Pendekatan Berbasis Data
                </span>
              </h2>
              <div className="space-y-4 text-slate-600 text-lg leading-relaxed">
                <p>
                  <strong className="text-slate-900">KeuanganKu</strong> adalah alat bantu konsultasi yang dirancang khusus untuk agen asuransi profesional lintas perusahaan.
                </p>
                <p>
                  Aplikasi ini membantu Anda beralih dari <strong>selling</strong> ke <strong>consulting</strong>, membuat diskusi asuransi menjadi kebutuhan logis bagi klien.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURES GRID */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Fitur Utama Pro-Agent</h2>
            <p className="text-slate-600 text-lg">
              Senjata utama untuk memenangkan hati klien dengan data yang bicara.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<GraduationCap className="w-6 h-6 text-white" />}
              color="bg-blue-600" // Classic Blue
              title="Kalkulator Dana Pendidikan"
              desc="Simulasi biaya sekolah anak masa depan yang membantu klien melihat gap dana yang harus dilindungi."
            />
            <FeatureCard
              icon={<Umbrella className="w-6 h-6 text-white" />}
              color="bg-indigo-600" // Deep Blue
              title="Analisa Dana Hari Tua"
              desc="Tunjukkan konsekuensi risiko jika klien tidak memulai proteksi dan investasi hari ini."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-white" />}
              color="bg-sky-600" // Light Blue
              title="Simulasi Kebutuhan Proteksi"
              desc="Hitung Uang Pertanggungan ideal berdasarkan data pengeluaran riil klien."
            />
            <FeatureCard
              icon={<LineChart className="w-6 h-6 text-white" />}
              color="bg-slate-700" // Neutral Dark
              title="Grafik Arus Kas Klien"
              desc="Identifikasi 'kebocoran' keuangan klien secara visual untuk mempermudah alokasi premi."
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6 text-white" />}
              color="bg-cyan-600" // Cyan Accents
              title="Roadmap Tujuan Keuangan"
              desc="Bantu klien merencanakan pembelian aset dengan pendampingan asuransi sebagai pengaman."
            />
            <FeatureCard
              icon={<Activity className="w-6 h-6 text-white" />}
              color="bg-teal-600" // Teal for Health/Balance
              title="Dashboard Multi-Agent"
              desc="Kelola ringkasan diskusi keuangan banyak klien sekaligus dalam satu genggaman tablet."
            />
          </div>
        </div>
      </section>

      {/* 6. SUPPORT */}
      <section id="info" className="relative py-24 overflow-hidden bg-slate-900 text-white">

        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-150 h-150 bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-100 h-100 bg-cyan-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-semibold mb-6">
                <Building2 className="w-4 h-4" /> Professional Partnership
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ingin Bergabung Sebagai Early Adopter?</h2>
              <p className="text-slate-300 text-lg mb-10 leading-relaxed">
                Kami sedang melakukan uji coba terbatas untuk 30 agen aktif. Jadilah bagian dari transformasi agen berbasis data.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-900/50"><Mail className="w-6 h-6 text-white" /></div>
                  <div>
                    <h4 className="font-bold text-lg text-white">Kemitraan Strategis</h4>
                    <p className="text-blue-200">admin@geocitra.id</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white text-slate-900 p-8 rounded-3xl shadow-2xl shadow-blue-900/20 border border-white/10">
              <h3 className="text-2xl font-bold mb-6 text-slate-900">Keunggulan Pro-Agent</h3>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  <span className="text-slate-700 font-medium">Visualisasi Risiko yang Tidak Abstrak </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  <span className="text-slate-700 font-medium">Bebas Hafalan Skrip </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  <span className="text-slate-700 font-medium">Fleksibel Lintas Perusahaan Asuransi </span>
                </li>
              </ul>
              <div className="pt-6 border-t border-slate-100 text-center">
                <Link href="/login" className="block">
                  <Button size="lg" className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-xl h-12 font-bold shadow-lg shadow-blue-600/20">
                    Login Dashboard Pro-Agent
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Image src="/images/logogeocitra.png" alt="Logo Geocitra" width={100} height={100} className="object-contain grayscale opacity-60 hover:opacity-100 transition-opacity" />
            <span className="font-semibold text-slate-400 text-sm italic">"Financial Conversation Tools"</span>
          </div>
          <p className="text-xs text-slate-400 text-center md:text-right">
            © {new Date().getFullYear()} Geocitra x Maxipro. All Rights Reserved. <br />
            Powered by Larman Analysis Methodology.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, color, title, desc }: { icon: React.ReactNode, color: string, title: string, desc: string }) {
  return (
    <Card className="group border border-slate-200 shadow-sm hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300 hover:-translate-y-1 bg-white p-6 rounded-2xl h-full flex flex-col">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-md mb-5 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm grow">
        {desc}
      </p>
    </Card>
  );
}