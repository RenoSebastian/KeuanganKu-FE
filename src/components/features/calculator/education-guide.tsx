import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, GraduationCap, TrendingUp, CalendarClock } from "lucide-react";

export function EducationGuide() {
  return (
    <Card className="mb-6 border-cyan-200 bg-cyan-50/50 dark:bg-cyan-900/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
          <Info className="h-5 w-5" />
          <CardTitle className="text-base font-semibold">
            Panduan: Strategi Dana Pendidikan
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          
          {/* STEP 1: KONSEP INFLASI */}
          <AccordionItem value="item-1" className="border-b-cyan-200">
            <AccordionTrigger className="text-sm font-medium hover:text-cyan-600">
              Mengapa biayanya jadi sangat besar?
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
              Biaya pendidikan di Indonesia rata-rata naik <strong>10% - 15% per tahun</strong> (jauh di atas kenaikan gaji). 
              Simulasi ini menghitung "Uang Pangkal Masa Depan" agar Anda tidak kaget saat anak mendaftar sekolah nanti.
            </AccordionContent>
          </AccordionItem>

          {/* STEP 2: LOGIKA HITUNGAN */}
          <AccordionItem value="item-2" className="border-b-cyan-200">
            <AccordionTrigger className="text-sm font-medium hover:text-cyan-600 flex gap-2">
               <CalendarClock className="h-4 w-4 text-cyan-500" />
               Kapan dana dikumpulkan?
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Sistem menggunakan metode <strong>Sinking Fund</strong>.
              </p>
              <div className="grid gap-2 pl-2 border-l-2 border-cyan-200 text-xs">
                <div>
                  <strong>Mulai:</strong> Hari ini (saat Anda membuat rencana).
                </div>
                <div>
                  <strong>Selesai:</strong> Saat anak mencapai usia masuk jenjang tersebut (Misal: SD di usia 6 tahun).
                </div>
              </div>
              <p className="mt-1">
                Semakin dini Anda mulai, semakin ringan cicilan tabungan per bulannya.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* STEP 3: INPUT */}
          <AccordionItem value="item-3" className="border-b-cyan-200">
            <AccordionTrigger className="text-sm font-medium hover:text-cyan-600 flex gap-2">
              <GraduationCap className="h-4 w-4 text-blue-500" />
              Data apa yang harus diisi?
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Cukup masukkan <strong>Biaya Saat Ini (Harga Sekarang)</strong>. Jangan pusing memikirkan harga nanti.
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Uang Pangkal (Entry Fee):</strong> Biaya gedung, seragam, & pendaftaran awal.</li>
                <li><strong>SPP Bulanan:</strong> Biaya operasional bulanan (opsional, jika ingin ditanggung juga).</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* STEP 4: SLIDER */}
          <AccordionItem value="item-4" className="border-none">
             <AccordionTrigger className="text-sm font-medium hover:text-cyan-600 flex gap-2">
              <TrendingUp className="h-4 w-4 text-rose-500" />
              Pengaruh Inflasi & Investasi
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Gunakan panel di sebelah kanan (Parameter Ekonomi) untuk melihat skenario berbeda.
              </p>
              <p className="text-xs italic bg-white p-2 rounded border border-cyan-100">
                Tips: Pastikan <strong>Return Investasi {'>'} Inflasi Pendidikan</strong> agar nilai uang Anda tidak tergerus.
              </p>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </CardContent>
    </Card>
  );
}