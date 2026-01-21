"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STAGES_DB, calculateAge } from "@/lib/financial-math";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, GraduationCap, AlertCircle, Loader2 } from "lucide-react";
import { financialService } from "@/services/financial.service";
import { EducationPayload, EducationStagePayload } from "@/lib/types";

// Interface Props
interface ChildWizardProps {
  onSave: () => void; // Callback tanpa parameter, cukup sinyal untuk refresh
  onCancel: () => void;
}

export function ChildWizard({ onSave, onCancel }: ChildWizardProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Step 1: Profile
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"L" | "P">("L");

  // Step 2: Select Stages & Start Grade
  const [selectedStageIds, setSelectedStageIds] = useState<string[]>([]);
  const [startGrades, setStartGrades] = useState<Record<string, number>>({});

  // Step 3: Input Costs
  const [costs, setCosts] = useState<Record<string, { entry: number; monthly: number }>>({});

  // --- LOGIC VALIDASI UMUR ---
  const today = new Date();
  const minDate = new Date(today.getFullYear() - 23, today.getMonth(), today.getDate()).toISOString().split('T')[0];
  const maxDate = new Date().toISOString().split('T')[0];

  // --- HANDLERS ---
  const handleToggleStage = (id: string) => {
    if (selectedStageIds.includes(id)) {
      setSelectedStageIds(prev => prev.filter(s => s !== id));
      // Cleanup data terkait
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
      setStartGrades(prev => ({ ...prev, [id]: 1 })); 
    }
  };

  const handleGradeChange = (id: string, grade: number) => {
    setStartGrades(prev => ({ ...prev, [id]: grade }));
    
    // Auto reset entry fee if grade > 1 (Asumsi pindahan tidak bayar pangkal)
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

  // Helper Mapper Level untuk Backend Enum
  const mapLevel = (id: string): "TK" | "SD" | "SMP" | "SMA" | "PT" => {
    if (id === "TK") return "TK";
    if (id === "SD") return "SD";
    if (id === "SMP") return "SMP";
    if (id === "SMA") return "SMA";
    if (id === "KULIAH" || id === "S2") return "PT";
    return "TK"; // Fallback
  };

  // --- SUBMIT LOGIC (INTEGRASI DATABASE) ---
  const handleFinish = async () => {
    setIsLoading(true);
    try {
      const stagesPayload: EducationStagePayload[] = [];
      const childAge = calculateAge(dob); // Umur anak saat ini

      // Loop setiap stage yang dipilih user
      selectedStageIds.forEach(id => {
        const stageInfo = STAGES_DB.find(s => s.id === id);
        if (!stageInfo) return;

        const cost = costs[id];
        const startGrade = startGrades[id] || 1;
        
        // Hitung "Years To Start" dasar
        // Rumus: (Usia Masuk + (KelasMulai - 1)) - UsiaAnak
        const baseEntryYears = (stageInfo.entryAge + (startGrade - 1)) - childAge;

        // 1. PUSH UANG PANGKAL (One-time cost)
        if (cost.entry > 0) {
          stagesPayload.push({
            level: mapLevel(id),
            costType: "ENTRY",
            currentCost: cost.entry,
            yearsToStart: Math.max(0, baseEntryYears) 
          });
        }

        // 2. PUSH BIAYA BULANAN (Recurring cost) -> DIJABARKAN PER TAHUN (ANNUAL)
        if (cost.monthly > 0) {
          const isSemester = stageInfo.paymentFrequency === "SEMESTER";
          const annualCost = isSemester ? cost.monthly * 2 : cost.monthly * 12;
          
          const remainingDuration = stageInfo.duration - (startGrade - 1);

          for (let i = 0; i < remainingDuration; i++) {
            stagesPayload.push({
              level: mapLevel(id),
              costType: "ANNUAL", 
              currentCost: annualCost,
              yearsToStart: Math.max(0, baseEntryYears + i) 
            });
          }
        }
      });

      // Construct Final Payload
      const payload: EducationPayload = {
        childName: name,
        childDob: dob,
        method: "GEOMETRIC", // Default Backend Method
        inflationRate: 10,   // Default Asumsi (bisa diubah nanti di dashboard)
        returnRate: 12,      // Default Asumsi
        stages: stagesPayload
      };

      // Call API Backend
      await financialService.saveEducationPlan(payload);
      
      // Notify Parent & Close Wizard
      onSave(); 

    } catch (error) {
      console.error("Gagal menyimpan rencana pendidikan:", error);
      alert("Terjadi kesalahan saat menyimpan data. Pastikan koneksi aman.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper UI Formatting
  const formatNum = (n: number) => n?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") || "";

  const getGradeOptions = (stage: typeof STAGES_DB[0]) => {
    const count = stage.paymentFrequency === "SEMESTER" ? stage.duration * 2 : stage.duration;
    return Array.from({ length: count }, (_, i) => {
      const val = i + 1;
      let label = "";
      if (stage.id === "TK") label = val === 1 ? "TK A" : "TK B";
      else if (stage.paymentFrequency === "SEMESTER") label = `Semester ${val}`;
      else label = `Kelas ${val}`;
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
                 min={minDate}
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
              const options = getGradeOptions(stage);

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

                   {/* Dropdown Kelas */}
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
               const isEntryFeeDisabled = currentGrade > 1;

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
           <Button variant="outline" onClick={onCancel} className="flex-1 h-11" disabled={isLoading}>Batal</Button>
         ) : (
           <Button variant="outline" onClick={() => setStep(prev => prev - 1)} className="flex-1 h-11" disabled={isLoading}>Kembali</Button>
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
           <Button onClick={handleFinish} disabled={isLoading} className="flex-1 bg-green-600 hover:bg-green-700 h-11 font-bold shadow-lg shadow-green-100">
             {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 ml-1 mr-2" />}
             Simpan Data Anak
           </Button>
         )}
      </div>

    </div>
  );
}