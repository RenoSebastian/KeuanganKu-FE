import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Clock, Coins, TrendingUp, Target } from "lucide-react";

export function PensionGuide() {
  return (
    <Card className="mb-6 border-indigo-200 bg-indigo-50/50 dark:bg-indigo-900/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
          <Info className="h-5 w-5" />
          <CardTitle className="text-base font-semibold">
            Panduan: Merancang Dana Pensiun
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          
          {/* STEP 1: KONSEP */}
          <AccordionItem value="item-1" className="border-b-indigo-200">
            <AccordionTrigger className="text-sm font-medium hover:text-indigo-600">
              Mengapa harus dihitung sekarang?
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
              Saat pensiun, gaji bulanan berhenti namun biaya hidup jalan terus (bahkan naik karena inflasi). 
              Simulasi ini menghitung berapa <strong>"Gunung Emas" (Corpus)</strong> yang harus Anda kumpulkan 
              agar bisa hidup nyaman tanpa bekerja lagi.
            </AccordionContent>
          </AccordionItem>

          {/* STEP 2: WAKTU */}
          <AccordionItem value="item-2" className="border-b-indigo-200">
            <AccordionTrigger className="text-sm font-medium hover:text-indigo-600 flex gap-2">
               <Clock className="h-4 w-4 text-indigo-500" />
               Langkah 1: Tentukan Waktu
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Usia Kini vs Pensiun:</strong> Menentukan berapa lama waktu yang Anda miliki untuk menabung (Masa Akumulasi).
              </p>
              <p>
                <strong>Lama Pensiun:</strong> Estimasi berapa lama Anda akan menikmati dana tersebut. 
                <br/><span className="text-xs italic text-slate-500">Contoh: Pensiun usia 55, harapan hidup sampai 75 = Lama Pensiun 20 Tahun.</span>
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* STEP 3: NOMINAL */}
          <AccordionItem value="item-3" className="border-b-indigo-200">
            <AccordionTrigger className="text-sm font-medium hover:text-indigo-600 flex gap-2">
              <Coins className="h-4 w-4 text-emerald-500" />
              Langkah 2: Gaya Hidup & Modal
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <div className="grid gap-2 pl-2 border-l-2 border-emerald-200">
                <div>
                  <span className="font-semibold text-foreground">Target Pemasukan Bulanan:</span>
                  <br/>Biaya hidup bulanan yang Anda inginkan saat tua nanti (dalam nilai uang hari ini).
                </div>
                <div>
                  <span className="font-semibold text-foreground">Saldo Awal:</span>
                  <br/>Total JHT (BPJS Ketenagakerjaan), DPLK, atau tabungan pensiun yang sudah terkumpul saat ini.
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* STEP 4: HASIL */}
          <AccordionItem value="item-4" className="border-none">
             <AccordionTrigger className="text-sm font-medium hover:text-indigo-600 flex gap-2">
              <Target className="h-4 w-4 text-orange-500" />
              Cara Membaca Hasil
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Target Dana:</strong> Total uang tunai yang wajib tersedia di rekening saat hari pertama Anda pensiun.
              </p>
              <p>
                <strong>Investasi Bulanan (Kekurangan):</strong> Berapa yang harus Anda sisihkan mulai bulan ini agar target tersebut tercapai.
              </p>
              <p className="text-xs bg-white p-2 rounded border border-indigo-100 mt-2">
                <TrendingUp className="w-3 h-3 inline mr-1"/>
                Sistem otomatis memperhitungkan <strong>Inflasi</strong> (kenaikan harga) dan <strong>Bunga Berbunga</strong> investasi.
              </p>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </CardContent>
    </Card>
  );
}