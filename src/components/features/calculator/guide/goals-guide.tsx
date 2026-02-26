import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Target, TrendingUp, CalendarClock, Sparkles } from "lucide-react";

export function GoalsGuide() {
  return (
    <Card className="mb-6 border-violet-200 bg-violet-50/50 dark:bg-violet-900/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
          <Info className="h-5 w-5" />
          <CardTitle className="text-base font-semibold">
            Panduan: Wujudkan Mimpi Finansial
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          
          {/* STEP 1: KONSEP DASAR */}
          <AccordionItem value="item-1" className="border-b-violet-200">
            <AccordionTrigger className="text-sm font-medium hover:text-violet-600">
              Mengapa harga masa depan berbeda?
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
              Biaya naik Haji, Pesta Pernikahan, atau Traveling cenderung <strong>naik setiap tahun (Inflasi)</strong>. 
              Simulasi ini membantu Anda menghitung berapa biaya aslinya nanti, dan berapa yang harus ditabung mulai sekarang agar uangnya cukup saat waktunya tiba.
            </AccordionContent>
          </AccordionItem>

          {/* STEP 2: PILIH & ISI */}
          <AccordionItem value="item-2" className="border-b-violet-200">
            <AccordionTrigger className="text-sm font-medium hover:text-violet-600 flex gap-2">
               <Target className="h-4 w-4 text-violet-500" />
               Langkah 1: Tentukan Target
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Pilih Kategori:</strong> Ibadah, Liburan, Pernikahan, atau Barang Impian (Gadget/Hobi).
              </p>
              <p>
                <strong>Biaya Saat Ini:</strong> Masukkan harga barang/jasa tersebut <strong>jika Anda membelinya HARI INI</strong>. Jangan pusing memikirkan harga nanti, biar sistem yang menghitung.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* STEP 3: ASUMSI */}
          <AccordionItem value="item-3" className="border-b-violet-200">
            <AccordionTrigger className="text-sm font-medium hover:text-violet-600 flex gap-2">
              <TrendingUp className="h-4 w-4 text-rose-500" />
              Langkah 2: Inflasi vs Investasi
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <div className="grid gap-2 pl-2 border-l-2 border-rose-200">
                <div>
                  <span className="font-semibold text-foreground">Asumsi Inflasi:</span>
                  <br/>Prediksi kenaikan harga barang per tahun. <br/><em>(Tips: Biaya Pendidikan & Kesehatan biasanya naik 10-15%/tahun).</em>
                </div>
                <div>
                  <span className="font-semibold text-foreground">Return Investasi:</span>
                  <br/>Bunga/imbal hasil tempat Anda menabung. Agar target cepat tercapai, pastikan <strong>Return Investasi {'>'} Inflasi</strong>.
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* STEP 4: HASIL */}
          <AccordionItem value="item-4" className="border-none">
             <AccordionTrigger className="text-sm font-medium hover:text-violet-600 flex gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Cara Membaca Hasil
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Estimasi Masa Depan:</strong> Total uang yang harus terkumpul di akhir periode (sudah termasuk kenaikan harga).
              </p>
              <p>
                <strong>Rekomendasi Setoran:</strong> Nominal yang wajib Anda sisihkan tiap bulan ke instrumen investasi agar mimpi tersebut lunas tepat waktu.
              </p>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </CardContent>
    </Card>
  );
}