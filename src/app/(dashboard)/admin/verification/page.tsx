"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
    CheckCircle,
    XCircle,
    Eye,
    Loader2,
    AlertCircle,
    Search,
    RefreshCw
} from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";
// [FIX] Import helper getImageUrl
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

    // State untuk Modal Verifikasi
    const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // --- Fetch Data ---
    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const response = await api.get<PendingOrder[]>("/admin/subscription/orders");
            setOrders(response.data);
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

    // --- Action Handlers ---
    const handleVerify = async (status: "VALID" | "INVALID") => {
        if (!selectedOrder) return;

        if (status === "INVALID" && !adminNotes.trim()) {
            toast.warning("Mohon isi alasan penolakan pada catatan.");
            return;
        }

        setIsProcessing(true);
        try {
            await api.patch("/admin/subscription/verify", {
                orderId: selectedOrder.id,
                status,
                adminNotes: adminNotes || undefined,
            });

            toast.success(
                status === "VALID"
                    ? "Pesanan berhasil disetujui ✅"
                    : "Pesanan berhasil ditolak ❌"
            );

            // Refresh Data & Close Modal
            await fetchOrders();
            setSelectedOrder(null);
            setAdminNotes("");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal memproses verifikasi");
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

            {/* METRIC CARDS (Optional Summary) */}
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

            {/* MAIN CONTENT: TABLE */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-white flex items-center gap-3">
                    <Search className="w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Cari nama, email, atau paket..."
                        className="max-w-xs border-none bg-transparent shadow-none focus-visible:ring-0 p-0 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-50">User Info</TableHead>
                            <TableHead>Paket Langganan</TableHead>
                            <TableHead>Tanggal Order</TableHead>
                            <TableHead>Harga</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span className="text-xs">Memuat data...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                    Tidak ada pesanan pending saat ini.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrders.map((order) => (
                                <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col">
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
                                        {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
                                    </TableCell>
                                    <TableCell className="font-mono text-slate-700 font-medium">
                                        Rp {Number(order.snapshotPrice).toLocaleString("id-ID")}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                                            PENDING
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            onClick={() => setSelectedOrder(order)}
                                            className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                                        >
                                            <Eye className="w-4 h-4 mr-2" /> Periksa
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

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
                            {/* [FIX] Image Preview dengan Helper URL */}
                            <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative group min-h-50 flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={getImageUrl(selectedOrder.proofImageUrl)}
                                    alt="Bukti Transfer"
                                    className="w-full h-auto max-h-100 object-contain transition-transform group-hover:scale-105"
                                    onError={(e) => {
                                        // Fallback ke placeholder jika gambar rusak/404
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
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Nominal Tagihan</span>
                                    <p className="font-medium text-slate-900">Rp {Number(selectedOrder.snapshotPrice).toLocaleString("id-ID")}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Paket</span>
                                    <p className="font-medium text-slate-900">{selectedOrder.plan.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Waktu Upload</span>
                                    <p className="font-medium text-slate-900">
                                        {format(new Date(selectedOrder.createdAt), "eeee, dd MMMM yyyy - HH:mm", { locale: id })}
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
                                    <strong>Note:</strong> Menyetujui akan mengubah kuota user menjadi UNLIMITED. Menolak akan mencabut akses PRO dan mengembalikan kuota ke status FREE (3 token). User akan menerima notifikasi otomatis.
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="sm:justify-start">
                        <Button type="button" variant="ghost" onClick={() => setSelectedOrder(null)} disabled={isProcessing}>
                            Batal
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}