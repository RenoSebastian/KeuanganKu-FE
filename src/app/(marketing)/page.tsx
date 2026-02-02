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
  Activity,
  CheckCircle2,
  Lock,
  LineChart,
  Phone,
  Mail,
  Building2,
  HelpCircle,
  Notebook,
  Banknote
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-white">

      {/* 1. NAVBAR (Sticky & Glassmorphism) */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">

          {/* LOGO + SLOGAN */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-32 h-12">
              <Image
                src="/images/logokeuanganku.png"
                alt="Logo KeuanganKu"
                fill
                className="object-contain"
              />
            </div>

            <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase mt-0.5 text-center">
              Sistem Kesehatan Finansial
            </span>
          </div>

          {/* BUTTON */}
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="primary"
                className="rounded-full px-6 shadow-lg shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 border-none"
              >
                Login Aplikasi
              </Button>
            </Link>
          </div>

        </div>
      </nav>

      {/* 2. HERO SECTION (Immersive Background) */}
      <section className="relative pt-24 pb-40 lg:pt-32 lg:pb-60 overflow-hidden">
        {/* Background Image Full Cover */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/bg1.png"
            alt="Background Office"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Overlay Gradient: Agar teks tetap terbaca jelas di atas gambar */}
          <div className="absolute inset-0 bg-linear-to-r from-white/45 via-white/25 to-transparent"></div>
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/15 to-white"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-100 text-blue-700 text-sm font-bold mb-8 shadow-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-25"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
              </span>
              Portal Resmi Karyawan MAXIPRO
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-[1.15] drop-shadow-sm">
              Kelola Keuangan, <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-700 to-cyan-600">
                Wujudkan Sejahtera.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-700 mb-10 leading-relaxed font-medium">
              Platform internal yang didedikasikan untuk membantu keluarga besar MAXIPRO merencanakan masa depan finansial yang lebih aman, terukur, dan bahagia.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-blue-700 hover:bg-blue-800 shadow-xl shadow-blue-700/30 border-none transition-transform hover:scale-105">
                  Mulai Checkup Sekarang <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#info">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-white/80 backdrop-blur-sm border-slate-300 hover:bg-white text-slate-700">
                  <HelpCircle className="mr-2 w-5 h-5" /> Pusat Bantuan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VALUE PROPOSITION (Floating Cards) */}
      <section className="relative z-20 -mt-24 pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                <Activity className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Checkup Rutin</h3>
              <p className="text-slate-500">Pantau skor kesehatan finansial Anda setiap bulan secara otomatis.</p>
            </div>
            {/* Card 2 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform relative overflow-hidden">
              <div className="absolute top-0 w-full h-1 bg-linear-to-r from-blue-500 to-cyan-500"></div>
              <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center mb-6 text-cyan-600">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Data Terproteksi</h3>
              <p className="text-slate-500">Privasi adalah prioritas. Data Anda dienkripsi tingkat enterprise.</p>
            </div>
            {/* Card 3 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Simulasi Cerdas</h3>
              <p className="text-slate-500">Hitung dana pensiun & pendidikan anak dengan akurasi tinggi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ABOUT SECTION */}
      <section className="relative py-28 bg-linear-to-b from-white via-slate-50 to-white overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-24 w-96 h-96 bg-cyan-100/40 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* LEFT: LOGO PARTNER */}
            {/* LEFT: PARTNER LOGOS */}
            <div className="flex flex-col items-center lg:items-start gap-10">

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-widest uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-30"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                Powered By
              </div>


              <div className="flex items-center gap-8 bg-white rounded-3xl px-10 py-8 shadow-xl shadow-slate-200/60 border border-slate-100">

                {/* MAXIPRO */}
                <div className="flex items-center justify-center">
                  <Image
                    src="/images/maxipro.webp"
                    alt="Logo MAXIPRO"
                    width={180}
                    height={90}
                    className="object-contain"
                  />
                </div>

                {/* Divider */}
                <div className="w-px h-16 bg-slate-200" />

                {/* GEOCITRA */}
                <div className="flex items-center justify-center">
                  <Image
                    src="/images/logogeocitra.png"
                    alt="Logo Geocitra"
                    width={120}
                    height={120}
                    className="object-contain"
                  />
                </div>

              </div>
            </div>


            {/* RIGHT: ABOUT TEXT */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-6">
                Tentang Kami
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
                Membangun Kesejahteraan Finansial <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-700 to-cyan-600">
                  Karyawan Secara Berkelanjutan
                </span>
              </h2>

              <div className="space-y-4 text-slate-600 text-lg leading-relaxed">
                <p>
                  <strong className="text-slate-800">KeuanganKu</strong> adalah aplikasi perencanaan
                  keuangan yang dirancang untuk membantu karyawan memahami kondisi keuangan
                  pribadinya, mengelola arus kas bulanan secara sehat, serta menyusun tujuan
                  keuangan jangka pendek, menengah, dan panjang.
                </p>

                <p>
                  Aplikasi ini hadir untuk meningkatkan literasi dan kesejahteraan finansial
                  karyawan sekaligus mendukung program{" "}
                  <strong>Employee Wellbeing</strong> perusahaan melalui edukasi keuangan yang
                  berkelanjutan, terukur, dan mudah diakses.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>



      {/* 4. FEATURES GRID (Clean & Professional) */}
      <section id="features" className="py-24 bg-slate-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Fitur Andalan</h2>
            <p className="text-slate-600 text-lg">
              Dirancang khusus untuk memenuhi kebutuhan perencanaan keuangan keluarga besar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<GraduationCap className="w-6 h-6 text-white" />}
              color="bg-blue-600"
              title="Rancang Dana Pendidikan Anak"
              desc="Simulasi biaya sekolah anak dari TK hingga Kuliah dengan memperhitungkan inflasi tahunan."
            />
            <FeatureCard
              icon={<Umbrella className="w-6 h-6 text-white" />}
              color="bg-indigo-600"
              title="Rancang Dana Hari Tua"
              desc="Pastikan masa purna tugas Anda tetap sejahtera dengan perhitungan Replacement Ratio yang tepat."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-white" />}
              color="bg-rose-600"
              title="Rancang Proteksi"
              desc="Hitung kebutuhan Uang Pertanggungan (UP) Jiwa yang ideal untuk melindungi keluarga tercinta."
            />
            <FeatureCard
              icon={<Wallet className="w-6 h-6 text-white" />}
              color="bg-slate-800"
              title="Atur Anggaran Bulanan"
              desc="Panduan alokasi gaji bulanan."
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6 text-white" />}
              color="bg-amber-500"
              title="Rancang Tujuan Lainnya"
              desc="Rencanakan pembelian rumah, kendaraan, atau ibadah haji dengan roadmap tabungan yang terukur."
            />
            <FeatureCard
              icon={<Banknote className="w-6 h-6 text-white" />}
              color="bg-emerald-600"
              title="Analisa Keuangan Pribadi"
              desc="Diagnosa kesehatan finansial Anda secara menyeluruh dengan standar perencana keuangan profesional"
            />
          </div>
        </div>
      </section>

      {/* 5. CONTACT & SUPPORT (Replacing the old CTA) */}
      <section id="info" className="relative py-24 overflow-hidden bg-slate-900 text-white">
        {/* Background Image Darkened */}
        <div className="absolute inset-0 z-0 opacity-20">
          <Image
            src="/images/bg2.png"
            alt="Office Background"
            fill
            className="object-cover"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Contact Info */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-semibold mb-6">
                <Building2 className="w-4 h-4" /> Internal Division
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Butuh Bantuan Akses?</h2>
              <p className="text-slate-300 text-lg mb-10 leading-relaxed">
                Jika Anda mengalami kendala saat login atau memiliki pertanyaan terkait fitur aplikasi KeuanganKu, silakan hubungi tim Human Capital (HC) atau IT Support kami.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="bg-blue-600 p-3 rounded-xl">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Hotline HC</h4>
                    <p className="text-slate-400">Ext. 1234 (Senin - Jumat, 08:00 - 16:00)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="bg-blue-600 p-3 rounded-xl">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Email Support</h4>
                    <p className="text-slate-400">hc.support@maxipro.co.id</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quick Links / About */}
            <div className="bg-white text-slate-900 p-8 rounded-3xl shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">Tentang Aplikasi</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                <strong className="text-blue-700">Sistem KeuanganKu</strong> adalah inisiatif strategis untuk meningkatkan literasi dan kesejahteraan finansial seluruh karyawan.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-slate-700 font-medium">100% Gratis untuk Karyawan</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-slate-700 font-medium">Kalkulasi Standar Perencana Keuangan</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-slate-700 font-medium">Rahasia & Aman</span>
                </li>
              </ul>

              <div className="pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500 mb-4">Sudah punya akun pegawai?</p>
                <Link href="/login" className="block">
                  <Button size="lg" className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl h-12">
                    Login ke Dashboard
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
          <div className="flex items-center gap-2 grayscale opacity-70">
            <Image
              src="/images/logogeocitra.png"
              alt="Logo Geocitra"
              width={128}
              height={128}
              className="object-contain"
            />
            <span className="font-semibold text-slate-700 text-sm">Keuanganku Sistem Kesehatan Finansial </span>
          </div>
          <p className="text-xs text-slate-400 text-center md:text-right">
            © {new Date().getFullYear()} Geocitra. Hak Cipta Dilindungi Undang-Undang. <br />
            Untuk Kalangan Sendiri (Internal Use Only).
          </p>
        </div>
      </footer>
    </div>
  );
}

// Sub-component untuk Card Fitur
function FeatureCard({ icon, color, title, desc }: { icon: React.ReactNode, color: string, title: string, desc: string }) {
  return (
    <Card className="group border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white p-6 rounded-2xl h-full flex flex-col">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-md mb-5 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm grow">
        {desc}
      </p>
    </Card>
  );
}