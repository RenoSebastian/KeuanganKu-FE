"use client";

import React, { useState, useEffect } from "react";
import {
    Tag, Plus, RefreshCw, Power, Trash2, CheckCircle2,
    XCircle, AlertCircle, Percent, DollarSign, Users,
    Search, Loader2, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { subscriptionService } from "@/services/subscription.service";
import { Voucher } from "@/lib/types/subscription";
import { formatCurrency } from "@/lib/formatters";

export default function AdminVouchersPage() {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal Create Voucher State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formCode, setFormCode] = useState("");
    const [formName, setFormName] = useState("");
    const [formDiscountType, setFormDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
    const [formDiscountValue, setFormDiscountValue] = useState<number>(50);
    const [formMaxDiscount, setFormMaxDiscount] = useState<string>("");
    const [formMinPurchase, setFormMinPurchase] = useState<string>("");

    const fetchVouchers = async () => {
        setIsLoading(true);
        try {
            const data = await subscriptionService.getAdminVouchers();
            setVouchers(data);
        } catch (error: any) {
            toast.error("Gagal memuat data voucher", {
                description: error.response?.data?.message || "Terjadi kesalahan jaringan."
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    const handleToggle = async (voucher: Voucher) => {
        try {
            await subscriptionService.toggleAdminVoucher(voucher.id);
            toast.success(`Voucher ${voucher.code} berhasil ${voucher.isActive ? "dinonaktifkan" : "diaktifkan"}!`);
            setVouchers(prev =>
                prev.map(v => v.id === voucher.id ? { ...v, isActive: !v.isActive } : v)
            );
        } catch (error: any) {
            toast.error("Gagal mengubah status voucher", {
                description: error.response?.data?.message
            });
        }
    };

    const handleDelete = async (voucher: Voucher) => {
        if (!confirm(`Yakin ingin menghapus / menonaktifkan voucher ${voucher.code}?`)) return;

        try {
            const res = await subscriptionService.deleteAdminVoucher(voucher.id);
            toast.success(res.message || "Voucher berhasil diproses");
            fetchVouchers();
        } catch (error: any) {
            toast.error("Gagal menghapus voucher", {
                description: error.response?.data?.message
            });
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formCode.trim()) return toast.error("Kode voucher wajib diisi");
        if (!formName.trim()) return toast.error("Keterangan voucher wajib diisi");
        if (formDiscountValue <= 0) return toast.error("Nilai diskon harus lebih dari 0");

        setIsSubmitting(true);
        try {
            await subscriptionService.createAdminVoucher({
                code: formCode.trim().toUpperCase(),
                name: formName.trim(),
                discountType: formDiscountType,
                discountValue: Number(formDiscountValue),
                maxDiscountAmount: formMaxDiscount ? Number(formMaxDiscount) : undefined,
                minPurchaseAmount: formMinPurchase ? Number(formMinPurchase) : undefined,
                isActive: true,
            });

            toast.success(`Voucher ${formCode.toUpperCase()} berhasil dibuat!`);
            setIsCreateOpen(false);
            // Reset form
            setFormCode("");
            setFormName("");
            setFormDiscountType("PERCENTAGE");
            setFormDiscountValue(50);
            setFormMaxDiscount("");
            setFormMinPurchase("");
            fetchVouchers();
        } catch (error: any) {
            toast.error("Gagal membuat voucher", {
                description: error.response?.data?.message || "Periksa kembali input Anda."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredVouchers = vouchers.filter(v =>
        v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                        <Tag className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                                Manajemen Voucher Promo
                            </h1>
                            <Badge className="bg-indigo-100 text-indigo-700 border-none font-bold text-xs">
                                Subscription
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Kelola kode promo diskon untuk paket berlangganan pengguna.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={fetchVouchers}
                        disabled={isLoading}
                        className="rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                        Segarkan
                    </Button>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Voucher
                    </Button>
                </div>
            </div>

            {/* SEARCH & FILTERS */}
            <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <Search className="w-5 h-5 text-slate-400 ml-2" />
                <input
                    type="text"
                    placeholder="Cari berdasarkan kode voucher atau deskripsi promo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
            </div>

            {/* TABLE / CARDS LIST */}
            <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        <p className="text-sm font-medium">Memuat daftar voucher...</p>
                    </div>
                ) : filteredVouchers.length === 0 ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-3 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <Tag className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-bold text-slate-700">Belum Ada Voucher</h3>
                        <p className="text-sm text-slate-400 max-w-sm">
                            Tidak ditemukan voucher promosi. Klik tombol "Tambah Voucher" untuk membuat kode baru.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-400">
                                    <th className="py-4 px-6">Kode Voucher</th>
                                    <th className="py-4 px-6">Deskripsi Promo</th>
                                    <th className="py-4 px-6">Nilai Diskon</th>
                                    <th className="py-4 px-6 text-center">Total Digunakan</th>
                                    <th className="py-4 px-6 text-center">Status (Kill Switch)</th>
                                    <th className="py-4 px-6 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {filteredVouchers.map((voucher) => (
                                    <tr key={voucher.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-4 px-6 font-mono font-black text-slate-800">
                                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-3 py-1 rounded-lg text-xs tracking-wider">
                                                {voucher.code}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="font-bold text-slate-800">{voucher.name}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {voucher.minPurchaseAmount
                                                    ? `Min. belanja ${formatCurrency(Number(voucher.minPurchaseAmount))}`
                                                    : "Berlaku untuk semua paket"}
                                            </p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-1.5 font-black text-slate-800">
                                                {voucher.discountType === "PERCENTAGE" ? (
                                                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-mono">
                                                        {voucher.discountValue}% OFF
                                                    </span>
                                                ) : (
                                                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-mono">
                                                        Potong {formatCurrency(Number(voucher.discountValue))}
                                                    </span>
                                                )}
                                            </div>
                                            {voucher.maxDiscountAmount && voucher.discountType === "PERCENTAGE" && (
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    Maks. {formatCurrency(Number(voucher.maxDiscountAmount))}
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full text-xs">
                                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                                {voucher._count?.usages ?? 0} Transaksi
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <button
                                                onClick={() => handleToggle(voucher)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                                                    voucher.isActive
                                                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                                        : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                                                }`}
                                                title="Klik untuk toggle switch status aktif"
                                            >
                                                <Power className="w-3 h-3" />
                                                {voucher.isActive ? "AKTIF" : "NONAKTIF"}
                                            </button>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(voucher)}
                                                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg p-2"
                                                title="Hapus / Nonaktifkan"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL TAMBAH VOUCHER */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Tag className="w-5 h-5 text-indigo-600" />
                            Buat Kode Voucher Baru
                        </DialogTitle>
                        <DialogDescription>
                            Voucher dapat digunakan untuk memberikan diskon pada transaksi berlangganan.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreate} className="space-y-4 py-2">
                        <div>
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                Kode Voucher *
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: ENGINE50"
                                value={formCode}
                                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                Nama / Keterangan Promo *
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Promo Spesial Engine 50%"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                    Tipe Diskon *
                                </label>
                                <select
                                    value={formDiscountType}
                                    onChange={(e) => setFormDiscountType(e.target.value as any)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                >
                                    <option value="PERCENTAGE">Persentase (%)</option>
                                    <option value="FIXED_AMOUNT">Nominal Tetap (Rp)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                    Nilai Diskon *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder={formDiscountType === "PERCENTAGE" ? "50" : "50000"}
                                    value={formDiscountValue}
                                    onChange={(e) => setFormDiscountValue(Number(e.target.value))}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        {formDiscountType === "PERCENTAGE" && (
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                    Maksimal Potongan Rupiah (Opsional)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Biarkan kosong jika tanpa batas"
                                    value={formMaxDiscount}
                                    onChange={(e) => setFormMaxDiscount(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                Minimal Pembelian Rupiah (Opsional)
                            </label>
                            <input
                                type="number"
                                min="0"
                                placeholder="Biarkan kosong jika berlaku semua paket"
                                value={formMinPurchase}
                                onChange={(e) => setFormMinPurchase(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                                disabled={isSubmitting}
                                className="rounded-xl"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    "Simpan Voucher"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
