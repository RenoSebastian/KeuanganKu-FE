'use client';

import { useEffect, useState, use } from 'react';
import { ModuleForm } from '@/components/features/admin/education/form/module-form';
// Import adminEducationService untuk mengambil data modul/materi
import { adminEducationService } from '@/services/education.service';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Interface props disesuaikan dengan standar Next.js terbaru
 * params didefinisikan sebagai Promise
 */
interface EditModulePageProps {
    params: Promise<{ id: string }>;
}

export default function EditModulePage({ params }: EditModulePageProps) {
    // 1. Unwrap params menggunakan React.use() untuk mendapatkan ID dari URL
    const resolvedParams = use(params);
    const moduleId = resolvedParams.id;

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        /**
         * Mengambil data modul berdasarkan ID.
         * Menggunakan educationService.getModuleById sesuai definisi di service.
         */
        const fetchData = async () => {
            try {
                setLoading(true);
                // adminEducationService memiliki method getModuleById untuk fetching detail
                const res = await adminEducationService.getModuleById(moduleId);
                setData(res);
            } catch (err: any) {
                console.error("Fetch Error:", err);
                toast.error("Gagal memuat data modul: " + (err.message || "Unknown error"));
            } finally {
                setLoading(false);
            }
        };

        if (moduleId) {
            fetchData();
        }
    }, [moduleId]);

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Jika data tidak ditemukan setelah loading selesai
    if (!data && !loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <p className="text-muted-foreground">Modul tidak ditemukan.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Edit Materi</h2>
            {/* Prop 'isEditing' dihapus karena tidak ada di interface ModuleFormProps.
               Cukup kirimkan initialData, form akan mendeteksi mode edit jika data ada.
            */}
            <ModuleForm initialData={data} />
        </div>
    );
}