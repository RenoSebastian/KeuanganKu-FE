'use client';

import { ModuleForm } from '@/components/features/admin/education/form/module-form';

export default function CreateModulePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Buat Materi Baru</h2>
      </div>
      
      {/* Render ModuleForm tanpa props 'initialData'.
        Komponen ini akan otomatis mendeteksi mode 'Create' 
        dan menangani mapping payload sesuai DTO terbaru.
      */}
      <ModuleForm />
    </div>
  );
}
