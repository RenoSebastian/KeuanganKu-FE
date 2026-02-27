'use client';

/**
 * [EMERGENCY MAINTENANCE MODE]
 * Halaman ini sedang di-hardcode ke status Maintenance.
 * Untuk mengembalikan ke fungsi normal, hapus blok 'Early Return' di bawah.
 */

import { SystemStateDisplay } from "@/components/shared/system-state-display";

// Kita tetap import yang lain agar tidak error saat dikembalikan nanti
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, BookOpenCheck } from 'lucide-react';
import { ModuleGrid } from '@/components/features/learning/catalog/module-grid';
import { employeeEducationService } from '@/services/employee-education.service';
import { EducationModule, EducationCategory } from '@/lib/types/education';
import { toast } from 'sonner';

export default function LearningCatalogPage() {
    // --- 1. BLOCK: HARDCODED MAINTENANCE ---
    // Baris ini akan langsung memotong alur render dan menampilkan UI Safety Net kita.
    return <SystemStateDisplay type="MAINTENANCE" />;

    /** * --- 2. ORIGINAL LOGIC (DIPOTONG) ---
     * Kode di bawah ini tidak akan pernah dieksekusi selama 'return' di atas aktif.
     */
    const [modules, setModules] = useState<EducationModule[]>([]);
    const [categories, setCategories] = useState<EducationCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [modulesRes, categoriesRes] = await Promise.all([
                    employeeEducationService.getCatalog({ limit: 100 }),
                    employeeEducationService.getCategories()
                ]);
                setModules(modulesRes.data);
                setCategories(categoriesRes);
            } catch (error) {
                console.error("Failed to load catalog:", error);
                toast.error("Gagal memuat katalog pembelajaran.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredModules = modules.filter(m => {
        const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory ? m.categoryId === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 min-h-screen bg-gray-50/30">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <BookOpenCheck className="w-8 h-8 text-primary" />
                        Pusat Pembelajaran
                    </h2>
                    <p className="text-muted-foreground">Tingkatkan kompetensi Anda.</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border shadow-sm sticky top-4 z-10">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Cari materi..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
            </div>

            <ModuleGrid modules={filteredModules} isLoading={isLoading} />
        </div>
    );
}