"use client";

import React, { useState, useEffect } from "react";
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
    Settings2,
    AlertCircle
} from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// Components
import { StageSelector } from "./stage-selector";
import { StageInputCard } from "./stage-input-card";

// Schemas & Types
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

    const form = useForm<EducationSimulationForm>({
        resolver: zodResolver(educationSimulationSchema) as any,
        defaultValues: {
            clientName: "",
            clientCity: "",
            // [FIX] Inisialisasi string kosong
            childrenPlans: [{ childName: "", childDob: "", stages: [] }],
            inflationRate: 10,
            returnRate: 12,
            ...initialData,
        },
        mode: "onChange"
    });

    // --- LOGIC: RE-HYDRATION ---
    useEffect(() => {
        if (initialData) {
            console.log("Hydrating Children Form:", initialData);

            form.reset({
                ...form.getValues(),
                ...initialData,
                childrenPlans: initialData.childrenPlans?.length
                    ? initialData.childrenPlans
                    : [{ childName: "", childDob: "", stages: [] }]
            });
        }
    }, [initialData, form]);

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
        const hasEmptyStages = data.childrenPlans.some(c => (c.stages?.length || 0) === 0);

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

                    {/* --- GLOBAL ASSUMPTIONS CARD --- */}
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
                                                    onChange={e => field.onChange(Number(e.target.value))}
                                                    className="h-8 pr-6 text-right font-bold text-slate-700 border-blue-200 focus:ring-blue-200"
                                                />
                                                <Percent className="w-3 h-3 absolute right-2 top-2.5 text-slate-400" />
                                            </div>
                                        </div>
                                        <FormControl>
                                            <Slider
                                                min={0} max={20} step={0.5}
                                                value={field.value as any}
                                                onChange={(vals) => field.onChange(vals)}
                                                className="py-2"
                                            />
                                        </FormControl>
                                        <p className="text-[10px] text-slate-500 text-right">
                                            *Rata-rata inflasi pendidikan: 10-15% per tahun.
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
                                                    onChange={e => field.onChange(Number(e.target.value))}
                                                    className="h-8 pr-6 text-right font-bold text-slate-700 border-blue-200 focus:ring-blue-200"
                                                />
                                                <Percent className="w-3 h-3 absolute right-2 top-2.5 text-slate-400" />
                                            </div>
                                        </div>
                                        <FormControl>
                                            <Slider
                                                min={0} max={30} step={0.5}
                                                value={field.value as any}
                                                onChange={(vals) => field.onChange(vals)}
                                                className="py-2"
                                            />
                                        </FormControl>
                                        <p className="text-[10px] text-slate-500 text-right">
                                            *Return Saham/Campuran agresif: 10-14%.
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
                                        <ChildNameTabWatcher control={form.control as any} index={index} />
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

                                                {/* --- [FIX IS HERE] --- */}
                                                <FormField
                                                    control={form.control}
                                                    name={`childrenPlans.${index}.childDob`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-slate-700">Tanggal Lahir</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="date"
                                                                    {...field}
                                                                    // 1. Pastikan value selalu string valid, kalau null/undefined kasih ""
                                                                    value={field.value ? String(field.value).split('T')[0] : ''}

                                                                    // 2. [CRITICAL] onChange JANGAN kirim undefined. Kirim e.target.value (string) mentah-mentah.
                                                                    onChange={field.onChange}

                                                                    className="bg-white border-blue-100 focus:border-blue-400"
                                                                    disabled={isLoading}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                {/* --------------------- */}

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
                                                control={form.control as any}
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
                        <Alert variant="destructive" className="bg-red-50 border-red-200">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {form.formState.errors.childrenPlans.root.message}
                            </AlertDescription>
                        </Alert>
                    )}

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
                            {isLoading || form.formState.isSubmitting ? (
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

function ChildNameTabWatcher({ control, index }: { control: any, index: number }) {
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
    control: any;
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

    const selectedLevels = currentStages?.map((s: any) => s.level) || [];

    const handleStagesChange = (newLevels: SchoolLevelType[]) => {
        const currentYear = new Date().getFullYear();
        const dobDate = childDob ? new Date(childDob) : new Date();
        const birthYear = dobDate.getFullYear();

        const calculateStartYear = (level: SchoolLevelType) => {
            const entryOffsets: Record<SchoolLevelType, number> = {
                TK: 4,  // Usia 4 tahun
                SD: 6,  // Usia 6 tahun
                SMP: 12, // Usia 12 tahun
                SMA: 15, // Usia 15 tahun
                S1: 18, // Usia 18 tahun
                S2: 22  // Usia 22 tahun (Lulus S1 4 tahun)
            };

            if (isNaN(birthYear)) return currentYear + 1;

            return birthYear + entryOffsets[level];
        };

        const newStagesData = newLevels.map(level => {
            const existing = currentStages?.find((s: any) => s.level === level);

            if (existing) return existing;

            return {
                level,
                duration: DEFAULT_STAGE_DURATION[level],
                startYear: calculateStartYear(level),
                costEntry: 0,
                costMonthly: 0,
                costSemester: 0,
                costFull: 0,
                calculatedFutureValue: 0,
                calculatedMonthlySaving: 0
            };
        });

        const levelOrder = ["TK", "SD", "SMP", "SMA", "S1", "S2"];
        newStagesData.sort((a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level));

        replace(newStagesData);
    };

    return (
        <div className="space-y-6">
            <StageSelector
                value={selectedLevels}
                onChange={handleStagesChange}
                disabled={isLoading}
            />

            {!childDob && fields.length === 0 && (
                <div className="flex items-center gap-3 text-xs text-blue-700 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="p-1 bg-white rounded-full shadow-sm">
                        <span className="text-lg">💡</span>
                    </div>
                    <p className="leading-relaxed">
                        Tips: Masukkan <strong>Tanggal Lahir</strong> anak terlebih dahulu agar sistem dapat otomatis menghitung tahun masuk sekolah.
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
                                level={(field as any).level}
                                onRemove={() => {
                                    const newLevels = selectedLevels.filter((l: any) => l !== (field as any).level);
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
                    <p className="text-xs mt-1">Klik opsi jenjang di atas (TK, SD, SMP...) untuk mulai mengisi biaya.</p>
                </div>
            )}
        </div>
    );
}