"use client";

import React from "react";
import { useForm, useFieldArray, useWatch, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Baby,
    Plus,
    Trash2,
    Calculator,
    ChevronLeft,
    User,
    TrendingUp
} from "lucide-react";

// --- UI COMPONENTS ---
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// --- CUSTOM FEATURES ---
import { StageSelector } from "./stage-selector";
import { StageInputCard } from "./stage-input-card";

// --- SCHEMA & TYPES ---
import {
    educationSimulationSchema,
    EducationSimulationForm,
    SchoolLevelType,
    DEFAULT_STAGE_DURATION
} from "@/lib/schemas/education-simulation.schema";

interface ChildrenFormStepProps {
    initialData?: Partial<EducationSimulationForm>;
    onNext: (data: EducationSimulationForm) => void;
    onBack: () => void;
}

export function ChildrenFormStep({ initialData, onNext, onBack }: ChildrenFormStepProps) {

    // 1. SETUP FORM UTAMA
    const form = useForm<EducationSimulationForm>({
        // [FIX]: Menggunakan 'as any' untuk menghindari konflik tipe Zod Coerce vs RHF Resolver
        resolver: zodResolver(educationSimulationSchema) as any,
        defaultValues: {
            childrenPlans: initialData?.childrenPlans?.length
                ? initialData.childrenPlans
                : [{
                    childName: "",
                    childDob: "",
                    stages: []
                }],
            clientName: initialData?.clientName || "",
            clientCity: initialData?.clientCity || "",
            clientDob: initialData?.clientDob || "",
            clientJob: initialData?.clientJob || "",
            clientPhone: initialData?.clientPhone || "",
            inflationRate: initialData?.inflationRate || 10,
            returnRate: initialData?.returnRate || 12,
        },
        mode: "onChange"
    });

    // 2. FIELD ARRAY UNTUK ANAK
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "childrenPlans",
    });

    // 3. HANDLER SUBMIT
    const onSubmit = (data: EducationSimulationForm) => {
        const hasEmptyStages = data.childrenPlans.some(c => c.stages.length === 0);

        if (hasEmptyStages) {
            form.setError("childrenPlans", {
                type: "manual",
                message: "Setiap anak harus memiliki minimal 1 jenjang pendidikan terpilih."
            });
            return;
        }

        onNext(data);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                        <Baby className="w-5 h-5" /> Data Anak & Rencana Sekolah
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Tambahkan anak dan pilih jenjang sekolah yang ingin disimulasikan.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => append({ childName: "", childDob: "", stages: [] })}
                    className="flex items-center gap-2 shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Tambah Anak
                </Button>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* --- GLOBAL ASSUMPTIONS --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border">
                        <FormField
                            control={form.control}
                            name="inflationRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" /> Asumsi Inflasi Pendidikan (%)
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.1" {...field} className="bg-background" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="returnRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" /> Target Return Investasi (%)
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.1" {...field} className="bg-background" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* --- CHILDREN ACCORDION --- */}
                    <Accordion type="multiple" defaultValue={["item-0"]} className="space-y-4">
                        {fields.map((field, index) => (
                            <AccordionItem
                                key={field.id}
                                value={`item-${index}`}
                                className="border rounded-xl bg-card overflow-hidden shadow-sm data-[state=open]:border-primary/50 transition-colors"
                            >
                                <div className="flex items-center px-4 bg-secondary/5">
                                    <AccordionTrigger className="hover:no-underline py-3 flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 p-1.5 rounded-full">
                                                <User className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className="text-left">
                                                <span className="font-bold text-sm block">
                                                    <ChildNameWatcher control={form.control} index={index} />
                                                </span>
                                                <span className="text-xs text-muted-foreground font-normal">
                                                    <StageCountWatcher control={form.control} index={index} />
                                                </span>
                                            </div>
                                        </div>
                                    </AccordionTrigger>

                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 ml-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                remove(index);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>

                                <AccordionContent className="px-4 pb-6 pt-4">
                                    {/* --- CHILD IDENTITY --- */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <FormField
                                            control={form.control}
                                            name={`childrenPlans.${index}.childName`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nama Lengkap</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Misal: Budi Santoso" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`childrenPlans.${index}.childDob`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tanggal Lahir</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Separator className="my-4" />

                                    {/* --- STAGE SELECTION (ISOLATED) --- */}
                                    <div className="space-y-6">
                                        <ChildStageManager
                                            control={form.control}
                                            childIndex={index}
                                        />
                                    </div>

                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    {form.formState.errors.childrenPlans?.root && (
                        <p className="text-destructive text-sm font-medium text-center">
                            {form.formState.errors.childrenPlans.root.message}
                        </p>
                    )}

                    {/* --- BUTTONS --- */}
                    <div className="flex items-center justify-between gap-4 pt-4 border-t mt-8">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onBack}
                            className="flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" /> Kembali
                        </Button>

                        <Button
                            type="submit"
                            className="px-8 shadow-lg shadow-primary/20"
                            disabled={form.formState.isSubmitting}
                        >
                            <Calculator className="w-4 h-4 mr-2" />
                            {form.formState.isSubmitting ? "Menghitung..." : "Hitung Simulasi"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

// ============================================================================
// WATCHERS
// ============================================================================

function ChildNameWatcher({ control, index }: { control: Control<EducationSimulationForm>, index: number }) {
    const name = useWatch({
        control,
        name: `childrenPlans.${index}.childName`,
    });
    return <>{name || `Anak #${index + 1}`}</>;
}

function StageCountWatcher({ control, index }: { control: Control<EducationSimulationForm>, index: number }) {
    const stages = useWatch({
        control,
        name: `childrenPlans.${index}.stages`,
    });
    const count = stages?.length || 0;
    return <>{count} Jenjang Dipilih</>;
}

// ============================================================================
// STAGE MANAGER (LOGIC JENJANG)
// ============================================================================

interface ChildStageManagerProps {
    control: Control<EducationSimulationForm>;
    childIndex: number;
}

function ChildStageManager({ control, childIndex }: ChildStageManagerProps) {
    const { fields, replace } = useFieldArray({
        control,
        name: `childrenPlans.${childIndex}.stages`,
    });

    const childDob = useWatch({
        control,
        name: `childrenPlans.${childIndex}.childDob`,
    });

    const currentStages = useWatch({
        control,
        name: `childrenPlans.${childIndex}.stages`,
    });

    const selectedLevels = currentStages?.map(s => s.level) || [];

    const handleStagesChange = (newLevels: SchoolLevelType[]) => {
        const currentYear = new Date().getFullYear();
        const birthYear = childDob ? new Date(childDob).getFullYear() : currentYear;

        const calculateStartYear = (level: SchoolLevelType) => {
            const entryOffsets: Record<SchoolLevelType, number> = {
                TK: 4, SD: 6, SMP: 12, SMA: 15, S1: 18, S2: 23
            };
            return birthYear + entryOffsets[level];
        };

        const newStagesData = newLevels.map(level => {
            const existing = currentStages?.find(s => s.level === level);

            if (existing) return existing;

            return {
                level,
                duration: DEFAULT_STAGE_DURATION[level],
                startYear: calculateStartYear(level),
                costEntry: 0,
                costMonthly: 0,
                costSemester: 0,
                costFull: 0
            };
        });

        replace(newStagesData);
    };

    return (
        <div className="space-y-6">
            <StageSelector
                value={selectedLevels}
                onChange={handleStagesChange}
                disabled={!childDob}
            />

            {!childDob && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                    ⚠️ Silakan isi <strong>Tanggal Lahir</strong> terlebih dahulu untuk estimasi tahun masuk otomatis.
                </p>
            )}

            {fields.length > 0 && (
                <div className="grid gap-4 mt-4 animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-normal">
                            Detail Biaya ({fields.length})
                        </Badge>
                        <Separator className="flex-1" />
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {fields.map((field, k) => (
                            <StageInputCard
                                key={field.id}
                                childIndex={childIndex}
                                stageIndex={k}
                                level={field.level}
                                onRemove={() => {
                                    const newLevels = selectedLevels.filter(l => l !== field.level);
                                    handleStagesChange(newLevels);
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}