import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ModuleTable } from '@/components/features/admin/education/module-table';

export const metadata: Metadata = {
    title: 'Manajemen Edukasi | Admin KeuanganKu',
    description: 'Kelola materi pembelajaran dan kuis untuk pegawai.',
};

export default function EducationAdminPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Modul Edukasi</h2>
                    <p className="text-muted-foreground">
                        Buat, kelola, dan pantau materi pembelajaran serta kuis interaktif.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Link href="/admin/education/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Modul
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Table Container */}
            <div className="mt-4">
                <ModuleTable />
            </div>
        </div>
    );
}