'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';

import { MarkdownRenderer } from '@/components/features/education/reader/markdown-renderer';
import { SectionNavigator } from '@/components/features/education/reader/section-navigator';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import { employeeEducationService } from '@/services/employee-education.service';
import { EducationModule, EducationProgressStatus } from '@/lib/types/education';

interface ReaderPageProps {
    params: Promise<{ slug: string }>;
}

export default function ReaderPage({ params }: ReaderPageProps) {
    // [FIX 1] Unwrap params secara asinkron menggunakan React.use()
    const { slug } = use(params);

    const router = useRouter();
    const [module, setModule] = useState<EducationModule | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [isFinishing, setIsFinishing] = useState(false);

    // 1. Fetch Data & Initialize Session
    useEffect(() => {
        // [FIX 2] Validasi slug untuk mencegah fetch dengan nilai 'undefined'
        if (!slug || slug === 'undefined') return;

        const initReader = async () => {
            try {
                setIsLoading(true);
                const data = await employeeEducationService.getModuleBySlug(slug);

                if (!data || !data.sections || data.sections.length === 0) {
                    toast.error("Materi tidak ditemukan atau kosong.");
                    router.push('/learning');
                    return;
                }

                setModule(data);

                /**
                 * [FIX 3] Update Progress menggunakan SLUG
                 * Endpoint backend sekarang: POST /api/education/modules/:slug/progress
                 */
                await employeeEducationService.updateProgress(slug, {
                    status: EducationProgressStatus.STARTED
                }).catch(err => console.warn("Failed to init progress", err));

            } catch (error) {
                console.error("Reader Error:", error);
                toast.error("Gagal memuat materi.");
                router.push('/learning');
            } finally {
                setIsLoading(false);
            }
        };

        initReader();
    }, [slug, router]);

    // Derived State
    const sections = useMemo(() => module?.sections || [], [module]);
    const currentSection = sections[currentSectionIndex];

    // 2. Navigation Handlers
    const handleNext = () => {
        if (currentSectionIndex < sections.length - 1) {
            const nextIndex = currentSectionIndex + 1;
            const nextSectionId = sections[nextIndex]?.id;

            setCurrentSectionIndex(nextIndex);
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Silent Checkpoint Update menggunakan SLUG
            if (slug && nextSectionId) {
                employeeEducationService.updateProgress(slug, {
                    lastSectionId: nextSectionId
                }).catch(err => console.error("Silent checkpoint failed", err));
            }
        }
    };

    const handlePrevious = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleFinish = async () => {
        if (!slug) return;

        setIsFinishing(true);
        try {
            // Final Checkpoint menggunakan SLUG
            await employeeEducationService.updateProgress(slug, {
                status: EducationProgressStatus.COMPLETED
            });

            toast.success("Materi selesai dibaca! Bersiap untuk kuis.");
            router.push(`/learning/${slug}/quiz`);

        } catch (error) {
            console.error("Finish Error:", error);
            toast.error("Gagal menyimpan progress. Coba lagi.");
            setIsFinishing(false);
        }
    };

    // 3. Render Loading
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Menyiapkan ruang baca...</p>
                </div>
            </div>
        );
    }

    if (!currentSection) return null;

    // 4. Render Reader Interface
    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in duration-300">

            {/* --- READER HEADER --- */}
            <header className="flex-none h-16 border-b flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/learning')}
                        title="Keluar dari mode baca"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </Button>
                    <div>
                        <h1 className="text-sm font-semibold text-gray-900 line-clamp-1 max-w-50 md:max-w-md">
                            {module?.title}
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Bab {currentSectionIndex + 1}: {currentSection.title || 'Materi'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2"></div>
            </header>

            {/* --- READER CONTENT AREA --- */}
            <ScrollArea className="flex-1 w-full bg-gray-50/50">
                <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 pb-32">
                    {/* Section Title */}
                    {currentSection.title && (
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 tracking-tight">
                            {currentSection.title}
                        </h2>
                    )}

                    {/* Markdown Content */}
                    <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100 min-h-[60vh]">
                        <MarkdownRenderer content={currentSection.contentMarkdown} />
                    </div>
                </div>
            </ScrollArea>

            {/* --- NAVIGATION FOOTER --- */}
            <SectionNavigator
                currentStep={currentSectionIndex}
                totalSteps={sections.length}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onFinish={handleFinish}
                isFinishing={isFinishing}
            />
        </div>
    );
}