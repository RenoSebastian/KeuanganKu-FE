'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { QuizBuilder } from '@/components/features/admin/education/quiz/quiz-builder';
// [FIX] Gunakan educationService sesuai export di file service
import { educationService } from '@/services/education.service';

export default function ManageQuizPage() {
    const params = useParams();
    const moduleId = typeof params?.id === 'string' ? params.id : '';

    const [initialData, setInitialData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!moduleId) return;

        const loadQuizData = async () => {
            try {
                setLoading(true);
                // [FIX] Gunakan method getQuizConfiguration (bukan getQuizConfig)
                const data = await educationService.getQuizConfiguration(moduleId);
                setInitialData(data);
            } catch (error: any) {
                // Jika 404 (Quiz belum ada), biarkan initialData null agar QuizBuilder masuk mode create
                if (error.response?.status !== 404) {
                    console.error("Failed to load quiz config:", error);
                }
            } finally {
                setLoading(false);
            }
        };

        loadQuizData();
    }, [moduleId]);

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center min-h-100">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Kuis Interaktif</h2>
                <p className="text-muted-foreground">
                    Kelola pertanyaan, opsi jawaban, dan pengaturan skor untuk modul ini.
                </p>
            </div>

            <div className="mt-4 border rounded-lg bg-white shadow-sm overflow-hidden">
                {moduleId ? (
                    <QuizBuilder
                        moduleId={moduleId}
                        initialData={initialData}
                        onSave={() => window.location.reload()}
                    />
                ) : (
                    <div className="p-8 text-center text-red-500">
                        Module ID tidak valid.
                    </div>
                )}
            </div>
        </div>
    );
}
