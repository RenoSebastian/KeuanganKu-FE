'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, AlertCircle, GripVertical } from 'lucide-react';
import { OptionRow } from './option-row';
import { QuizQuestionType } from '@/lib/types/education';

interface QuestionCardProps {
    questionIndex: number;
    removeQuestion: (index: number) => void;
}

export function QuestionCard({ questionIndex, removeQuestion }: QuestionCardProps) {
    const { register, control, formState: { errors } } = useFormContext();

    // Nested Array Management untuk Options
    const { fields, append, remove } = useFieldArray({
        control,
        name: `questions.${questionIndex}.options`,
    });

    // Safe access to nested errors untuk pertanyaan spesifik ini
    const questionErrors = (errors?.questions as any)?.[questionIndex];

    return (
        <Card className="relative border-l-4 border-l-primary/20 hover:border-l-primary transition-colors duration-300">
            <CardHeader className="pb-3 flex flex-row items-start gap-4">
                {/* Drag Handle Indicator (Visual Only for now) */}
                <div className="mt-3 text-gray-300 cursor-grab active:cursor-grabbing" title="Drag to reorder">
                    <GripVertical className="w-5 h-5" />
                </div>

                <div className="flex-1 space-y-4">
                    {/* Question Text Input */}
                    <div className="space-y-1">
                        <Input
                            {...register(`questions.${questionIndex}.questionText`)}
                            placeholder="Tulis pertanyaan di sini..."
                            className="text-lg font-medium border-0 border-b rounded-none px-0 focus-visible:ring-0 placeholder:text-gray-300 focus:border-primary"
                        />
                        {questionErrors?.questionText && (
                            <p className="text-xs text-red-500 font-medium animate-in slide-in-from-left-1">
                                {questionErrors.questionText.message}
                            </p>
                        )}
                    </div>

                    {/* Hidden Fields untuk menjaga konsistensi Type & Order */}
                    <input type="hidden" {...register(`questions.${questionIndex}.type`)} value={QuizQuestionType.SINGLE_CHOICE} />
                    <input type="hidden" {...register(`questions.${questionIndex}.orderIndex`)} value={questionIndex + 1} />
                </div>

                {/* Delete Question Button */}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(questionIndex)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 -mt-1"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Options List Container */}
                <div className="space-y-2 pl-9">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pilihan Jawaban</label>
                        {questionErrors?.options && (
                            <div className="flex items-center gap-1.5 text-red-500 text-xs font-medium">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{questionErrors.options.message || "Tentukan minimal 2 opsi & 1 jawaban benar."}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        {fields.map((field, index) => (
                            <OptionRow
                                key={field.id} // CRITICAL: Stable ID dari RHF untuk mencegah re-render issues
                                questionIndex={questionIndex}
                                optionIndex={index}
                                removeOption={remove}
                                canDelete={fields.length > 2}
                            />
                        ))}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ optionText: '', isCorrect: false })}
                        className="mt-3 text-xs h-8 border-dashed"
                    >
                        <Plus className="w-3 h-3 mr-1.5" /> Tambah Opsi
                    </Button>
                </div>

                {/* Explanation Field (Optional) */}
                <div className="pt-4 pl-9 border-t">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                        Pembahasan Soal (Muncul setelah kuis selesai)
                    </label>
                    <Textarea
                        {...register(`questions.${questionIndex}.explanation`)}
                        placeholder="Jelaskan logika di balik jawaban yang benar..."
                        className="h-20 resize-none text-sm bg-gray-50/50"
                    />
                </div>
            </CardContent>
        </Card>
    );
}