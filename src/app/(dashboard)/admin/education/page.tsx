import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Tags } from 'lucide-react';
import { ModuleTable } from '@/components/features/admin/education/module-table';
import { CategoryList } from '@/components/features/learning/category/category-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata: Metadata = {
    title: 'Manajemen Edukasi | Admin KeuanganKu',
    description: 'Kelola materi pembelajaran, kategori, dan kuis untuk pengguna.',
};

export default function EducationAdminPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Edukasi Keuangan</h2>
                    <p className="text-muted-foreground">
                        Kelola modul pembelajaran, kuis interaktif, dan kategori edukasi.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="modules" className="space-y-6">
                <TabsList className="grid w-full sm:w-100 grid-cols-2">
                    <TabsTrigger value="modules" className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Modul Materi
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="flex items-center gap-2">
                        <Tags className="w-4 h-4" /> Kategori
                    </TabsTrigger>
                </TabsList>

                {/* --- TAB: MODUL MATERI --- */}
                <TabsContent value="modules" className="space-y-4 outline-none">
                    <div className="flex justify-end">
                        <Link href="/admin/education/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Tambah Modul
                            </Button>
                        </Link>
                    </div>
                    <div className="mt-2">
                        <ModuleTable />
                    </div>
                </TabsContent>

                {/* --- TAB: KATEGORI --- */}
                <TabsContent value="categories" className="outline-none">
                    <CategoryList />
                </TabsContent>
            </Tabs>
        </div>
    );
}