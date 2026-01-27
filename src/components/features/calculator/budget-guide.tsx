import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Wallet, PieChart, ShieldCheck } from "lucide-react";

export function BudgetGuide() {
  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50 dark:bg-blue-900/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <Info className="h-5 w-5" />
          <CardTitle className="text-base font-semibold">
            Panduan: Smart Budgeting
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          
          {/* STEP 1: KONSEP */}
          <AccordionItem value="item-1" className="border-b-blue-200">
            <AccordionTrigger className="text-sm font-medium hover:text-blue-600">
              Apa itu Smart Budgeting?
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
              Sistem ini menggunakan rumus modifikasi <strong>20/15/10/10/45</strong> untuk membagi gaji Anda secara otomatis ke pos-pos ideal, sehingga tidak ada uang yang "bocor" untuk hal yang tidak perlu.
            </AccordionContent>
          </AccordionItem>

          {/* STEP 2: PEMASUKAN */}
          <AccordionItem value="item-2" className="border-b-blue-200">
            <AccordionTrigger className="text-sm font-medium hover:text-blue-600 flex gap-2">
               <Wallet className="h-4 w-4 text-blue-500" />
               Jenis Pemasukan
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Tetap (Gaji):</strong> Penghasilan rutin bulanan yang pasti diterima (Take Home Pay).
              </p>
              <p>
                <strong>Tidak Tetap:</strong> Bonus, Tunjangan tidak tetap, atau hasil sampingan (Freelance).
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* STEP 3: RUMUS ALOKASI */}
          <AccordionItem value="item-3" className="border-b-blue-200">
            <AccordionTrigger className="text-sm font-medium hover:text-blue-600 flex gap-2">
              <PieChart className="h-4 w-4 text-amber-500" />
              Rumus Pembagian (Otomatis)
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3">
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>45% Kebutuhan Hidup:</strong> Makan, Transport, Listrik, Kuota.</li>
                <li><strong>35% Cicilan:</strong> Maksimal 20% untuk Hutang Produktif (KPR) & 15% Hutang Konsumtif.</li>
                <li><strong>10% Masa Depan:</strong> Tabungan & Investasi.</li>
                <li><strong>10% Proteksi:</strong> Asuransi Jiwa & Kesehatan.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* STEP 4: OUTPUT */}
          <AccordionItem value="item-4" className="border-none">
             <AccordionTrigger className="text-sm font-medium hover:text-blue-600 flex gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Arti "Safe to Spend"
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Ini adalah batas aman uang yang boleh Anda habiskan untuk biaya hidup dan gaya hidup bulan ini.
              </p>
              <p className="text-xs italic bg-white p-2 rounded border border-blue-100">
                "Jika pengeluaran Anda melebihi angka ini, berarti Anda mengambil jatah tabungan masa depan Anda."
              </p>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </CardContent>
    </Card>
  );
}