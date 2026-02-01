'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'; // Asumsi shadcn table ada
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, Eye, FileText } from 'lucide-react';
import { EducationModule, EducationModuleStatus } from '@/lib/types/education';
import { StatusBadge } from './status-badge';
import { DeleteModuleDialog } from './delete-module-dialog';
import { publicEducationService, adminEducationService } from '@/services/education.service';
import { toast } from 'sonner'; // Atau library toast yang Anda pakai

export function ModuleTable() {
    const router = useRouter();
    const [data, setData] = useState<EducationModule[]>([]);
    const [loading, setLoading] = useState(true);

    // State untuk Delete Dialog
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteTitle, setDeleteTitle] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            // NOTE: Menggunakan public service sementara. 
            // Idealnya BE punya endpoint khusus admin (GET /admin/education/modules) untuk liat Draft.
            // Jika endpoint public memfilter draft, ganti ini nanti.
            const response = await publicEducationService.getModules({ limit: 100 });
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch modules:', error);
            toast.error('Gagal memuat data modul');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            setIsDeleting(true);
            await adminEducationService.deleteModule(deleteId);
            toast.success('Modul berhasil dihapus');
            setDeleteId(null);
            fetchData(); // Refresh list
        } catch (error) {
            toast.error('Gagal menghapus modul');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: EducationModuleStatus) => {
        try {
            await adminEducationService.updateStatus(id, { status: newStatus });
            toast.success(`Status diubah menjadi ${newStatus}`);
            fetchData();
        } catch (error) {
            toast.error('Gagal mengubah status');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Memuat data modul...</div>; // Bisa diganti Skeleton UI
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-gray-50">
                <FileText className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Belum ada Modul</h3>
                <p className="text-gray-500 mb-4">Mulai buat materi edukasi untuk pegawai.</p>
                <Link href="/admin/education/create">
                    <Button>Buat Modul Baru</Button>
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Judul Modul</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Waktu Baca</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((module) => (
                            <TableRow key={module.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{module.title}</span>
                                        <span className="text-xs text-gray-500 truncate max-w-75">
                                            {module.excerpt}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>{module.category.name}</TableCell>
                                <TableCell>
                                    <StatusBadge status={module.status} />
                                </TableCell>
                                <TableCell>{module.readingTime} Menit</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>

                                            <Link href={`/admin/education/${module.id}/edit`}>
                                                <DropdownMenuItem>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit Materi
                                                </DropdownMenuItem>
                                            </Link>

                                            <Link href={`/admin/education/${module.id}/quiz`}>
                                                <DropdownMenuItem>
                                                    <FileText className="mr-2 h-4 w-4" /> Kelola Kuis
                                                </DropdownMenuItem>
                                            </Link>

                                            {/* Quick Status Actions */}
                                            {module.status === EducationModuleStatus.DRAFT && (
                                                <DropdownMenuItem onClick={() => handleStatusChange(module.id, EducationModuleStatus.PUBLISHED)}>
                                                    <Eye className="mr-2 h-4 w-4" /> Terbitkan (Publish)
                                                </DropdownMenuItem>
                                            )}

                                            {module.status === EducationModuleStatus.PUBLISHED && (
                                                <DropdownMenuItem onClick={() => handleStatusChange(module.id, EducationModuleStatus.ARCHIVED)}>
                                                    <FileText className="mr-2 h-4 w-4" /> Arsipkan
                                                </DropdownMenuItem>
                                            )}

                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-600"
                                                onClick={() => {
                                                    setDeleteId(module.id);
                                                    setDeleteTitle(module.title);
                                                }}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

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