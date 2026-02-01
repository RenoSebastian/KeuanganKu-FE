import { Metadata } from 'next';
import { ModuleForm } from '@/components/features/admin/education/form/module-form';

export const metadata: Metadata = {
    title: 'Buat Modul Baru | Admin KeuanganKu',
};

export default function CreateModulePage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Buat Materi Baru</h2>
            </div>
            <ModuleForm />
        </div>
    );
}