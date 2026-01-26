"use client"; // <--- Wajib deklarasi ini untuk interaktivitas

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <Button 
      variant="outline" 
      className="bg-white text-blue-950 border-white/20 hover:bg-blue-50 shadow-lg font-medium transition-all active:scale-95"
      onClick={() => {
        // Logika Browser: Memicu dialog print bawaan
        if (typeof window !== "undefined") {
          window.print();
        }
      }}
    >
      <Printer className="w-4 h-4 mr-2" /> Cetak Laporan
    </Button>
  );
}