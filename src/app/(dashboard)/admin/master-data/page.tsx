"use client";

import { useState } from "react";
import { 
  Search, Plus, Edit, Trash2, 
  Building2, Users, FolderTree, AlertCircle,
  X, Save, Briefcase
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"; // Gunakan Label component baru
import { Badge } from "@/components/ui/badge"; // Gunakan Badge component baru
import { UnitKerja } from "@/lib/types";
import { cn } from "@/lib/utils";

// MOCK DATA
const INITIAL_UNITS: UnitKerja[] = [
  { id: "DIR-001", code: "DIR-UT", name: "Direktorat Utama", userCount: 5 },
  { id: "U-001", code: "KEU", name: "Bidang Keuangan", userCount: 12 },
  { id: "U-002", code: "SDM", name: "Bidang SDM & Umum", userCount: 8 },
  { id: "U-003", code: "OPS", name: "Bidang Operasional", userCount: 25 },
  { id: "IT-001", code: "TI", name: "Divisi Teknologi Informasi", userCount: 10 },
  { id: "U-004", code: "HKM", name: "Bidang Hukum", userCount: 4 },
];

export default function MasterDataPage() {
  const [units, setUnits] = useState<UnitKerja[]>(INITIAL_UNITS);
  const [searchTerm, setSearchTerm] = useState("");
  
  // --- STATE MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUnit, setCurrentUnit] = useState<UnitKerja | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "" });
  const [formError, setFormError] = useState("");

  // Filtering Logic
  const filteredUnits = units.filter(unit => 
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    unit.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- HANDLERS ---

  const openModal = (unit?: UnitKerja) => {
    if (unit) {
      setCurrentUnit(unit);
      setFormData({ name: unit.name, code: unit.code });
    } else {
      setCurrentUnit(null);
      setFormData({ name: "", code: "" });
    }
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", code: "" });
    setFormError("");
  };

  const handleSave = () => {
    if (!formData.name || !formData.code) {
      setFormError("Nama dan Kode Unit wajib diisi!");
      return;
    }

    if (currentUnit) {
      // Logic Update
      setUnits(prev => prev.map(u => 
        u.id === currentUnit.id ? { ...u, name: formData.name, code: formData.code } : u
      ));
    } else {
      // Logic Create
      const newUnit: UnitKerja = {
        id: `U-${Math.floor(Math.random() * 1000)}`,
        name: formData.name,
        code: formData.code.toUpperCase(),
        userCount: 0
      };
      setUnits(prev => [newUnit, ...prev]);
    }
    closeModal();
  };

  const handleDelete = (id: string, name: string, count: number = 0) => {
    if (count > 0) {
      alert(`⚠️ Gagal menghapus!\n\nUnit "${name}" masih memiliki ${count} karyawan aktif.\nHarap pindahkan atau non-aktifkan karyawan di unit ini terlebih dahulu.`);
      return;
    }
    
    if(confirm(`Apakah Anda yakin ingin menghapus unit "${name}"?`)) {
      setUnits(prev => prev.filter(u => u.id !== id));
    }
  };

  return (
    <div className="min-h-screen w-full bg-surface-ground pb-24 md:pb-12">
      
      {/* --- HEADER (PAM IDENTITY) --- */}
      <div className="bg-brand-900 pt-10 pb-32 px-5 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
         <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-[0.05] mix-blend-overlay"></div>

         <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
               <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 mb-3">
                  <FolderTree className="w-4 h-4 text-cyan-300" />
                  <span className="text-[10px] font-bold text-cyan-100 tracking-widest uppercase">Master Data</span>
               </div>
               <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                 Unit Kerja & Struktur
               </h1>
               <p className="text-brand-100 text-sm mt-1 opacity-90 max-w-lg">
                 Kelola daftar Bidang, Divisi, dan Unit Organisasi dalam ekosistem PAM JAYA.
               </p>
            </div>
            
            <Button 
              onClick={() => openModal()}
              variant="primary"
              className="shadow-xl shadow-brand-900/20"
            >
              <Plus className="w-4 h-4 mr-2" /> Tambah Unit Baru
            </Button>
         </div>
      </div>

      <div className="relative z-20 max-w-6xl mx-auto px-5 -mt-20">
        
        {/* --- SEARCH BAR --- */}
        <Card className="p-4 mb-6 shadow-lg border-white/60 bg-white/90 backdrop-blur-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Cari Nama Bidang atau Kode Unit..." 
              className="pl-12 h-12 bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl text-sm font-medium transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* --- DATA TABLE --- */}
        <Card className="overflow-hidden shadow-sm border-slate-200 bg-white rounded-[1.5rem]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5 font-bold w-16 text-center">No</th>
                  <th className="px-6 py-5 font-bold">Kode Unit</th>
                  <th className="px-6 py-5 font-bold">Nama Unit Kerja</th>
                  <th className="px-6 py-5 font-bold">Jumlah Karyawan</th>
                  <th className="px-6 py-5 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUnits.length > 0 ? (
                  filteredUnits.map((unit, index) => (
                    <tr key={unit.id} className="bg-white hover:bg-brand-50/30 transition-colors group">
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs text-center font-medium">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="font-mono bg-slate-50 border-slate-200 text-slate-600">
                            {unit.code}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-50 rounded-lg text-brand-600 border border-brand-100 group-hover:bg-brand-100 transition-colors">
                               <Building2 className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-slate-700 group-hover:text-brand-700 transition-colors">
                                {unit.name}
                            </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-500 font-medium">
                            <Users className="w-4 h-4 text-slate-400" />
                            {unit.userCount || 0} Orang
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
                            onClick={() => openModal(unit)}
                            title="Edit Unit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            onClick={() => handleDelete(unit.id, unit.name, unit.userCount)}
                            title="Hapus Unit"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                         <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-slate-300" />
                         </div>
                         <div>
                            <p className="text-slate-900 font-bold">Data tidak ditemukan</p>
                            <p className="text-slate-500 text-xs">Coba kata kunci lain atau tambahkan unit baru.</p>
                         </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md border-0 overflow-hidden animate-in zoom-in-95 duration-200 p-0 shadow-2xl">
            <div className="bg-brand-900 px-6 py-5 flex justify-between items-center relative overflow-hidden">
              {/* Decor */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              
              <h3 className="text-white font-bold flex items-center gap-2 relative z-10 text-lg">
                {currentUnit ? <Edit className="w-5 h-5 text-cyan-300" /> : <Plus className="w-5 h-5 text-cyan-300" />}
                {currentUnit ? "Edit Unit Kerja" : "Tambah Unit Baru"}
              </h3>
              <button onClick={closeModal} className="text-brand-200 hover:text-white transition-colors relative z-10 bg-white/10 hover:bg-white/20 p-1.5 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 bg-white">
              {formError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-xs font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{formError}</p>
                </div>
              )}

              <div className="space-y-4">
                  <div className="space-y-2">
                    <Label variant="field">Nama Unit Kerja</Label>
                    <div className="relative group">
                       <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                       <Input 
                         placeholder="Contoh: Bidang Keuangan" 
                         value={formData.name}
                         onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                         className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl"
                         autoFocus
                       />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label variant="field">Kode Unit</Label>
                    <div className="relative group">
                       <Badge className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-600 transition-colors bg-transparent border-0 p-0" children={undefined} />
                       <Input 
                         placeholder="Contoh: KEU" 
                         value={formData.code}
                         onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                         className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl font-mono uppercase"
                       />
                    </div>
                  </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Button variant="outline" className="flex-1 h-11 rounded-xl" onClick={closeModal}>
                  Batal
                </Button>
                <Button className="flex-1 h-11 rounded-xl bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-600/20" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" /> Simpan
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}