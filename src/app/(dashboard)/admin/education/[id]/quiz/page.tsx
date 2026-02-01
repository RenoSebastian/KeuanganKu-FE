'use client'; // [CRITICAL] Wajib di baris pertama untuk menggunakan Hooks

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { QuizBuilder } from '@/components/features/admin/education/quiz/quiz-builder';
import { adminEducationService } from '@/services/education.service';

export default function ManageQuizPage() {
    // 1. Ambil ID dari URL menggunakan useParams (Client Side Way)
    const params = useParams();
    // Validasi ID (bisa string atau array tergantung konfigurasi route)
    const moduleId = typeof params?.id === 'string' ? params.id : '';

    const [initialData, setInitialData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // 2. Fetch Data Quiz saat komponen dimuat
    useEffect(() => {
        if (!moduleId) return;

        const loadQuizData = async () => {
            try {
                setLoading(true);
                // Menggunakan service yang sudah diperbarui di step sebelumnya
                const data = await adminEducationService.getQuizConfig(moduleId);
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

    // 3. Render Loading State
    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center min-h-100">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // 4. Render Main Content
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
                        // Optional: Tambahkan callback jika ingin refresh data setelah save
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