"use client";

import { useState, useEffect } from "react";
import {
  Search, Plus, Edit, Trash2,
  Building2, Users, FolderTree, AlertCircle,
  X, Save, Briefcase, Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { masterDataService, UnitKerja } from "@/services/master-data.service";
import { toast } from "sonner"; // Pastikan Anda sudah install sonner

export default function MasterDataPage() {
  // --- STATE ---
  const [units, setUnits] = useState<UnitKerja[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- STATE MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUnit, setCurrentUnit] = useState<UnitKerja | null>(null);

  // Form State
  const [formData, setFormData] = useState({ namaUnit: "", kodeUnit: "" });

  // --- FETCH DATA ---
  const fetchUnits = async () => {
    setIsLoading(true);
    try {
      const data = await masterDataService.getAllUnits();
      setUnits(data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data Unit Kerja");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  // Filtering Logic
  const filteredUnits = units.filter(unit =>
    unit.namaUnit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.kodeUnit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- HANDLERS ---

  const openModal = (unit?: UnitKerja) => {
    if (unit) {
      // Mode Edit
      setCurrentUnit(unit);
      setFormData({ namaUnit: unit.namaUnit, kodeUnit: unit.kodeUnit });
    } else {
      // Mode Create
      setCurrentUnit(null);
      setFormData({ namaUnit: "", kodeUnit: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ namaUnit: "", kodeUnit: "" });
    setCurrentUnit(null);
  };

  const handleSave = async () => {
    if (!formData.namaUnit || !formData.kodeUnit) {
      toast.warning("Nama dan Kode Unit wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      if (currentUnit) {
        // Update
        await masterDataService.updateUnit(currentUnit.id, {
          namaUnit: formData.namaUnit,
          kodeUnit: formData.kodeUnit
        });
        toast.success("Unit kerja berhasil diperbarui");
      } else {
        // Create
        await masterDataService.createUnit({
          namaUnit: formData.namaUnit,
          kodeUnit: formData.kodeUnit.toUpperCase()
        });
        toast.success("Unit kerja baru berhasil ditambahkan");
      }

      closeModal();
      fetchUnits(); // Refresh data
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Terjadi kesalahan saat menyimpan";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus unit "${name}"?`)) return;

    try {
      await masterDataService.deleteUnit(id);
      toast.success("Unit kerja berhasil dihapus");
      fetchUnits(); // Refresh list
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Gagal menghapus unit kerja";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen w-full bg-surface-ground pb-24 md:pb-12">

      {/* --- HEADER (PAM IDENTITY) --- */}
      <div className="bg-brand-900 pt-10 pb-32 px-5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-125 h-125 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
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
              Kelola daftar Bidang, Divisi, dan Unit Organisasi dalam ekosistem MAXIPRO.
            </p>
          </div>

          <Button
            onClick={() => openModal()}
            className="bg-cyan-500 hover:bg-cyan-400 text-white shadow-xl shadow-brand-900/20 font-bold border border-cyan-400/20"
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
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                        <p className="text-slate-500 font-medium text-xs">Memuat data unit kerja...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredUnits.length > 0 ? (
                  filteredUnits.map((unit, index) => (
                    <tr key={unit.id} className="bg-white hover:bg-brand-50/30 transition-colors group">
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs text-center font-medium">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="font-mono bg-slate-50 border-slate-200 text-slate-600">
                          {unit.kodeUnit}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-brand-50 rounded-lg text-brand-600 border border-brand-100 group-hover:bg-brand-100 transition-colors">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-700 group-hover:text-brand-700 transition-colors">
                            {unit.namaUnit}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-500 font-medium">
                          <Users className="w-4 h-4 text-slate-400" />
                          {/* Note: Backend belum return count, set default 0 */}
                          0 Orang
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
                            onClick={() => handleDelete(unit.id, unit.namaUnit)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/60 backdrop-blur-sm animate-in fade-in duration-200">
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Unit Kerja</Label>
                  <div className="relative group">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                    <Input
                      placeholder="Contoh: Bidang Keuangan"
                      value={formData.namaUnit}
                      onChange={(e) => setFormData({ ...formData, namaUnit: e.target.value })}
                      className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kode Unit</Label>
                  <div className="relative group">
                    <Badge variant="outline" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-slate-100 text-slate-500 border-0 p-0 text-[10px] font-mono">ID</Badge>
                    <Input
                      placeholder="Contoh: KEU"
                      value={formData.kodeUnit}
                      onChange={(e) => setFormData({ ...formData, kodeUnit: e.target.value })}
                      className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Button variant="outline" className="flex-1 h-11 rounded-xl" onClick={closeModal} disabled={isSubmitting}>
                  Batal
                </Button>
                <Button
                  className="flex-1 h-11 rounded-xl bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-600/20"
                  onClick={handleSave}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Simpan
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}