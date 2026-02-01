'use client';

import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptionRowProps {
    questionIndex: number;
    optionIndex: number;
    removeOption: (index: number) => void;
    canDelete: boolean;
}

export function OptionRow({
    questionIndex,
    optionIndex,
    removeOption,
    canDelete
}: OptionRowProps) {
    const { register, watch, setValue, getValues } = useFormContext();

    // Construct path dinamis untuk akses state form specific row ini
    const fieldName = `questions.${questionIndex}.options.${optionIndex}`;

    // Subscribe ke perubahan value untuk update UI secara real-time
    const isCorrect = watch(`${fieldName}.isCorrect`);

    // --- LOGICAL CORE: MUTUAL EXCLUSIVITY ---
    // Memastikan hanya ada 1 jawaban benar per pertanyaan.
    // Saat user memilih opsi ini, opsi lain di pertanyaan yang sama di-set false.
    const handleSetCorrect = () => {
        const currentOptions = getValues(`questions.${questionIndex}.options`);

        currentOptions.forEach((_: any, idx: number) => {
            // Set true jika index match, false jika tidak
            setValue(
                `questions.${questionIndex}.options.${idx}.isCorrect`,
                idx === optionIndex,
                { shouldValidate: true } // Trigger re-validation schema Zod
            );
        });
    };

    return (
        <div className={cn(
            "flex items-center gap-3 p-2 rounded-md border transition-all duration-200",
            isCorrect
                ? "bg-green-50 border-green-200 ring-1 ring-green-200"
                : "bg-white border-transparent hover:border-gray-200"
        )}>
            {/* Radio Button Visualizer */}
            <button
                type="button"
                onClick={handleSetCorrect}
                className={cn(
                    "shrink-0 cursor-pointer transition-colors focus:outline-none",
                    isCorrect ? "text-green-600" : "text-gray-300 hover:text-gray-400"
                )}
                title={isCorrect ? "Jawaban Benar" : "Tandai sebagai jawaban benar"}
            >
                {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5" />
                ) : (
                    <Circle className="w-5 h-5" />
                )}
            </button>

            {/* Option Text Input */}
            <div className="flex-1">
                <Input
                    {...register(`${fieldName}.optionText`)}
                    placeholder={`Pilihan Jawaban ${optionIndex + 1}`}
                    className="border-0 shadow-none focus-visible:ring-0 px-0 h-auto py-1 bg-transparent placeholder:text-gray-300"
                />
            </div>

            {/* Delete Action (Protected if items < 2) */}
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeOption(optionIndex)}
                disabled={!canDelete}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30"
            >
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
    );
}