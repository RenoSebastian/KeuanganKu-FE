'use client';

import { useEffect, useState } from 'react';
import { ModuleForm } from '@/components/features/admin/education/form/module-form';
import { publicEducationService } from '@/services/education.service';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EditModulePage({ params }: { params: { id: string } }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Note: Kita butuh endpoint GetById. 
        // Jika Public API pakai Slug, kita perlu Endpoint Admin GetById.
        // Asumsi: Backend sudah menyediakan /education/modules/{id} atau kita fetch list filter client side (fallback).
        // Untuk efisiensi, saya asumsikan ada endpoint getModuleById di service.

        // WORKAROUND: Fetch single module via Admin Service (perlu ditambahkan di service jika belum ada)
        // atau gunakan public service jika ID didukung.

        // Simulasi Logic Fetching (Replace with actual Service call)
        const fetchData = async () => {
            try {
                // Karena endpoint public by Slug, kita mungkin perlu cari slug-nya dulu atau adjust endpoint BE.
                // Untuk sekarang, kita asumsikan ID bisa dipakai atau Anda sudah menyesuaikan BE.
                // const res = await adminEducationService.getModuleById(params.id); 
                // setData(res);
                setLoading(false); // Placeholder
            } catch (err) {
                toast.error("Gagal memuat data modul");
            }
        };

        fetchData();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Edit Materi</h2>
            <ModuleForm initialData={data} />
        </div>
    );
}