"use client";

import { useState } from "react";
import { 
  Search, Plus, Edit, Trash2, 
  Building2, Users, FolderTree, AlertCircle,
  X, Save
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UnitKerja } from "@/lib/types";
import { cn } from "@/lib/utils";

// MOCK DATA (Simulasi database awal)
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
  const [currentUnit, setCurrentUnit] = useState<UnitKerja | null>(null); // Jika null berarti mode "Tambah"
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
    <div className="min-h-screen w-full bg-slate-50/50 pb-24 md:pb-12">
      {/* Header Decoration */}
      <div className="h-32 w-full bg-slate-900 absolute top-0 left-0 z-0" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-8 md:pt-12">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 text-white">
          <div>
            <div className="flex items-center gap-2 mb-1 opacity-80">
                <FolderTree className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Master Data</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Unit Kerja & Struktur</h1>
            <p className="text-slate-300 text-sm">Kelola daftar Bidang, Divisi, dan Unit Organisasi PAM JAYA.</p>
          </div>
          <Button 
            onClick={() => openModal()}
            className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Tambah Unit Baru
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="p-4 mb-6 shadow-sm border-slate-200 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Cari Nama Bidang atau Kode Unit..." 
              className="pl-9 bg-slate-50 border-slate-200 focus:bg-white max-w-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Units Table */}
        <Card className="overflow-hidden shadow-sm border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold w-16">No</th>
                  <th className="px-6 py-4 font-bold">Kode Unit</th>
                  <th className="px-6 py-4 font-bold">Nama Unit Kerja</th>
                  <th className="px-6 py-4 font-bold">Jumlah Karyawan</th>
                  <th className="px-6 py-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUnits.length > 0 ? (
                  filteredUnits.map((unit, index) => (
                    <tr key={unit.id} className="bg-white hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded text-xs">
                            {unit.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                            <Building2 className="w-4 h-4 text-indigo-500" />
                            {unit.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                            <Users className="w-4 h-4 text-slate-400" />
                            {unit.userCount || 0} Orang
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => openModal(unit)}
                            title="Edit Unit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
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
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>Data unit tidak ditemukan.</p>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center gap-2">
                {currentUnit ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {currentUnit ? "Edit Unit Kerja" : "Tambah Unit Baru"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Unit Kerja</label>
                <Input 
                  placeholder="Contoh: Bidang Keuangan" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-50"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kode Unit</label>
                <Input 
                  placeholder="Contoh: KEU" 
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="bg-slate-50 font-mono uppercase"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={closeModal}>
                  Batal
                </Button>
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold" onClick={handleSave}>
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