"use client";

import React, { useState } from "react";
import { useForm, useFieldArray, useWatch, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Baby,
    Plus,
    Trash2,
    Calculator,
    ChevronLeft,
    TrendingUp,
    Loader2,
    Sparkles,
    Smile,
    Percent,
    Settings2
} from "lucide-react";

// --- UI COMPONENTS ---
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider"; // Pastikan komponen ini ada
import { cn } from "@/lib/utils";

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
    isLoading?: boolean;
}

export function ChildrenFormStep({ initialData, onNext, onBack, isLoading = false }: ChildrenFormStepProps) {
    const [activeTab, setActiveTab] = useState("child-0");

    // 1. SETUP FORM UTAMA
    const form = useForm<EducationSimulationForm>({
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
            // Default Assumptions
            inflationRate: initialData?.inflationRate || 10,
            returnRate: initialData?.returnRate || 12,
        },
        mode: "onChange"
    });

    // 2. FIELD ARRAY
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "childrenPlans",
    });

    const handleAddChild = () => {
        append({ childName: "", childDob: "", stages: [] });
        setTimeout(() => setActiveTab(`child-${fields.length}`), 100);
    };

    const handleRemoveChild = (index: number) => {
        remove(index);
        setActiveTab("child-0");
    };

    const onSubmit = (data: EducationSimulationForm) => {
        const hasEmptyStages = data.childrenPlans.some(c => c.stages.length === 0);
        if (hasEmptyStages) {
            form.setError("childrenPlans", {
                type: "manual",
                message: "Setiap anak harus memiliki minimal 1 rencana jenjang sekolah."
            });
            return;
        }
        onNext(data);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* --- GLOBAL ASSUMPTIONS CARD (BLUE THEME) --- */}
                    <Card className="border-blue-100 bg-linear-to-br from-blue-50/80 to-white shadow-sm overflow-hidden">
                        <CardHeader className="pb-2 border-b border-blue-100/50">
                            <div className="flex items-center gap-2 text-blue-700">
                                <Settings2 className="w-5 h-5" />
                                <CardTitle className="text-sm font-bold uppercase tracking-wider">Asumsi Ekonomi Makro</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Slider Inflasi */}
                            <FormField
                                control={form.control}
                                name="inflationRate"
                                render={({ field }) => (
                                    <FormItem className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <FormLabel className="text-slate-600 font-semibold flex items-center gap-2">
                                                <div className="p-1.5 bg-red-100 rounded text-red-600">
                                                    <TrendingUp className="w-3.5 h-3.5" />
                                                </div>
                                                Inflasi Pendidikan
                                            </FormLabel>
                                            <div className="relative w-20">
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    className="h-8 pr-6 text-right font-bold text-slate-700 border-blue-200 focus:ring-blue-200"
                                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                                />
                                                <Percent className="w-3 h-3 absolute right-2 top-2.5 text-slate-400" />
                                            </div>
                                        </div>
                                        <FormControl>
                                            <Slider
                                                min={0} max={20} step={0.5}
                                                value={field.value}
                                                onChange={(vals) => field.onChange(vals)}
                                                className="py-2"
                                            />
                                        </FormControl>
                                        <p className="text-[10px] text-slate-500 text-right">
                                            *Rata-rata inflasi pendidikan di Indonesia 10-15% per tahun.
                                        </p>
                                    </FormItem>
                                )}
                            />

                            {/* Slider Return Investasi */}
                            <FormField
                                control={form.control}
                                name="returnRate"
                                render={({ field }) => (
                                    <FormItem className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <FormLabel className="text-slate-600 font-semibold flex items-center gap-2">
                                                <div className="p-1.5 bg-green-100 rounded text-green-600">
                                                    <TrendingUp className="w-3.5 h-3.5" />
                                                </div>
                                                Target Return Investasi
                                            </FormLabel>
                                            <div className="relative w-20">
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    className="h-8 pr-6 text-right font-bold text-slate-700 border-blue-200 focus:ring-blue-200"
                                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                                />
                                                <Percent className="w-3 h-3 absolute right-2 top-2.5 text-slate-400" />
                                            </div>
                                        </div>
                                        <FormControl>
                                            <Slider
                                                min={0} max={30} step={0.5}
                                                value={field.value}
                                                onChange={(vals) => field.onChange(vals)}
                                                className="py-2"
                                            />
                                        </FormControl>
                                        <p className="text-[10px] text-slate-500 text-right">
                                            *Return Reksadana Saham/Campuran agresif berkisar 10-14%.
                                        </p>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* --- HEADER ANAK --- */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-l-4 border-blue-600 pl-4 py-1">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                Data Anak & Sekolah
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Buat rencana terpisah untuk setiap anak Anda.
                            </p>
                        </div>
                    </div>

                    {/* --- TABS NAVIGATION --- */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2 gap-2">
                            <TabsList className="bg-blue-50/50 p-1 gap-2 h-auto flex-wrap justify-start rounded-xl border border-blue-100">
                                {fields.map((field, index) => (
                                    <TabsTrigger
                                        key={field.id}
                                        value={`child-${index}`}
                                        className={cn(
                                            "relative h-10 px-5 rounded-lg text-sm font-medium transition-all shadow-sm",
                                            "data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-blue-200",
                                            "data-[state=inactive]:bg-white data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:bg-blue-100"
                                        )}
                                    >
                                        <ChildNameTabWatcher control={form.control} index={index} />
                                    </TabsTrigger>
                                ))}

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleAddChild}
                                    className="h-10 w-10 rounded-lg border-2 border-dashed border-blue-200 text-blue-400 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50"
                                    disabled={isLoading}
                                    title="Tambah Anak Lain"
                                >
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </TabsList>
                        </div>

                        {/* --- TAB CONTENT AREA --- */}
                        {fields.map((field, index) => (
                            <TabsContent key={field.id} value={`child-${index}`} className="mt-0 focus-visible:ring-0">
                                <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm ring-1 ring-blue-100">
                                    <CardContent className="p-6 space-y-8">

                                        {/* SECTION 1: IDENTITY */}
                                        <div className="flex flex-col md:flex-row gap-6 items-start justify-between bg-blue-50/30 p-4 rounded-xl border border-blue-50">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full md:w-3/4">
                                                <FormField
                                                    control={form.control}
                                                    name={`childrenPlans.${index}.childName`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 text-slate-700">
                                                                <Smile className="w-4 h-4 text-blue-500" /> Nama Panggilan
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Contoh: Kakak Budi" {...field} className="bg-white border-blue-100 focus:border-blue-400" disabled={isLoading} />
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
                                                            <FormLabel className="text-slate-700">Tanggal Lahir</FormLabel>
                                                            <FormControl>
                                                                <Input type="date" {...field} className="bg-white border-blue-100 focus:border-blue-400" disabled={isLoading} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveChild(index)}
                                                    className="text-red-400 hover:bg-red-50 hover:text-red-600 mt-8 md:mt-0"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" /> Hapus
                                                </Button>
                                            )}
                                        </div>

                                        <Separator className="bg-blue-100" />

                                        {/* SECTION 2: STAGE SELECTION */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="p-1.5 bg-yellow-100 rounded-lg text-yellow-600">
                                                    <Sparkles className="w-4 h-4" />
                                                </div>
                                                <h4 className="font-bold text-slate-800">Jalur Pendidikan</h4>
                                            </div>

                                            <ChildStageManager
                                                control={form.control}
                                                childIndex={index}
                                                isLoading={isLoading}
                                            />
                                        </div>

                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>

                    {form.formState.errors.childrenPlans?.root && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-medium text-center animate-pulse">
                            {form.formState.errors.childrenPlans.root.message}
                        </div>
                    )}

                    {/* FOOTER ACTIONS */}
                    <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-200">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onBack}
                            className="flex items-center gap-2 hover:bg-slate-100 text-slate-600"
                            disabled={isLoading}
                        >
                            <ChevronLeft className="w-4 h-4" /> Kembali
                        </Button>

                        <Button
                            type="submit"
                            size="lg"
                            className="px-8 shadow-xl shadow-blue-500/20 min-w-48 font-bold bg-blue-600 hover:bg-blue-700 transition-all hover:scale-105"
                            disabled={form.formState.isSubmitting || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Menghitung...
                                </>
                            ) : (
                                <>
                                    <Calculator className="w-5 h-5 mr-2" /> Hitung Simulasi
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function ChildNameTabWatcher({ control, index }: { control: Control<EducationSimulationForm>, index: number }) {
    const name = useWatch({
        control,
        name: `childrenPlans.${index}.childName`,
    });
    return (
        <span className="flex items-center gap-2">
            <Baby className="w-4 h-4 opacity-70" />
            <span className="truncate max-w-25">{name || `Anak #${index + 1}`}</span>
        </span>
    );
}

interface ChildStageManagerProps {
    control: Control<EducationSimulationForm>;
    childIndex: number;
    isLoading: boolean;
}

function ChildStageManager({ control, childIndex, isLoading }: ChildStageManagerProps) {
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
                disabled={!childDob || isLoading}
            />

            {!childDob && (
                <div className="flex items-center gap-3 text-xs text-blue-700 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="p-1 bg-white rounded-full shadow-sm">
                        <span className="text-lg">💡</span>
                    </div>
                    <p className="leading-relaxed">
                        Masukkan <strong>Tanggal Lahir</strong> anak terlebih dahulu agar sistem dapat menghitung otomatis kapan mereka masuk sekolah.
                    </p>
                </div>
            )}

            {fields.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center gap-3 pt-2">
                        <Badge variant="secondary" className="text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200">
                            {fields.length} Jenjang Dipilih
                        </Badge>
                        <Separator className="flex-1 bg-blue-100" />
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

            {fields.length === 0 && childDob && (
                <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <p className="font-medium">Belum ada jenjang sekolah yang dipilih.</p>
                    <p className="text-xs mt-1">Klik opsi di atas (TK, SD, SMP...) untuk mulai merencanakan.</p>
                </div>
            )}
        </div>
    );
}