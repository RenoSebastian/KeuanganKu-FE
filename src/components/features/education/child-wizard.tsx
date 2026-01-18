"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChildProfile, PlanInput } from "@/lib/types";
import { STAGES_DB, calculateAge } from "@/lib/financial-math";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, GraduationCap, AlertCircle } from "lucide-react";

// Helper generate ID
const generateId = () => Math.random().toString(36).substr(2, 9);

interface ChildWizardProps {
  onSave: (data: ChildProfile) => void;
  onCancel: () => void;
}

export function ChildWizard({ onSave, onCancel }: ChildWizardProps) {
  const [step, setStep] = useState(1);
  
  // Step 1: Profile
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"L" | "P">("L");

  // Step 2: Select Stages & Start Grade
  const [selectedStageIds, setSelectedStageIds] = useState<string[]>([]);
  const [startGrades, setStartGrades] = useState<Record<string, number>>({});

  // Step 3: Input Costs
  const [costs, setCosts] = useState<Record<string, { entry: number; monthly: number }>>({});

  // --- LOGIC VALIDASI UMUR (Max 21 Tahun) ---
  const today = new Date();
  const minDate = new Date(today.getFullYear() - 21, today.getMonth(), today.getDate()).toISOString().split('T')[0];
  const maxDate = new Date().toISOString().split('T')[0]; // Tidak boleh lahir di masa depan

  // --- HANDLERS ---
  const handleToggleStage = (id: string) => {
    if (selectedStageIds.includes(id)) {
      setSelectedStageIds(prev => prev.filter(s => s !== id));
      // Cleanup
      const newCosts = { ...costs };
      delete newCosts[id];
      setCosts(newCosts);
      
      const newGrades = { ...startGrades };
      delete newGrades[id];
      setStartGrades(newGrades);
    } else {
      setSelectedStageIds(prev => [...prev, id]);
      // Init default values
      setCosts(prev => ({ ...prev, [id]: { entry: 0, monthly: 0 } }));
      setStartGrades(prev => ({ ...prev, [id]: 1 })); // Default kelas 1
    }
  };

  const handleGradeChange = (id: string, grade: number) => {
    setStartGrades(prev => ({ ...prev, [id]: grade }));
    
    // Auto reset entry fee if grade > 1 (Asumsi pindahan/lanjutan tidak bayar pangkal penuh/sudah lunas)
    if (grade > 1) {
      setCosts(prev => ({
        ...prev,
        [id]: { ...prev[id], entry: 0 }
      }));
    }
  };

  const handleCostChange = (id: string, field: 'entry' | 'monthly', value: string) => {
    const numVal = parseInt(value.replace(/\./g, "")) || 0;
    setCosts(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: numVal }
    }));
  };

  const handleFinish = () => {
    const plans: PlanInput[] = selectedStageIds.map(id => ({
      stageId: id,
      startGrade: startGrades[id] || 1, // Include startGrade
      costNow: {
        entryFee: costs[id]?.entry || 0,
        monthlyFee: costs[id]?.monthly || 0
      }
    }));

    const newChild: ChildProfile = {
      id: generateId(),
      name,
      dob,
      gender,
      avatarColor: gender === "L" ? "blue" : "pink",
      plans
    };

    onSave(newChild);
  };

  // Helper Format input
  const formatNum = (n: number) => n?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") || "";

  // Helper untuk Generate Opsi Dropdown (TK A/B, Semester 1-8)
  const getGradeOptions = (stage: typeof STAGES_DB[0]) => {
    // 1. Jika Semester (Kuliah/S2), loop Duration x 2 (4 thn -> 8 semester)
    const count = stage.paymentFrequency === "SEMESTER" ? stage.duration * 2 : stage.duration;
    
    return Array.from({ length: count }, (_, i) => {
      const val = i + 1;
      let label = "";
      
      if (stage.id === "TK") {
        label = val === 1 ? "TK A" : "TK B";
      } else if (stage.paymentFrequency === "SEMESTER") {
        label = `Semester ${val}`;
      } else {
        label = `Kelas ${val}`;
      }
      
      return { val, label };
    });
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER WIZARD */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center">
             <div className={cn(
               "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
               step >= s ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
             )}>
               {s}
             </div>
             {s < 3 && <div className={cn("w-8 h-1 mx-1", step > s ? "bg-blue-600" : "bg-slate-200")} />}
          </div>
        ))}
      </div>

      {/* --- STEP 1: PROFIL --- */}
      {step === 1 && (
        <div className="space-y-4 animate-in slide-in-from-right-4">
          <h3 className="text-xl font-bold text-center text-slate-800">Data Diri Anak</h3>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 ml-1">Nama Anak</label>
            <Input 
              placeholder="Contoh: Budi Kecil" 
              value={name} onChange={e => setName(e.target.value)} 
              className="h-12 text-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className="text-xs font-bold text-slate-600 ml-1">Tanggal Lahir</label>
               <Input 
                 type="date" 
                 value={dob} 
                 onChange={e => setDob(e.target.value)} 
                 className="h-12"
                 min={minDate} // Validasi Umur Max 21
                 max={maxDate}
               />
               <p className="text-[10px] text-slate-400 ml-1">Maksimal usia 21 tahun.</p>
             </div>
             <div className="space-y-1">
               <label className="text-xs font-bold text-slate-600 ml-1">Jenis Kelamin</label>
               <select 
                 className="w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                 value={gender} onChange={e => setGender(e.target.value as "L" | "P")}
               >
                 <option value="L">Laki-laki</option>
                 <option value="P">Perempuan</option>
               </select>
             </div>
          </div>
        </div>
      )}

      {/* --- STEP 2: PILIH JENJANG & KELAS --- */}
      {step === 2 && (
        <div className="space-y-4 animate-in slide-in-from-right-4">
          <h3 className="text-xl font-bold text-center text-slate-800">Pilih Jenjang & Kelas Mulai</h3>
          <p className="text-center text-xs text-slate-500 -mt-2 mb-4">
            Centang jenjang dan tentukan mulai dari kelas berapa.
          </p>

          <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-1">
            {STAGES_DB.map((stage) => {
              const age = calculateAge(dob);
              // Validasi Usia: Jika umur anak > (Usia Masuk + Durasi), berarti sudah lewat.
              const isTotallyPassed = age > (stage.entryAge + stage.duration);
              
              const isSelected = selectedStageIds.includes(stage.id);
              const currentGrade = startGrades[stage.id] || 1;
              const options = getGradeOptions(stage); // Generate Options (TK A/B, Smt 1-8)

              return (
                <div 
                  key={stage.id}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all",
                    isTotallyPassed ? "opacity-50 grayscale bg-slate-50" : 
                    isSelected ? "border-blue-500 bg-blue-50/50" : "border-slate-100 hover:border-blue-200 bg-white"
                  )}
                >
                   <div className="flex items-start justify-between cursor-pointer" onClick={() => !isTotallyPassed && handleToggleStage(stage.id)}>
                       <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm", isSelected ? "text-blue-600" : "text-slate-400")}>
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800">{stage.label}</h4>
                            <p className="text-xs text-slate-500">Estimasi masuk usia {stage.entryAge} tahun</p>
                          </div>
                       </div>
                       
                       <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0", isSelected ? "bg-blue-600 border-blue-600" : "border-slate-300")}>
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                       </div>
                   </div>

                   {/* Dropdown Kelas (Muncul jika selected) */}
                   {isSelected && !isTotallyPassed && (
                     <div className="mt-3 pt-3 border-t border-blue-100 flex items-center justify-between animate-in slide-in-from-top-2">
                        <span className="text-xs font-bold text-slate-600">Mulai dari:</span>
                        <select 
                          className="h-8 rounded-md border-blue-200 bg-white text-xs font-bold text-blue-700 px-2 focus:ring-2 focus:ring-blue-500 outline-none"
                          value={currentGrade}
                          onChange={(e) => handleGradeChange(stage.id, parseInt(e.target.value))}
                        >
                          {options.map((opt) => (
                            <option key={opt.val} value={opt.val}>{opt.label}</option>
                          ))}
                        </select>
                     </div>
                   )}

                   {isTotallyPassed && (
                     <span className="absolute right-4 top-2 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Lewat Usia</span>
                   )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- STEP 3: INPUT BIAYA --- */}
      {step === 3 && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <h3 className="text-xl font-bold text-center text-slate-800">Estimasi Biaya Saat Ini</h3>
          <p className="text-center text-xs text-slate-500 -mt-2">
            Masukkan biaya sesuai tarif <b>tahun ini</b>.
          </p>

          <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4">
             {selectedStageIds.map((id) => {
               const stage = STAGES_DB.find(s => s.id === id);
               const currentGrade = startGrades[id] || 1;
               const isEntryFeeDisabled = currentGrade > 1; // Jika bukan kelas 1, uang pangkal disable

               // Label Dinamis
               const monthlyLabel = stage?.paymentFrequency === "SEMESTER" ? "UKT per Semester" : "SPP Bulanan";
               
               let gradeLabel = "";
               if (id === "TK") gradeLabel = currentGrade === 1 ? "TK A" : "TK B";
               else if (stage?.paymentFrequency === "SEMESTER") gradeLabel = `Semester ${currentGrade}`;
               else gradeLabel = `Kelas ${currentGrade}`;

               return (
                 <div key={id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                       <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-blue-600" />
                          <h4 className="font-bold text-slate-800">{stage?.label}</h4>
                       </div>
                       <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                         Mulai {gradeLabel}
                       </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       {/* Uang Pangkal */}
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            Uang Pangkal
                            {isEntryFeeDisabled && <span className="text-red-400 text-[8px]">(Skip)</span>}
                          </label>
                          <div className="relative">
                            <Input 
                              className={cn("bg-white", isEntryFeeDisabled && "bg-slate-100 text-slate-400 cursor-not-allowed")}
                              placeholder="0"
                              value={formatNum(costs[id]?.entry)}
                              onChange={e => handleCostChange(id, 'entry', e.target.value)}
                              disabled={isEntryFeeDisabled}
                            />
                          </div>
                       </div>

                       {/* SPP / UKT */}
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">{monthlyLabel}</label>
                          <Input 
                            className="bg-white" 
                            placeholder="0"
                            value={formatNum(costs[id]?.monthly)}
                            onChange={e => handleCostChange(id, 'monthly', e.target.value)}
                          />
                       </div>
                    </div>
                    
                    {isEntryFeeDisabled && (
                      <div className="mt-2 flex items-center gap-1 text-[9px] text-orange-600">
                        <AlertCircle className="w-3 h-3" />
                        <span>Asumsi: Uang Pangkal sudah lunas karena masuk pertengahan.</span>
                      </div>
                    )}
                 </div>
               );
             })}
          </div>
        </div>
      )}

      {/* FOOTER ACTIONS */}
      <div className="flex gap-3 pt-4 border-t border-slate-100">
         {step === 1 ? (
           <Button variant="outline" onClick={onCancel} className="flex-1 h-11">Batal</Button>
         ) : (
           <Button variant="outline" onClick={() => setStep(prev => prev - 1)} className="flex-1 h-11">Kembali</Button>
         )}

         {step < 3 ? (
           <Button 
             onClick={() => setStep(prev => prev + 1)} 
             className="flex-1 bg-blue-600 hover:bg-blue-700 h-11"
             disabled={(step === 1 && !name) || (step === 2 && selectedStageIds.length === 0)}
           >
             Lanjut <ChevronRight className="w-4 h-4 ml-1" />
           </Button>
         ) : (
           <Button onClick={handleFinish} className="flex-1 bg-green-600 hover:bg-green-700 h-11 font-bold shadow-lg shadow-green-100">
             Simpan Data Anak <Check className="w-4 h-4 ml-1" />
           </Button>
         )}
      </div>

    </div>
  );
}