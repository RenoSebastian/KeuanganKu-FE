import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Target, User, MapPin, Briefcase, Calendar, Phone, Wallet, CalendarDays, RefreshCcw, Loader2, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- INTERFACES ---
export interface GoalOption {
    id: string; label: string; icon: any; desc: string;
}

interface GoalInputFormProps {
    clientData: any;
    handleClientChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

    goalOptions: GoalOption[];
    selectedGoal: string;
    setSelectedGoal: (v: string) => void;
    goalNameCustom: string;
    setGoalNameCustom: (v: string) => void;

    targetAmount: string;
    handleMoneyInput: (val: string, setter: (v: string) => void) => void;
    setTargetAmount: (v: string) => void;

    targetDate: string;
    setTargetDate: (v: string) => void;
    resetResult: () => void;

    currentSaving: string;
    setCurrentSaving: (v: string) => void;

    inflation: number;
    setInflation: (v: number) => void;

    returnRate: number;
    setReturnRate: (v: number) => void;

    handleReset: () => void;
    handleSimulate: () => void;
    isLoading: boolean;
}

export function GoalInputForm(props: GoalInputFormProps) {
    const {
        clientData, handleClientChange,
        goalOptions, selectedGoal, setSelectedGoal, goalNameCustom, setGoalNameCustom,
        targetAmount, handleMoneyInput, setTargetAmount,
        targetDate, setTargetDate, resetResult,
        currentSaving, setCurrentSaving,
        inflation, setInflation,
        returnRate, setReturnRate,
        handleReset, handleSimulate, isLoading
    } = props;

    return (
        <div className="lg:col-span-5 space-y-6 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300 flex flex-col">
            {/* 1. GOAL SELECTOR */}
            <Card className="p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border-0 bg-white/95 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-inner"><Target className="w-5 h-5" /></div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Pilih Impian</h3>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Kategori Tujuan Finansial</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    {goalOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => { setSelectedGoal(option.id); resetResult(); }}
                            className={cn(
                                "flex flex-col items-start justify-center p-4 rounded-2xl border-2 transition-all duration-300 gap-2 overflow-hidden relative group active:scale-95",
                                selectedGoal === option.id
                                    ? "border-transparent shadow-lg shadow-indigo-600/20 bg-indigo-600 text-white"
                                    : "bg-white border-slate-100 text-slate-500 hover:border-indigo-100"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-xl transition-colors z-10",
                                selectedGoal === option.id ? "bg-white/20 text-white" : "bg-slate-50 text-slate-400 group-hover:text-indigo-500"
                            )}>
                                <option.icon className="w-5 h-5" />
                            </div>
                            <div className="text-left relative z-10">
                                <span className="text-sm font-black tracking-tight block">{option.label}</span>
                                <span className={cn("text-[9px] font-medium leading-tight block mt-0.5", selectedGoal === option.id ? "text-indigo-100" : "text-slate-400")}>{option.desc}</span>
                            </div>
                        </button>
                    ))}
                </div>

                <AnimatePresence>
                    {selectedGoal === "LAINNYA" && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4">
                            <div className="group space-y-1.5 pt-2">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-600 transition-colors">Nama Impian Spesifik <span className="text-rose-500">*</span></Label>
                                <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <Input value={goalNameCustom} onChange={e => setGoalNameCustom(e.target.value)} placeholder="Misal: Beli Mobil SUV" className="pl-11 h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm text-slate-800 transition-all shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>

            {/* 2. DATA KLIEN */}
            <Card className="p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border-0 bg-white/95 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl shadow-inner"><User className="w-5 h-5" /></div>
                    <div><h3 className="text-lg font-black text-slate-800 tracking-tight">Profil Klien</h3></div>
                </div>

                <div className="space-y-5">
                    <div className="group space-y-1.5">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-600 transition-colors">Nama Lengkap <span className="text-rose-500">*</span></Label>
                        <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                            <Input name="clientName" placeholder="Cth: Budi Santoso" value={clientData.clientName} onChange={handleClientChange} className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl font-black text-lg text-slate-800 transition-all shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="group space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-600 transition-colors">Tgl Lahir <span className="text-rose-500">*</span></Label>
                            <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                                <Input type="date" name="clientDob" value={clientData.clientDob} onChange={handleClientChange} className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm text-slate-800 transition-all shadow-sm block w-full focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white" />
                            </div>
                        </div>
                        <div className="group space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-600 transition-colors">Kota <span className="text-rose-500">*</span></Label>
                            <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                                <Input name="clientCity" placeholder="Bandung" value={clientData.clientCity} onChange={handleClientChange} className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm text-slate-800 transition-all shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="group space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-600 transition-colors">No. HP <span className="text-[9px] font-normal lowercase">(Opsional)</span></Label>
                            <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                                <Input type="tel" inputMode="numeric" name="clientPhone" placeholder="0812..." value={clientData.clientPhone} onChange={handleClientChange} className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm text-slate-800 transition-all shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white" />
                            </div>
                        </div>
                        <div className="group space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-600 transition-colors">Pekerjaan <span className="text-[9px] font-normal lowercase">(Opsional)</span></Label>
                            <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                                <Input name="clientJob" placeholder="PNS" value={clientData.clientJob} onChange={handleClientChange} className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm text-slate-800 transition-all shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* 3. FINANCIAL PARAMETERS */}
            <Card className="p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border-0 bg-white/95 backdrop-blur-xl flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl shadow-inner"><Wallet className="w-5 h-5" /></div>
                    <div><h3 className="text-lg font-black text-slate-800 tracking-tight">Kalkulasi Finansial</h3></div>
                </div>

                <div className="space-y-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-6">
                        <div className="group space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-600 transition-colors">
                                Estimasi Biaya Saat Ini <span className="text-rose-500">*</span>
                            </Label>
                            <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs group-focus-within:text-indigo-600 transition-colors">Rp</div>
                                <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-200 font-light text-xl">|</div>
                                <Input className="pl-14 h-14 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white font-black text-xl text-slate-800 transition-all shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400" placeholder="0" value={targetAmount} onChange={(e) => handleMoneyInput(e.target.value, setTargetAmount)} inputMode="numeric" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                            <div className="group space-y-1.5">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-600 transition-colors">Target Tercapai <span className="text-rose-500">*</span></Label>
                                <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                    <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                                    <Input type="date" value={targetDate} onChange={e => { setTargetDate(e.target.value); resetResult(); }} className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm text-slate-800 transition-all shadow-sm block w-full focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white" min={new Date().toISOString().split("T")[0]} />
                                </div>
                            </div>
                            <div className="group space-y-1.5">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-600 transition-colors">Tabungan Awal <span className="text-[9px] font-normal lowercase text-slate-400">(Opsional)</span></Label>
                                <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-[10px] group-focus-within:text-indigo-600 transition-colors">Rp</div>
                                    <Input value={currentSaving} onChange={e => handleMoneyInput(e.target.value, setCurrentSaving)} className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm text-slate-800 transition-all shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white" placeholder="0" inputMode="numeric" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-6 pt-6 border-t border-slate-100">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                    <span>Asumsi Inflasi Tahunan</span>
                                    <span className="text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm">{inflation}%</span>
                                </div>
                                <Slider value={inflation} onChange={(v) => { setInflation(v); resetResult(); }} min={0} max={15} step={0.5} className="py-2" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                    <span>Return Investasi Tahunan</span>
                                    <span className="text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm">{returnRate}%</span>
                                </div>
                                <Slider value={returnRate} onChange={(v) => { setReturnRate(v); resetResult(); }} min={0} max={20} step={0.5} className="py-2" />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-8 mt-6 border-t border-slate-100 w-full">
                        <Button variant="outline" onClick={handleReset} className="h-14 w-14 rounded-2xl border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-rose-600 shrink-0 shadow-sm active:scale-95 transition-all" title="Reset Semua">
                            <RefreshCcw className="w-5 h-5" />
                        </Button>
                        <Button
                            onClick={handleSimulate}
                            disabled={isLoading || !targetAmount || !clientData.clientName}
                            className="h-14 flex-1 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Play className="w-5 h-5 mr-2 fill-white" />}
                            Jalankan Kalkulasi
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}