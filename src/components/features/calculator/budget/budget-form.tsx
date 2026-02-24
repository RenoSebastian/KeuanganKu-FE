import { User, Calendar, MapPin, Phone, Briefcase, Wallet, Calculator, RefreshCcw, Loader2, Play, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface BudgetFormProps {
    clientData: any;
    setClientData: (data: any) => void;
    fixedIncome: string;
    // [FIX] Definisi Setter
    setFixedIncome: (val: string) => void;
    variableIncome: string;
    setVariableIncome: (val: string) => void;

    isLoading: boolean;
    hasAccess: boolean;
    onCalculate: () => void;
    onReset: () => void;
    onOpenHelper: (target: "fixedIncome" | "variableIncome") => void;
    handleMoneyInput: (val: string, setter: (v: string) => void) => void;
    handleClientChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BudgetForm({
    clientData,
    fixedIncome,
    variableIncome,
    isLoading,
    hasAccess,
    onCalculate,
    onReset,
    onOpenHelper,
    handleMoneyInput,
    handleClientChange,
    // [FIX] Destructuring Props yang Hilang Sebelumnya:
    setClientData,
    setFixedIncome,
    setVariableIncome
}: BudgetFormProps) {

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
            <Card className="p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border-0 bg-white/95 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-inner"><User className="w-5 h-5" /></div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Profil Klien</h3>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Identitas Dasar</p>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="group space-y-1.5">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Nama Lengkap <span className="text-rose-500">*</span></Label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input name="clientName" placeholder="Cth: Budi Santoso" value={clientData.clientName} onChange={handleClientChange} className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl font-black text-lg text-slate-800" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="group space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Tgl Lahir</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input type="date" name="clientDob" value={clientData.clientDob} onChange={handleClientChange} className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm text-slate-800" />
                            </div>
                        </div>
                        <div className="group space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Kota</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input name="clientCity" placeholder="Bandung" value={clientData.clientCity} onChange={handleClientChange} className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm text-slate-800" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="group space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">No. HP</Label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input type="tel" inputMode="numeric" name="clientPhone" placeholder="0812..." value={clientData.clientPhone} onChange={handleClientChange} className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm text-slate-800" />
                            </div>
                        </div>
                        <div className="group space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Pekerjaan</Label>
                            <div className="relative">
                                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input name="clientJob" placeholder="PNS" value={clientData.clientJob} onChange={handleClientChange} className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm text-slate-800" />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border-0 bg-white/95 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shadow-inner"><Wallet className="w-5 h-5" /></div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Kondisi Keuangan</h3>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Input dalam Skala TAHUNAN</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="group space-y-2 flex flex-col justify-end">
                        <div className="flex justify-between items-end mb-1">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Gaji Tetap <span className="text-rose-500">*</span></Label>
                            <button onClick={() => onOpenHelper("fixedIncome")} className="text-[9px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all shadow-sm">
                                <Calculator className="w-3 h-3" /> Konversi Bulan
                            </button>
                        </div>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">Rp</div>
                            <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-200 font-light text-xl">|</div>
                            {/* [FIX] setFixedIncome sekarang sudah dikenali */}
                            <Input className="pl-14 h-14 rounded-2xl bg-slate-50 border-slate-200 font-black text-xl text-slate-800" placeholder="0" value={fixedIncome} onChange={(e) => handleMoneyInput(e.target.value, setFixedIncome)} inputMode="numeric" />
                        </div>
                    </div>

                    <div className="group space-y-2 flex flex-col justify-end">
                        <div className="flex justify-between items-end mb-1">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Bonus / THR <span className="text-[9px] font-normal text-slate-400">(Opsional)</span></Label>
                            <button onClick={() => onOpenHelper("variableIncome")} className="text-[9px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all shadow-sm">
                                <Calculator className="w-3 h-3" /> Konversi Bulan
                            </button>
                        </div>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">Rp</div>
                            <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-200 font-light text-xl">|</div>
                            {/* [FIX] setVariableIncome sekarang sudah dikenali */}
                            <Input className="pl-14 h-14 rounded-2xl bg-slate-50 border-slate-200 font-black text-xl text-slate-800" placeholder="0" value={variableIncome} onChange={(e) => handleMoneyInput(e.target.value, setVariableIncome)} inputMode="numeric" />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6 mt-4 border-t border-slate-100">
                        <Button variant="outline" onClick={onReset} className="h-14 w-14 rounded-2xl border-slate-300 text-slate-500 hover:bg-rose-50 hover:text-rose-600 shrink-0">
                            <RefreshCcw className="w-5 h-5" />
                        </Button>
                        <Button
                            onClick={onCalculate}
                            disabled={isLoading || !fixedIncome || !clientData.clientName || !hasAccess}
                            className={cn(
                                "h-14 flex-1 rounded-2xl text-white font-black text-lg shadow-lg transition-all active:scale-95 disabled:opacity-50",
                                hasAccess ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30" : "bg-slate-400 cursor-not-allowed"
                            )}
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : hasAccess ? <Play className="w-5 h-5 mr-2 fill-white" /> : <Lock className="w-5 h-5 mr-2" />}
                            {hasAccess ? "Jalankan Kalkulasi" : "Kuota Habis"}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}