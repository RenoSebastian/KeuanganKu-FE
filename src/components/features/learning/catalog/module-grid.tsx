'use client';

import { EducationModule } from '@/lib/types/education';
import { ModuleCard } from './module-card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookX } from 'lucide-react';

interface ModuleGridProps {
    modules: EducationModule[];
    isLoading: boolean;
}

export function ModuleGrid({ modules, isLoading }: ModuleGridProps) {

    // --- LOADING STATE ---
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="h-48 w-full rounded-xl" />
                        <div className="space-y-2 p-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <div className="pt-4">
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // --- EMPTY STATE ---
    if (modules.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed rounded-lg bg-gray-50/50">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <BookX className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Belum ada materi tersedia</h3>
                <p className="text-sm text-gray-500 max-w-sm mt-2">
                    Saat ini belum ada modul pembelajaran yang diterbitkan. Silakan cek kembali nanti.
                </p>
            </div>
        );
    }

    // --- DATA GRID ---
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-500">
            {modules.map((module) => (
                <ModuleCard key={module.id} module={module} />
            ))}
        </div>
    );
}