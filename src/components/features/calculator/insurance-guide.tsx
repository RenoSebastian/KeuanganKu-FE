import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, ShieldCheck, Banknote, AlertTriangle } from "lucide-react";

export function InsuranceGuide() {
  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50 dark:bg-blue-900/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <Info className="h-5 w-5" />
          <CardTitle className="text-base font-semibold">
            Panduan Pengisian: Kalkulator Proteksi Jiwa
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          
          {/* STEP 1: LOGIKA DASAR */}
          <AccordionItem value="item-1" className="border-b-blue-200">
            <AccordionTrigger className="text-sm font-medium hover:text-blue-600">
              Mengapa saya butuh simulasi ini?
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
              Kalkulator ini menggunakan metode <strong>Income Replacement</strong>. 
              Tujuannya menghitung berapa uang tunai (Uang Pertanggungan) yang 
              harus cair jika pencari nafkah meninggal dunia, agar keluarga:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Bisa langsung <strong>melunasi semua hutang</strong> (KPR, Kendaraan, dll).</li>
                <li>Tetap mendapatkan <strong>"gaji bulanan"</strong> dari hasil investasi uang pertanggungan tersebut.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* STEP 2: KOLOM HUTANG */}
          <AccordionItem value="item-2" className="border-b-blue-200">
            <AccordionTrigger className="text-sm font-medium hover:text-blue-600 flex gap-2">
               <AlertTriangle className="h-4 w-4 text-orange-500" />
               Bagian A: Data Kewajiban (Hutang)
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3">
              <p>Masukkan <strong>SISA POKOK HUTANG</strong> yang berjalan saat ini:</p>
              <div className="grid gap-2 pl-2 border-l-2 border-blue-200">
                <div>
                  <span className="font-semibold text-foreground">Sisa KPR & KPM:</span>
                  <br/>Masukkan sisa plafon rumah & kendaraan. Asuransi harus menutup ini agar aset tidak disita bank.
                </div>
                <div>
                  <span className="font-semibold text-foreground">Hutang Lainnya:</span>
                  <br/>Kartu Kredit, Paylater, atau Pinjaman Usaha. Jangan wariskan beban cicilan ke keluarga.
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* STEP 3: KOLOM PENGHASILAN */}
          <AccordionItem value="item-3" className="border-b-blue-200">
            <AccordionTrigger className="text-sm font-medium hover:text-blue-600 flex gap-2">
              <Banknote className="h-4 w-4 text-green-500" />
              Bagian B: Dana Kehidupan Keluarga
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3">
              <div className="grid gap-2 pl-2 border-l-2 border-green-200">
                <div>
                  <span className="font-semibold text-foreground">Penghasilan Tahunan:</span>
                  <br/>Total Gaji x 12 + THR + Bonus. Ini adalah standar hidup yang ingin dipertahankan untuk keluarga.
                </div>
                <div>
                  <span className="font-semibold text-foreground">Durasi Proteksi (Tahun):</span>
                  <br/>Berapa lama dana ini dibutuhkan? <br/>
                  <em>Contoh: Anak bungsu usia 5 th, mandiri usia 22 th. Maka durasi = 17 Tahun.</em>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* STEP 4: HASIL */}
          <AccordionItem value="item-4" className="border-none">
             <AccordionTrigger className="text-sm font-medium hover:text-blue-600 flex gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              Cara Membaca Hasil (Output)
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Total Fund Needed:</strong> Total Uang Pertanggungan (UP) ideal yang harus tertera di polis Anda.
              </p>
              <p>
                <strong>Shortfall (Gap):</strong> Kekurangan proteksi Anda saat ini. Jika angkanya positif, segera 
                tambah polis asuransi senilai angka tersebut.
              </p>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </CardContent>
    </Card>
  );
}