"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    FolderOpen,
    MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// Custom Components
import { CategoryFormDialog } from "./category-form-dialog";
import { DeleteCategoryDialog } from "./delete-category-dialog";

// Services & Types
import { educationService } from "@/services/education.service";
import { EducationCategory } from "@/lib/types/education";

export function CategoryList() {
    // --- State Management ---
    const [data, setData] = useState<EducationCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Dialog States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<EducationCategory | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // --- Data Fetching ---
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const categories = await educationService.getCategories();
            setData(categories);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Gagal memuat data kategori.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // --- Filter Logic (Client-Side for Categories) ---
    // Kategori biasanya jumlahnya sedikit (< 50), jadi client-side filter lebih efisien daripada request DB baru.
    const filteredData = data.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- Helper: Image URL Resolver ---
    const getIconUrl = (path: string) => {
        if (path.startsWith("http")) return path;
        // Asumsi: Base URL API sudah dikonfigurasi di ENV atau Proxy
        // Jika path dari BE adalah "uploads/icon.png", kita tambahkan prefix API
        return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/${path}`;
    };

    // --- Render Helpers ---
    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between">
                    <Skeleton className="h-10 w-50" />
                    <Skeleton className="h-10 w-25" />
                </div>
                <div className="rounded-md border bg-white p-4 space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-lg" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-[30%]" />
                                <Skeleton className="h-3 w-[20%]" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* --- Toolbar Section --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari kategori..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
                </Button>
            </div>

            {/* --- Table Section --- */}
            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead className="w-20">Icon</TableHead>
                            <TableHead>Nama Kategori</TableHead>
                            <TableHead>Jumlah Modul</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Dibuat Pada</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <FolderOpen className="h-8 w-8 mb-2 opacity-50" />
                                        <p>Tidak ada kategori ditemukan.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((category) => (
                                <TableRow key={category.id} className="hover:bg-gray-50/50">
                                    <TableCell>
                                        <div className="relative h-10 w-10 overflow-hidden rounded-lg border bg-gray-100">
                                            <Image
                                                src={getIconUrl(category.iconUrl)}
                                                alt={category.name}
                                                fill
                                                className="object-cover"
                                                sizes="40px"
                                                onError={(e) => {
                                                    // Fallback jika gambar rusak (opsional)
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{category.name}</span>
                                            <span className="text-xs text-muted-foreground font-normal">
                                                /{category.slug}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-normal">
                                            {category._count?.modules || 0} Modul
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {category.isActive ? (
                                            <Badge className="bg-green-500 hover:bg-green-600">Aktif</Badge>
                                        ) : (
                                            <Badge variant="danger">Non-Aktif</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {format(new Date(category.createdAt), "d MMM yyyy", { locale: idLocale })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => setEditingCategory(category)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                    onClick={() => setDeletingId(category.id)}
                                                    disabled={category._count?.modules ? category._count.modules > 0 : false}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* --- Dialogs Integration --- */}

            {/* Dialog Create */}
            <CategoryFormDialog
                open={isCreateOpen}
                // [FIX] Explicit type for boolean callback
                onOpenChange={(open: boolean) => setIsCreateOpen(open)}
                onSuccess={() => {
                    setIsCreateOpen(false);
                    fetchCategories();
                    toast.success("Kategori berhasil dibuat");
                }}
            />

            {/* Dialog Edit */}
            {editingCategory && (
                <CategoryFormDialog
                    open={!!editingCategory}
                    // [FIX] Explicit type for boolean callback
                    onOpenChange={(open: boolean) => !open && setEditingCategory(null)}
                    initialData={editingCategory}
                    onSuccess={() => {
                        setEditingCategory(null);
                        fetchCategories();
                        toast.success("Kategori berhasil diperbarui");
                    }}
                />
            )}

            {/* Dialog Delete */}
            <DeleteCategoryDialog
                open={!!deletingId}
                // [FIX] Explicit type for boolean callback
                onOpenChange={(open: boolean) => !open && setDeletingId(null)}
                categoryId={deletingId || ""}
                onSuccess={() => {
                    setDeletingId(null);
                    fetchCategories();
                    toast.success("Kategori berhasil dihapus");
                }}
            />
        </div>
    );
}