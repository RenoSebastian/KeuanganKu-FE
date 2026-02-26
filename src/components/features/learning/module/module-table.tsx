"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    Eye,
    BookOpen,
    Archive,
    Clock,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// Custom Feature Components
import { StatusBadge } from "../../admin/education/status-badge";
import { DeleteModuleDialog } from "../../admin/education/delete-module-dialog";

// Services & Types
import { educationService } from "@/services/education.service";
import { EducationModule, EducationModuleStatus } from "@/lib/types/education";

export function ModuleTable() {
    const router = useRouter();

    // --- State Management ---
    const [data, setData] = useState<EducationModule[]>([]);
    const [loading, setLoading] = useState(true);

    // Delete State
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteTitle, setDeleteTitle] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    // --- Data Fetching ---
    const fetchData = async () => {
        try {
            setLoading(true);
            // Mengambil data modul khusus admin (termasuk Draft & Archived)
            const modules = await educationService.getModulesAdmin();
            setData(modules);
        } catch (error) {
            console.error("Failed to fetch modules:", error);
            toast.error("Gagal memuat data modul. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Actions Handlers ---

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            setIsDeleting(true);
            await educationService.deleteModule(deleteId);
            toast.success("Modul berhasil dihapus");
            setDeleteId(null);
            fetchData(); // Refresh table data
        } catch (error: any) {
            console.error("Delete error:", error);
            // Menangani error FK constraint (P2003) jika modul sudah pernah dikerjakan user
            const msg = error.response?.data?.message || "Gagal menghapus modul. Mungkin sedang digunakan.";
            toast.error(msg);
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePublish = async (id: string) => {
        const loadingToast = toast.loading("Menerbitkan modul...");
        try {
            await educationService.publishModule(id);
            toast.dismiss(loadingToast);
            toast.success("Modul berhasil diterbitkan dan live untuk user.");
            fetchData();
        } catch (error: any) {
            toast.dismiss(loadingToast);
            // Menangani validasi BE: "Cannot publish module without sections"
            const msg = error.response?.data?.message || "Gagal menerbitkan modul.";
            toast.error(msg);
        }
    };

    const handleUnpublish = async (id: string) => {
        try {
            await educationService.unpublishModule(id);
            toast.success("Modul ditarik kembali ke Draft.");
            fetchData();
        } catch (error) {
            toast.error("Gagal mengubah status modul.");
        }
    };

    // --- Render Helpers ---

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-gray-50/50">
                <div className="bg-blue-50 p-4 rounded-full mb-4">
                    <BookOpen className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Belum ada Modul</h3>
                <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
                    Mulai buat materi edukasi untuk meningkatkan literasi keuangan pegawai Anda.
                </p>
                <Link href="/admin/education/create">
                    <Button>
                        Buat Modul Baru
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead className="w-87.5">Modul</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Level & Durasi</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Terakhir Update</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((module) => (
                            <TableRow key={module.id} className="hover:bg-gray-50/50 transition-colors">
                                {/* 1. Modul Title & Excerpt */}
                                <TableCell className="align-top py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-semibold text-gray-900 line-clamp-1" title={module.title}>
                                            {module.title}
                                        </span>
                                        <span className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {module.excerpt}
                                        </span>
                                    </div>
                                </TableCell>

                                {/* 2. Category Badge */}
                                <TableCell className="align-top py-4">
                                    {module.category ? (
                                        <Badge variant="outline" className="font-normal whitespace-nowrap">
                                            {module.category.name}
                                        </Badge>
                                    ) : (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Badge variant="danger" className="font-normal">
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        Kategori Hilang
                                                    </Badge>
                                                </TooltipTrigger>
                                                <TooltipContent>Kategori ini mungkin telah dihapus.</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </TableCell>

                                {/* 3. Level & Reading Time */}
                                <TableCell className="align-top py-4">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                                            {module.level}
                                        </span>
                                        {/* SESUDAH: Gunakan readingTime sesuai DTO */}
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {module.readingTime || 0} Menit
                                        </div>
                                    </div>
                                </TableCell>

                                {/* 4. Status */}
                                <TableCell className="align-top py-4">
                                    <StatusBadge status={module.status} />
                                </TableCell>

                                {/* 5. Updated At */}
                                <TableCell className="align-top py-4 text-sm text-muted-foreground">
                                    {format(new Date(module.updatedAt), "d MMM yyyy", { locale: idLocale })}
                                </TableCell>

                                {/* 6. Action Menu */}
                                <TableCell className="align-top py-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <DropdownMenuLabel className="text-xs text-muted-foreground">Navigasi Editor</DropdownMenuLabel>

                                            <DropdownMenuItem onClick={() => router.push(`/admin/education/${module.id}/edit`)}>
                                                <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                                                Edit Header & Cover
                                            </DropdownMenuItem>

                                            <DropdownMenuItem onClick={() => router.push(`/admin/education/${module.id}/content`)}>
                                                <BookOpen className="mr-2 h-4 w-4 text-orange-500" />
                                                Kelola Materi & Bab
                                            </DropdownMenuItem>

                                            <DropdownMenuItem onClick={() => router.push(`/admin/education/${module.id}/quiz`)}>
                                                <Eye className="mr-2 h-4 w-4 text-purple-500" />
                                                Kelola Kuis
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator />

                                            <DropdownMenuLabel className="text-xs text-muted-foreground">Status & Zona Bahaya</DropdownMenuLabel>

                                            {module.status === EducationModuleStatus.DRAFT && (
                                                <DropdownMenuItem onClick={() => handlePublish(module.id)}>
                                                    <Eye className="mr-2 h-4 w-4 text-green-600" />
                                                    Terbitkan (Publish)
                                                </DropdownMenuItem>
                                            )}

                                            {module.status === EducationModuleStatus.PUBLISHED && (
                                                <DropdownMenuItem onClick={() => handleUnpublish(module.id)}>
                                                    <Archive className="mr-2 h-4 w-4 text-amber-600" />
                                                    Tarik ke Draft
                                                </DropdownMenuItem>
                                            )}

                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                onClick={() => {
                                                    setDeleteId(module.id);
                                                    setDeleteTitle(module.title);
                                                }}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Hapus Modul
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Dialog Konfirmasi Hapus */}
            <DeleteModuleDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                moduleTitle={deleteTitle}
            />
        </>
    );
}