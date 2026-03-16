"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id as dateFnsId } from "date-fns/locale";
import {
    CheckCircle,
    XCircle,
    Eye,
    Loader2,
    AlertCircle,
    Search,
    RefreshCw,
    CheckSquare
} from "lucide-react";
import { toast } from "sonner";

// [FIX] Menggunakan Subscription Service, bukan tembak axios langsung
import { subscriptionService } from "@/services/subscription.service";
import { getImageUrl } from "@/lib/utils";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// --- Types ---
interface PendingOrder {
    id: string;
    proofImageUrl: string;
    snapshotPrice: string | number;
    uniqueCode?: number;
    createdAt: string;
    verificationStatus: "PENDING" | "VALID" | "INVALID";
    plan: {
        name: string;
        price: string | number;
        durationMonths: number;
    };
    user: {
        id: string;
        fullName: string;
        email: string;
    };
}

export default function VerificationPage() {
    const [orders, setOrders] = useState<PendingOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // State untuk Modal Verifikasi Individual
    const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // State untuk Bulk Selection (Berlaku untuk Desktop & Mobile)
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

    // --- Fetch Data ---
    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const data = await subscriptionService.getPendingOrders();
            setOrders(data);
        } catch (error) {
            toast.error("Gagal memuat data pesanan");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // --- Filter Logic ---
    const filteredOrders = orders.filter((order) =>
        order.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.plan.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- Individual Verification Handler ---
    const handleVerify = async (status: "VALID" | "INVALID") => {
        if (!selectedOrder) return;

        if (status === "INVALID" && !adminNotes.trim()) {
            toast.warning("Mohon isi alasan penolakan pada catatan.");
            return;
        }

        setIsProcessing(true);
        try {
            await subscriptionService.verifyOrder({
                orderId: selectedOrder.id,
                status,
                adminNotes: adminNotes || undefined,
            });

            toast.success(
                status === "VALID"
                    ? "Pesanan berhasil disetujui ✅"
                    : "Pesanan berhasil ditolak ❌"
            );

            await fetchOrders();
            setSelectedOrder(null);
            setAdminNotes("");

            // Hapus dari daftar selection jika sebelumnya terpilih
            setSelectedOrderIds(prev => prev.filter(id => id !== selectedOrder.id));
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal memproses verifikasi");
        } finally {
            setIsProcessing(false);
        }
    };

    // --- Bulk Selection Logic ---
    const toggleOrderSelection = (id: string) => {
        setSelectedOrderIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedOrderIds(filteredOrders.map(order => order.id));
        } else {
            setSelectedOrderIds([]);
        }
    };

    // --- Bulk Verification Handler ---
    const handleBulkVerify = async (status: "VALID" | "INVALID") => {
        if (selectedOrderIds.length === 0) return;

        setIsProcessing(true);
        try {
            // [ENTERPRISE PATTERN] Tembak 1 kali ke backend endpoint /bulk-verify
            const result = await subscriptionService.bulkVerifyOrders({
                orderIds: selectedOrderIds,
                status,
                adminNotes: status === "INVALID" ? "Ditolak via Bulk Action Dashboard" : "Disetujui via Bulk Action Dashboard",
            });

            toast.success(`${result.successfulIds.length} pesanan berhasil ${status === "VALID" ? "disetujui" : "ditolak"}`);

            if (result.failed.length > 0) {
                toast.warning(`${result.failed.length} pesanan gagal diproses.`);
            }

            setSelectedOrderIds([]);
            setIsSelectMode(false);
            await fetchOrders();
        } catch (error: any) {
            toast.error("Terjadi kesalahan pada sistem saat memproses pesanan massal.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6 p-6 md:p-8 bg-slate-50/50 min-h-screen">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Verifikasi Pembayaran</h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        Validasi bukti transfer manual dari user untuk aktivasi paket PRO.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchOrders} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* METRIC CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Antrean Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-amber-500">{orders.length}</div>
                        <p className="text-xs text-slate-400 mt-1">Perlu tindakan segera</p>
                    </CardContent>
                </Card>
            </div>

            {/* MAIN CONTENT */}
            <Card className="border-slate-200 shadow-sm overflow-hidden mb-24 relative">
                <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Search className="w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Cari nama, email, atau paket..."
                            className="max-w-xs border-none bg-transparent shadow-none focus-visible:ring-0 p-0 text-sm w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Mobile Toggle Mode */}
                    <div className="md:hidden self-end">
                        <Button
                            variant={isSelectMode ? "secondary" : "outline"}
                            size="sm"
                            className={`rounded-full shadow-sm text-xs font-semibold px-4 transition-all ${isSelectMode ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200' : 'bg-white'}`}
                            onClick={() => {
                                setIsSelectMode(!isSelectMode);
                                if (isSelectMode) setSelectedOrderIds([]);
                            }}
                        >
                            {isSelectMode ? "Batal Pilih" : "Pilih Multi"}
                        </Button>
                    </div>
                </div>

                {/* DESKTOP VIEW: TABLE */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                {/* Header Checkbox */}
                                <TableHead className="w-[50px] text-center px-4">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                        checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                    />
                                </TableHead>
                                <TableHead className="w-50">User Info</TableHead>
                                <TableHead>Paket Langganan</TableHead>
                                <TableHead>Tanggal Order</TableHead>
                                <TableHead>Harga</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right pr-6">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            <span className="text-xs">Memuat data...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                                        Tidak ada pesanan pending saat ini.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredOrders.map((order) => {
                                    const isSelected = selectedOrderIds.includes(order.id);
                                    return (
                                        <TableRow key={order.id} className={`transition-colors ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50/50'}`}>
                                            <TableCell className="text-center px-4">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                                    checked={isSelected}
                                                    onChange={() => toggleOrderSelection(order.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col cursor-pointer" onClick={() => toggleOrderSelection(order.id)}>
                                                    <span className="font-bold text-slate-800">{order.user.fullName}</span>
                                                    <span className="text-xs text-slate-500">{order.user.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                                    {order.plan.name}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-600 text-sm">
                                                {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm", { locale: dateFnsId })}
                                            </TableCell>
                                            <TableCell className="font-mono text-slate-700 font-medium leading-tight">
                                                <div className="flex flex-col">
                                                    <span>Rp {(Number(order.snapshotPrice) + Number(order.uniqueCode || 0)).toLocaleString("id-ID")}</span>
                                                    <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                                                        +{order.uniqueCode || 0} Kode Unik
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                                                    PENDING
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button
                                                    size="sm"
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                                                >
                                                    <Eye className="w-4 h-4 mr-2" /> Periksa
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* MOBILE VIEW: CARD LIST */}
                <div className="md:hidden grid grid-cols-1 divide-y divide-slate-100 bg-white">
                    {isLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="text-xs">Memuat pesanan...</span>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 text-sm">
                            Tidak ada pesanan pending saat ini.
                        </div>
                    ) : (
                        filteredOrders.map((order) => {
                            const isSelected = selectedOrderIds.includes(order.id);
                            return (
                                <div
                                    key={order.id}
                                    onClick={() => {
                                        if (isSelectMode) {
                                            toggleOrderSelection(order.id);
                                        } else {
                                            setSelectedOrder(order);
                                        }
                                    }}
                                    className={`p-4 flex flex-col gap-3 relative transition-colors ${isSelectMode ? 'cursor-pointer active:bg-slate-50' : ''} ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50/50'}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            {isSelectMode && (
                                                <div className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                                    {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 text-sm">{order.user.fullName}</span>
                                                <span className="text-xs text-slate-500 truncate max-w-[180px]">{order.user.email}</span>
                                            </div>
                                        </div>
                                        {!isSelectMode && (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="bg-slate-100 hover:bg-slate-200 text-slate-800 shrink-0 h-8 rounded-full px-3 text-xs font-semibold"
                                            >
                                                Periksa
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between w-full mt-1">
                                        <div className="flex flex-col gap-1">
                                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 inline-flex w-fit text-[10px]">
                                                {order.plan.name}
                                            </Badge>
                                            <span className="text-[11px] text-slate-500">
                                                {format(new Date(order.createdAt), "dd MMM yy, HH:mm", { locale: dateFnsId })}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-mono font-bold text-slate-900 text-sm">
                                                Rp {(Number(order.snapshotPrice) + Number(order.uniqueCode || 0)).toLocaleString("id-ID")}
                                            </span>
                                            <span className="text-[9px] font-bold text-emerald-600 block mb-0.5">+{order.uniqueCode || 0} Kode Unik</span>
                                            <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-widest mt-0.5 block">PENDING</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </Card>

            {/* UNIFIED FLOATING ACTION BAR FOR BULK ACTIONS (Desktop & Mobile) */}
            {selectedOrderIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-50 px-6 py-4 bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl rounded-full flex items-center justify-between gap-4 animate-in slide-in-from-bottom-8">
                    <div className="flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-indigo-400" />
                        <span className="text-sm font-bold text-white">
                            {selectedOrderIds.length} Terpilih
                        </span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="hidden md:flex text-slate-300 hover:text-white"
                            onClick={() => {
                                setSelectedOrderIds([]);
                                setIsSelectMode(false);
                            }}
                            disabled={isProcessing}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-full shadow-sm text-xs font-semibold px-4 h-9"
                            onClick={() => handleBulkVerify("INVALID")}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="w-3 h-3 animate-spin md:mr-2" /> : null}
                            <span className="hidden md:inline">Tolak Massal</span>
                            <span className="md:hidden ml-1">Tolak</span>
                        </Button>
                        <Button
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-sm text-xs font-semibold px-4 h-9"
                            onClick={() => handleBulkVerify("VALID")}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="w-3 h-3 animate-spin md:mr-2" /> : null}
                            <span className="hidden md:inline">Setujui Massal</span>
                            <span className="md:hidden ml-1">Setujui</span>
                        </Button>
                    </div>
                </div>
            )}

            {/* MODAL: VERIFICATION DETAIL */}
            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Audit Bukti Pembayaran</DialogTitle>
                        <DialogDescription>
                            Periksa detail transfer dan sesuaikan dengan mutasi bank Anda.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="grid gap-6 py-4">
                            {/* Image Preview dengan Helper URL */}
                            <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative group min-h-[200px] flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={getImageUrl(selectedOrder.proofImageUrl)}
                                    alt="Bukti Transfer"
                                    className="w-full h-auto max-h-[400px] object-contain transition-transform group-hover:scale-105"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/images/placeholder.png";
                                    }}
                                />
                                <a
                                    href={getImageUrl(selectedOrder.proofImageUrl)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full hover:bg-black transition-colors"
                                >
                                    Buka Gambar Asli ↗
                                </a>
                            </div>

                            {/* Detail Info Grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Nama User</span>
                                    <p className="font-medium text-slate-900">{selectedOrder.user.fullName}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Nominal Persis</span>
                                    <p className="font-medium text-slate-900 text-base">
                                        Rp {(Number(selectedOrder.snapshotPrice) + Number(selectedOrder.uniqueCode || 0)).toLocaleString("id-ID")}
                                    </p>
                                    <p className="text-[10px] text-emerald-600 font-bold">Kode Unik (+{selectedOrder.uniqueCode || 0})</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Paket</span>
                                    <p className="font-medium text-slate-900">{selectedOrder.plan.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Waktu Upload</span>
                                    <p className="font-medium text-slate-900">
                                        {format(new Date(selectedOrder.createdAt), "eeee, dd MMMM yyyy - HH:mm", { locale: dateFnsId })}
                                    </p>
                                </div>
                            </div>

                            {/* Admin Input */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">Catatan Admin (Wajib jika Ditolak)</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Contoh: Bukti transfer buram, nominal tidak sesuai, dll."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="resize-none h-24"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="destructive"
                                    className="flex-1 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                    onClick={() => handleVerify("INVALID")}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                                    Tolak (Reject)
                                </Button>
                                <Button
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() => handleVerify("VALID")}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                    Setujui (Approve)
                                </Button>
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-start border border-blue-100">
                                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    <strong>Note:</strong> Menyetujui akan mengubah kuota user menjadi UNLIMITED. Menolak akan mencabut akses PRO dan mengembalikan kuota ke status FREE. User akan menerima notifikasi otomatis.
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="sm:justify-start">
                        <Button type="button" variant="ghost" onClick={() => setSelectedOrder(null)} disabled={isProcessing}>
                            Tutup Detail
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}