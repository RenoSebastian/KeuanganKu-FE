"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STAGES_DB, calculateAge } from "@/lib/financial-math";
import { cn } from "@/lib/utils";
import { 
  Check, ChevronRight, GraduationCap, AlertCircle, Loader2, 
  User, Calendar as CalendarIcon, Baby, School, ArrowLeft,
  CheckCircle2, DollarSign
} from "lucide-react";
import { financialService } from "@/services/financial.service";
import { EducationPayload, EducationStagePayload } from "@/lib/types";

interface ChildWizardProps {
  onSave: () => void;
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
      const newCosts = { ...costs };
      delete newCosts[id];
      setCosts(newCosts);
      
      const newGrades = { ...startGrades };
      delete newGrades[id];
      setStartGrades(newGrades);
    } else {
      setSelectedStageIds(prev => [...prev, id]);
      setCosts(prev => ({ ...prev, [id]: { entry: 0, monthly: 0 } }));
      setStartGrades(prev => ({ ...prev, [id]: 1 })); 
    }
  };

  const handleGradeChange = (id: string, grade: number) => {
    setStartGrades(prev => ({ ...prev, [id]: grade }));
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

  const mapLevel = (id: string): "TK" | "SD" | "SMP" | "SMA" | "PT" => {
    if (id === "TK") return "TK";
    if (id === "SD") return "SD";
    if (id === "SMP") return "SMP";
    if (id === "SMA") return "SMA";
    if (id === "KULIAH" || id === "S2") return "PT";
    return "TK";
  };

  // --- SUBMIT LOGIC ---
  const handleFinish = async () => {
    setIsLoading(true);
    try {
      const stagesPayload: EducationStagePayload[] = [];
      const childAge = calculateAge(dob);

      selectedStageIds.forEach(id => {
        const stageInfo = STAGES_DB.find(s => s.id === id);
        if (!stageInfo) return;

        const cost = costs[id];
        const startGrade = startGrades[id] || 1;
        const baseEntryYears = (stageInfo.entryAge + (startGrade - 1)) - childAge;

        if (cost.entry > 0) {
          stagesPayload.push({
            level: mapLevel(id),
            costType: "ENTRY",
            currentCost: cost.entry,
            yearsToStart: Math.max(0, baseEntryYears) 
          });
        }

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

      const payload: EducationPayload = {
        childName: name,
        childDob: dob,
        method: "GEOMETRIC",
        inflationRate: 10,
        returnRate: 12,
        stages: stagesPayload
      };

      await financialService.saveEducationPlan(payload);
      onSave(); 

    } catch (error) {
      console.error("Gagal menyimpan rencana pendidikan:", error);
      alert("Terjadi kesalahan saat menyimpan data. Pastikan koneksi aman.");
    } finally {
      setIsLoading(false);
    }
  };

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

  // --- UI COMPONENTS ---
  
  return (
    <div className="flex flex-col h-full min-h-[500px]">
      
      {/* 1. PROGRESS STEPPER (PAM Style) */}
      <div className="flex items-center justify-between mb-8 px-4 md:px-12 relative">
         {/* Connector Line */}
         <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-100 -z-10 -translate-y-1/2 rounded-full" />
         
         {[
           { id: 1, label: "Profil Anak", icon: User },
           { id: 2, label: "Pilih Jenjang", icon: School },
           { id: 3, label: "Input Biaya", icon: DollarSign }
         ].map((s) => (
           <div key={s.id} className="flex flex-col items-center gap-2 bg-white px-2 z-10">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm border-2",
                step >= s.id 
                  ? "bg-brand-600 border-brand-600 text-white shadow-brand-500/30 scale-110" 
                  : "bg-white border-slate-200 text-slate-300"
              )}>
                 {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider transition-colors duration-300",
                step >= s.id ? "text-brand-600" : "text-slate-400"
              )}>
                {s.label}
              </span>
           </div>
         ))}
      </div>

      <div className="flex-1 px-1">
        
        {/* --- STEP 1: PROFIL --- */}
        {step === 1 && (
          <div className="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-6">
               <h3 className="text-xl font-bold text-slate-800">Siapa nama buah hati Anda?</h3>
               <p className="text-slate-500 text-sm mt-1">Data ini digunakan untuk menghitung estimasi usia masuk sekolah.</p>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Nama Lengkap</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                  <Input 
                    placeholder="Contoh: Budi Kecil" 
                    value={name} onChange={e => setName(e.target.value)} 
                    className="pl-10 h-12 text-base rounded-xl border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Tanggal Lahir</label>
                   <div className="relative group">
                      <Input 
                        type="date" 
                        value={dob} 
                        onChange={e => setDob(e.target.value)} 
                        className="pl-3 h-12 text-sm rounded-xl border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-medium text-slate-700"
                        min={minDate}
                        max={maxDate}
                      />
                   </div>
                 </div>
                 
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Jenis Kelamin</label>
                   <div className="relative">
                     <Baby className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                     <select 
                       className="w-full h-12 pl-10 pr-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all appearance-none cursor-pointer"
                       value={gender} onChange={e => setGender(e.target.value as "L" | "P")}
                     >
                       <option value="L">Laki-laki</option>
                       <option value="P">Perempuan</option>
                     </select>
                     <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                   </div>
                 </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-700 text-xs leading-relaxed border border-blue-100">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
                <p>Sistem akan otomatis menghitung kapan anak harus masuk TK, SD, hingga Kuliah berdasarkan tanggal lahir.</p>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 2: PILIH JENJANG --- */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-6">
               <h3 className="text-xl font-bold text-slate-800">Pilih Jenjang Pendidikan</h3>
               <p className="text-slate-500 text-sm mt-1">Tentukan jenjang yang ingin direncanakan saat ini.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {STAGES_DB.map((stage) => {
                const age = calculateAge(dob);
                const isTotallyPassed = age > (stage.entryAge + stage.duration);
                const isSelected = selectedStageIds.includes(stage.id);
                const currentGrade = startGrades[stage.id] || 1;
                const options = getGradeOptions(stage);

                return (
                  <div 
                    key={stage.id}
                    className={cn(
                      "group relative p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden",
                      isTotallyPassed 
                        ? "opacity-60 grayscale bg-slate-50 border-slate-100 cursor-not-allowed" 
                        : isSelected 
                          ? "border-brand-500 bg-brand-50/40 shadow-lg shadow-brand-500/10" 
                          : "border-slate-100 bg-white hover:border-brand-200 hover:shadow-md"
                    )}
                    onClick={() => !isTotallyPassed && handleToggleStage(stage.id)}
                  >
                      <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                             <div className={cn(
                               "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm border border-transparent",
                               isSelected ? "bg-brand-100 text-brand-600 border-brand-200" : "bg-slate-50 text-slate-400 group-hover:bg-white group-hover:border-slate-200"
                             )}>
                               <GraduationCap className="w-5 h-5" />
                             </div>
                             <div>
                               <h4 className={cn("font-bold text-sm transition-colors", isSelected ? "text-brand-700" : "text-slate-700")}>{stage.label}</h4>
                               <p className="text-[10px] text-slate-500 font-medium mt-0.5">Usia Masuk: {stage.entryAge} Thn</p>
                             </div>
                          </div>
                          
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300",
                            isSelected ? "bg-brand-500 border-brand-500 scale-110" : "border-slate-200 bg-white"
                          )}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                      </div>

                      {/* Dropdown Kelas */}
                      {isSelected && !isTotallyPassed && (
                        <div className="mt-4 pt-3 border-t border-brand-100 flex items-center justify-between animate-in slide-in-from-top-2 fade-in">
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Mulai Dari</span>
                           <div className="relative" onClick={(e) => e.stopPropagation()}>
                             <select 
                               className="h-8 pl-3 pr-8 rounded-lg border border-brand-200 bg-white text-xs font-bold text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer appearance-none hover:bg-brand-50 transition-colors shadow-sm"
                               value={currentGrade}
                               onChange={(e) => handleGradeChange(stage.id, parseInt(e.target.value))}
                             >
                               {options.map((opt) => (
                                 <option key={opt.val} value={opt.val}>{opt.label}</option>
                               ))}
                             </select>
                             <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-400 rotate-90 pointer-events-none" />
                           </div>
                        </div>
                      )}

                      {isTotallyPassed && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                          <span className="text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full shadow-sm">
                            Usia Terlewat
                          </span>
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- STEP 3: INPUT BIAYA --- */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-6">
               <h3 className="text-xl font-bold text-slate-800">Estimasi Biaya Sekolah</h3>
               <p className="text-slate-500 text-sm mt-1">Masukkan biaya pendidikan saat ini (tanpa inflasi).</p>
            </div>

            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-4 pb-2">
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
                   <div key={id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-brand-50 rounded-lg text-brand-600 border border-brand-100 group-hover:bg-brand-100 transition-colors">
                               <GraduationCap className="w-4 h-4" />
                             </div>
                             <h4 className="font-bold text-slate-800 text-sm">{stage?.label}</h4>
                          </div>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                            Start: {gradeLabel}
                          </span>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Uang Pangkal */}
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                               Uang Pangkal
                               {isEntryFeeDisabled && <span className="text-rose-400 text-[9px] lowercase italic font-medium">(dilewati)</span>}
                             </label>
                             <div className="relative group/input">
                               <span className={cn(
                                 "absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold transition-colors",
                                 isEntryFeeDisabled ? "text-slate-400" : "text-slate-500 group-focus-within/input:text-brand-600"
                               )}>Rp</span>
                               <Input 
                                 className={cn(
                                   "pl-9 h-11 text-sm font-bold transition-all rounded-xl",
                                   isEntryFeeDisabled 
                                     ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed" 
                                     : "bg-white border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-slate-800"
                                 )}
                                 placeholder="0"
                                 value={formatNum(costs[id]?.entry)}
                                 onChange={e => handleCostChange(id, 'entry', e.target.value)}
                                 disabled={isEntryFeeDisabled}
                               />
                             </div>
                          </div>

                          {/* Biaya Bulanan / Semester */}
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-bold text-slate-500 uppercase">{monthlyLabel}</label>
                             <div className="relative group/input">
                               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 group-focus-within/input:text-brand-600 transition-colors">Rp</span>
                               <Input 
                                 className="pl-9 h-11 bg-white border-slate-200 text-sm font-bold focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all rounded-xl text-slate-800"
                                 placeholder="0"
                                 value={formatNum(costs[id]?.monthly)}
                                 onChange={e => handleCostChange(id, 'monthly', e.target.value)}
                               />
                             </div>
                          </div>
                       </div>
                    </div>
                  );
               })}
            </div>
          </div>
        )}

      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-4 md:p-6 bg-white border-t border-slate-100 flex gap-3 mt-4 rounded-b-3xl">
         {step > 1 && (
           <Button 
             variant="ghost" 
             onClick={() => setStep(prev => prev - 1)} 
             className="flex-1 md:flex-none h-12 rounded-xl text-slate-500 hover:text-brand-700 hover:bg-brand-50 font-medium"
             disabled={isLoading}
           >
             <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
           </Button>
         )}
         
         {step === 1 && (
            <Button 
              variant="outline" 
              onClick={onCancel} 
              className="flex-1 md:flex-none h-12 rounded-xl border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 font-medium" 
              disabled={isLoading}
            >
              Batal
            </Button>
         )}

         {step < 3 ? (
           <Button 
             onClick={() => setStep(prev => prev + 1)} 
             className="flex-1 h-12 rounded-xl bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/30 text-base font-bold transition-all hover:translate-x-1"
             disabled={(step === 1 && !name) || (step === 2 && selectedStageIds.length === 0)}
           >
             Lanjut <ChevronRight className="w-5 h-5 ml-1" />
           </Button>
         ) : (
           <Button 
             onClick={handleFinish} 
             disabled={isLoading} 
             className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 text-base font-bold transition-all hover:scale-[1.02]"
           >
             {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
             Simpan Data Anak
           </Button>
         )}
      </div>

    </div>
  );
}