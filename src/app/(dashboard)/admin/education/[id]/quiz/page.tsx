import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { QuizBuilder } from '@/components/features/admin/education/quiz/quiz-builder';
import { publicEducationService } from '@/services/education.service'; // Atau service admin getById jika sudah dibuat

interface PageProps {
    params: { id: string };
}

export const metadata: Metadata = {
    title: 'Kelola Kuis | Admin KeuanganKu',
};

export default async function ManageQuizPage({ params }: PageProps) {
    // NOTE: Di Backend, kita perlu endpoint getById yang mereturn relation `quiz`
    // Jika endpoint public belum include quiz detail (soal+opsi), kita harus buat endpoint khusus admin.
    // Asumsi: Kita pakai endpoint detail module yang sudah ada, tapi pastikan include quiz.

    // WORKAROUND SEMENTARA (Client Fetch di dalam Server Component jika endpoint BE belum include quiz detail):
    // Idealnya BE: AdminEducationController.findOne(id) -> include quiz.
    // Disini kita simulasikan fetching atau gunakan service yang ada.

    // Karena struktur FE Service 'publicEducationService.getModuleBySlug' pakai slug,
    // sedangkan URL kita pakai ID, kita perlu adjustment sedikit di service atau routing.
    // Mari asumsikan kita punya `adminEducationService.getModuleById(params.id)`
    // Jika belum, kita bisa fetch module list dulu filter by ID (inefisien) atau fix BE endpoint.

    // [CRITICAL FIX]: Saya akan menggunakan pendekatan client-side fetch di dalam wrapper component
    // jika Anda belum membuat endpoint spesifik `GET /admin/modules/:id` yang lengkap.
    // Tapi untuk clean code, kita anggap endpoint itu ada.

    // Code di bawah ini adalah skeleton Server Component.

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Kuis Interaktif</h2>
                <p className="text-muted-foreground">
                    Kelola pertanyaan dan kunci jawaban untuk modul ini.
                </p>
            </div>

            <div className="mt-4">
                {/* Kita pass moduleId. 
           QuizBuilder bisa melakukan fetch data sendiri (CSR) untuk data quiz terkini 
           agar lebih aman dari stale data.
        */}
                <QuizBuilderLoader moduleId={params.id} />
            </div>
        </div>
    );
}

// Wrapper Client Component untuk Fetching Data Quiz (CSR)
// Ini lebih aman untuk form yang kompleks daripada SSR murni jika API belum 100% matang untuk SSR.
'use client';
import { useEffect, useState } from 'react';
import { adminEducationService } from '@/services/education.service'; // Pastikan ada getModuleById
import { Loader2 } from 'lucide-react';

function QuizBuilderLoader({ moduleId }: { moduleId: string }) {
    const [initialData, setInitialData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulasi fetch detail quiz. 
        // Backend perlu endpoint: GET /admin/education/modules/:id (include quiz)
        // Jika belum ada, QuizBuilder akan mulai kosong.
        setLoading(false);
        // TODO: Implement actual fetch here when Endpoint Ready
    }, [moduleId]);

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return <QuizBuilder moduleId={moduleId} initialData={initialData} />;
}