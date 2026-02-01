'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, BookOpenCheck } from 'lucide-react';
import { ModuleGrid } from '@/components/features/education/catalog/module-grid';
import { employeeEducationService } from '@/services/employee-education.service';
import { EducationModule, EducationCategory } from '@/lib/types/education';
import { toast } from 'sonner';

// Note: Metadata export tidak bisa di 'use client', jadi kita skip export metadata di file ini
// atau pindahkan ke layout.tsx jika perlu title dinamis.

export default function LearningCatalogPage() {
    const [modules, setModules] = useState<EducationModule[]>([]);
    const [categories, setCategories] = useState<EducationCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    // Fetch Data on Mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // Parallel Fetching untuk performa
                const [modulesRes, categoriesRes] = await Promise.all([
                    employeeEducationService.getCatalog({ limit: 100 }), // Fetch initial batch
                    employeeEducationService.getCategories()
                ]);

                setModules(modulesRes.data);
                setCategories(categoriesRes);
            } catch (error) {
                console.error("Failed to load catalog:", error);
                toast.error("Gagal memuat katalog pembelajaran. Periksa koneksi internet Anda.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter Logic (Client Side for instant feedback on small datasets)
    // Untuk dataset besar, logic ini harus dipindah ke Server Side (API Params)
    const filteredModules = modules.filter(m => {
        const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory ? m.category.id === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 min-h-screen bg-gray-50/30">

            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <BookOpenCheck className="w-8 h-8 text-primary" />
                        Pusat Pembelajaran
                    </h2>
                    <p className="text-muted-foreground">
                        Tingkatkan kompetensi Anda melalui modul dan kuis interaktif.
                    </p>
                </div>

                {/* Summary Stats (Optional Placeholder) */}
                <div className="hidden md:flex gap-4 text-sm">
                    <div className="px-4 py-2 bg-white rounded-lg border shadow-sm">
                        <span className="block font-bold text-xl text-primary">{modules.length}</span>
                        <span className="text-muted-foreground">Total Modul</span>
                    </div>
                </div>
            </div>

            {/* --- TOOLBAR SECTION --- */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border shadow-sm sticky top-4 z-10">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Cari materi pembelajaran..."
                        className="pl-9 bg-gray-50 border-transparent focus:bg-white transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                    <Button
                        variant={selectedCategory === '' ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory('')}
                        className="whitespace-nowrap"
                    >
                        Semua
                    </Button>
                    {categories.map((cat) => (
                        <Button
                            key={cat.id}
                            variant={selectedCategory === cat.id ? "primary" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(cat.id)}
                            className="whitespace-nowrap"
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* --- GRID SECTION --- */}
            <ModuleGrid
                modules={filteredModules}
                isLoading={isLoading}
            />

        </div>
    );
}