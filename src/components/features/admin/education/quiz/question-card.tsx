'use client';

import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Trash2,
    Plus,
    AlertCircle,
    GripVertical,
    ImageIcon,
    Loader2,
    X
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

import { OptionRow } from './option-row';
import { QuizType } from '@/lib/types/education';
import apiClient from '@/lib/axios';

interface QuestionCardProps {
    questionIndex: number;
    removeQuestion: (index: number) => void;
    totalQuestions: number;
}

export function QuestionCard({ questionIndex, removeQuestion, totalQuestions }: QuestionCardProps) {
    const { register, control, watch, setValue, formState: { errors } } = useFormContext();
    const [isUploading, setIsUploading] = useState(false);

    // Watch values untuk preview
    const imageUrl = watch(`questions.${questionIndex}.imageUrl`);

    // Nested Array Management untuk Options
    const { fields, append, remove } = useFieldArray({
        control,
        name: `questions.${questionIndex}.options`,
    });

    // Safe access to nested errors
    const questionErrors = (errors?.questions as any)?.[questionIndex];

    // --- Image Handler ---
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Ukuran gambar maksimal 2MB');
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.post('/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const uploadedUrl = response.data.data.url;
            setValue(`questions.${questionIndex}.imageUrl`, uploadedUrl, { shouldDirty: true });
            toast.success('Gambar soal berhasil diupload');
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Gagal upload gambar');
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const removeImage = () => {
        setValue(`questions.${questionIndex}.imageUrl`, '', { shouldDirty: true });
    };

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/${path}`;
    };

    return (
        <Card className="relative border-l-4 border-l-transparent hover:border-l-primary/50 transition-all duration-300 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-start gap-3 bg-gray-50/30 rounded-t-lg">
                {/* Drag Handle & Numbering */}
                <div className="flex flex-col items-center gap-2 mt-2">
                    <div className="text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500 transition-colors" title="Drag to reorder">
                        <GripVertical className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground bg-gray-100 w-6 h-6 flex items-center justify-center rounded-full">
                        {questionIndex + 1}
                    </span>
                </div>

                <div className="flex-1 space-y-4 pt-1">
                    {/* Top Row: Question Text & Points */}
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-1">
                            <Input
                                {...register(`questions.${questionIndex}.questionText`)}
                                placeholder="Tulis pertanyaan Anda di sini..."
                                className="text-lg font-medium border-0 border-b border-transparent bg-transparent rounded-none px-0 focus-visible:ring-0 placeholder:text-gray-400 focus:border-primary transition-all"
                            />
                            {questionErrors?.questionText && (
                                <p className="text-xs text-red-500 font-medium animate-in slide-in-from-left-1">
                                    {questionErrors.questionText.message}
                                </p>
                            )}
                        </div>

                        <div className="w-24 shrink-0">
                            <div className="relative">
                                <Input
                                    type="number"
                                    {...register(`questions.${questionIndex}.points`)}
                                    className="pr-8 text-right font-mono"
                                    min={1}
                                />
                                <span className="absolute right-2 top-2.5 text-xs text-muted-foreground font-medium">
                                    pts
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Image Preview Area */}
                    {imageUrl && (
                        <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden border">
                            <Image
                                src={getImageUrl(imageUrl)}
                                alt="Question Image"
                                fill
                                className="object-contain"
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 shadow-sm"
                                onClick={removeImage}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    {/* Action Bar (Upload Image) */}
                    {!imageUrl && (
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs text-muted-foreground hover:text-primary"
                                onClick={() => document.getElementById(`q-img-${questionIndex}`)?.click()}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                ) : (
                                    <ImageIcon className="w-3.5 h-3.5 mr-2" />
                                )}
                                {isUploading ? 'Uploading...' : 'Tambah Gambar Soal'}
                            </Button>
                            <input
                                id={`q-img-${questionIndex}`}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </div>
                    )}

                    {/* Hidden Fields */}
                    <input type="hidden" {...register(`questions.${questionIndex}.type`)} value={QuizType.SINGLE_CHOICE} />
                    <input type="hidden" {...register(`questions.${questionIndex}.orderIndex`)} value={questionIndex + 1} />
                </div>

                {/* Delete Button */}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(questionIndex)}
                    disabled={totalQuestions <= 1}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </CardHeader>

            <CardContent className="space-y-6 pt-2 pl-12 pr-6 pb-6">
                {/* Options Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-dashed">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Pilihan Jawaban
                        </label>
                        {questionErrors?.options && (
                            <div className="flex items-center gap-1.5 text-red-500 text-xs font-medium animate-pulse">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{questionErrors.options.message || "Validasi gagal"}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <OptionRow
                                key={field.id}
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
                        onClick={() => append({ optionText: '', isCorrect: false, orderIndex: fields.length })}
                        className="mt-2 text-xs border-dashed w-full hover:bg-gray-50 hover:border-primary/50 hover:text-primary transition-all"
                    >
                        <Plus className="w-3 h-3 mr-1.5" /> Tambah Pilihan Jawaban
                    </Button>
                </div>

                {/* Explanation Section */}
                <div className="pt-4 mt-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                        Pembahasan (Opsional)
                    </label>
                    <Textarea
                        {...register(`questions.${questionIndex}.explanation`)}
                        placeholder="Jelaskan mengapa jawaban tersebut benar..."
                        className="h-20 min-h-20 text-sm bg-gray-50/30 resize-y"
                    />
                </div>
            </CardContent>
        </Card>
    );
}