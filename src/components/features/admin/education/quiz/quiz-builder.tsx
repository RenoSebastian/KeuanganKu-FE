'use client';

import { useState } from 'react';
import { useForm, useFieldArray, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Plus, Save, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QuestionCard } from './question-card';

import { quizFormSchema, QuizFormValues } from '@/lib/schemas/education-schema';
import { adminEducationService } from '@/services/education.service';
import { QuizHeader, UpsertQuizPayload, QuizQuestionType } from '@/lib/types/education';
// [NEW] Import Guardrail Hook
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';

interface QuizBuilderProps {
    moduleId: string;
    initialData?: QuizHeader | null;
}

export function QuizBuilder({ moduleId, initialData }: QuizBuilderProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const methods = useForm<QuizFormValues>({
        resolver: zodResolver(quizFormSchema) as any,
        defaultValues: {
            passingScore: initialData?.passingScore ?? 70,
            timeLimit: initialData?.timeLimit ?? 30,
            maxAttempts: initialData?.maxAttempts ?? 3,
            description: initialData?.description ?? '',
            questions: initialData?.questions.length ? initialData.questions.map(q => ({
                questionText: q.questionText,
                type: q.type,
                orderIndex: q.orderIndex,
                explanation: q.explanation || '',
                options: q.options.map(o => ({
                    optionText: o.optionText,
                    isCorrect: o.isCorrect
                }))
            })) : [
                {
                    questionText: '',
                    type: QuizQuestionType.SINGLE_CHOICE,
                    orderIndex: 1,
                    options: [
                        { optionText: '', isCorrect: false },
                        { optionText: '', isCorrect: false }
                    ]
                }
            ]
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: methods.control,
        name: 'questions',
    });

    // [NEW] Guardrail Implementation
    // Mencegah data loss jika user refresh/close tab
    useUnsavedChanges(methods.formState.isDirty && !methods.formState.isSubmitSuccessful);

    const onSubmit: SubmitHandler<QuizFormValues> = async (data) => {
        setIsSubmitting(true);
        try {
            const payload: UpsertQuizPayload = {
                passingScore: Number(data.passingScore),
                timeLimit: Number(data.timeLimit),
                maxAttempts: Number(data.maxAttempts),
                description: data.description,
                questions: data.questions.map((q, idx) => ({
                    questionText: q.questionText,
                    type: q.type,
                    orderIndex: idx + 1,
                    explanation: q.explanation,
                    options: q.options.map(o => ({
                        optionText: o.optionText,
                        isCorrect: o.isCorrect
                    }))
                }))
            };

            await adminEducationService.upsertQuiz(moduleId, payload);

            toast.success('Kuis berhasil disimpan!');

            // Reset form state setelah sukses agar hook tidak menahan navigasi
            methods.reset(data);
            router.refresh();
        } catch (error: any) {
            console.error("Quiz Submit Error:", error);
            // Logic Error Handling:
            // Tampilkan pesan error spesifik dari Backend jika ada
            toast.error(error.response?.data?.message || 'Gagal menyimpan kuis. Periksa koneksi atau input Anda.');
            // PENTING: Jangan reset form di sini. Biarkan user mencoba lagi.
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasErrors = Object.keys(methods.formState.errors).length > 0;

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8 pb-24">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white border rounded-lg shadow-sm">
                    <div className="space-y-2">
                        <Label>Nilai Kelulusan (KKM)</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                {...methods.register('passingScore')}
                                className="pr-12"
                            />
                            <span className="absolute right-3 top-2.5 text-sm text-gray-400">Poin</span>
                        </div>
                        {methods.formState.errors.passingScore && (
                            <p className="text-xs text-red-500 font-medium">{methods.formState.errors.passingScore.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Durasi Pengerjaan</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                {...methods.register('timeLimit')}
                                className="pr-16"
                            />
                            <span className="absolute right-3 top-2.5 text-sm text-gray-400">Menit</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Isi 0 untuk tanpa batas waktu.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Kesempatan Mengulang</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                {...methods.register('maxAttempts')}
                                className="pr-12"
                            />
                            <span className="absolute right-3 top-2.5 text-sm text-gray-400">Kali</span>
                        </div>
                    </div>
                </div>

                {hasErrors && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Validasi Gagal</AlertTitle>
                        <AlertDescription>
                            Terdapat kesalahan pengisian form. Mohon periksa kembali pertanyaan dan opsi jawaban Anda. Pastikan setiap pertanyaan memiliki **tepat satu** jawaban benar.
                        </AlertDescription>
                    </Alert>
                )}

                <Separator />

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold tracking-tight text-gray-900">
                            Daftar Pertanyaan <span className="text-muted-foreground font-normal ml-2">({fields.length} Soal)</span>
                        </h3>

                        <Button
                            type="button"
                            onClick={() => append({
                                questionText: '',
                                type: QuizQuestionType.SINGLE_CHOICE,
                                orderIndex: fields.length + 1,
                                options: [
                                    { optionText: '', isCorrect: false },
                                    { optionText: '', isCorrect: false }
                                ]
                            })}
                            className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Tambah Pertanyaan
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {fields.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50">
                                <p className="text-muted-foreground">Belum ada pertanyaan. Mulai dengan menambahkan pertanyaan baru.</p>
                            </div>
                        ) : (
                            fields.map((field, index) => (
                                <QuestionCard
                                    key={field.id}
                                    questionIndex={index}
                                    removeQuestion={remove}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* --- STICKY FOOTER ACTION --- */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t flex justify-end gap-4 z-50 md:pl-72 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="min-w-40 shadow-lg shadow-primary/20"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" /> Simpan Perubahan
                            </>
                        )}
                    </Button>
                </div>

            </form>
        </FormProvider>
    );
}