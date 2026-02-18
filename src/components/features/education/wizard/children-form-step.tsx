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
    Smile
} from "lucide-react";

// --- UI COMPONENTS ---
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
    // State untuk Tab Aktif (Format: "child-0", "child-1")
    const [activeTab, setActiveTab] = useState("child-0");

    // 1. SETUP FORM UTAMA
    const form = useForm<EducationSimulationForm>({
        // [FIX] Menggunakan 'as any' untuk bypass strict type checking Zod vs RHF
        resolver: zodResolver(educationSimulationSchema) as any,
        defaultValues: {
            childrenPlans: initialData?.childrenPlans?.length
                ? initialData.childrenPlans
                : [{
                    childName: "",
                    childDob: "",
                    stages: []
                }],
            // Preserve Data Step 1
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

    // 3. HANDLER ADD CHILD (Auto Switch Tab)
    const handleAddChild = () => {
        append({ childName: "", childDob: "", stages: [] });
        // Set timeout agar render selesai sebelum switch tab
        setTimeout(() => setActiveTab(`child-${fields.length}`), 100);
    };

    // 4. HANDLER REMOVE CHILD
    const handleRemoveChild = (index: number) => {
        remove(index);
        // Reset ke tab pertama jika tab yang aktif dihapus
        setActiveTab("child-0");
    };

    // 5. HANDLER SUBMIT
    const onSubmit = (data: EducationSimulationForm) => {
        // Validasi Manual: Cek apakah setiap anak punya minimal 1 stage
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                        <Baby className="w-6 h-6" /> Rencana Pendidikan Anak
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Atur target pendidikan untuk setiap buah hati Anda secara terpisah.
                    </p>
                </div>

                {/* Global Assumptions Widget */}
                <div className="flex items-center gap-3 bg-muted/40 p-2 rounded-lg border text-xs">
                    <Form {...form}>
                        <FormField
                            control={form.control}
                            name="inflationRate"
                            render={({ field }) => (
                                <div className="flex flex-col px-2">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Inflasi</span>
                                    <div className="flex items-center gap-1 font-mono font-medium">
                                        <TrendingUp className="w-3 h-3 text-red-500" />
                                        {field.value}%
                                    </div>
                                </div>
                            )}
                        />
                        <Separator orientation="vertical" className="h-8" />
                        <FormField
                            control={form.control}
                            name="returnRate"
                            render={({ field }) => (
                                <div className="flex flex-col px-2">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Return</span>
                                    <div className="flex items-center gap-1 font-mono font-medium">
                                        <TrendingUp className="w-3 h-3 text-green-500" />
                                        {field.value}%
                                    </div>
                                </div>
                            )}
                        />
                    </Form>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* TABS NAVIGATION SYSTEM */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2 gap-2">
                            <TabsList className="bg-transparent p-0 gap-2 h-auto flex-wrap justify-start">
                                {fields.map((field, index) => (
                                    <TabsTrigger
                                        key={field.id}
                                        value={`child-${index}`}
                                        className={cn(
                                            "relative h-10 px-4 rounded-full border border-muted bg-background data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all shadow-sm min-w-30",
                                            "hover:border-primary/50"
                                        )}
                                    >
                                        <ChildNameTabWatcher control={form.control} index={index} />

                                        {/* Indikator Validasi (Dot) jika kosong/error bisa ditambahkan disini nanti */}
                                    </TabsTrigger>
                                ))}

                                {/* Tombol Tambah Anak */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddChild}
                                    className="h-10 w-10 rounded-full border-dashed border-2 border-muted-foreground/30 hover:border-primary hover:text-primary p-0"
                                    disabled={isLoading}
                                    title="Tambah Anak Lain"
                                >
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </TabsList>
                        </div>

                        {/* TAB CONTENT AREA */}
                        {fields.map((field, index) => (
                            <TabsContent key={field.id} value={`child-${index}`} className="mt-0 focus-visible:ring-0">
                                <Card className="border-none shadow-lg bg-card/60 backdrop-blur-sm ring-1 ring-border/50">
                                    <CardContent className="p-6 space-y-8">

                                        {/* SECTION 1: IDENTITY */}
                                        <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full md:w-3/4">
                                                <FormField
                                                    control={form.control}
                                                    name={`childrenPlans.${index}.childName`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <Smile className="w-4 h-4 text-primary" /> Nama Panggilan
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Contoh: Kakak Budi" {...field} className="bg-background/80" disabled={isLoading} />
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
                                                                <Input type="date" {...field} className="bg-background/80" disabled={isLoading} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* Delete Button (Only if > 1 child) */}
                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveChild(index)}
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive mt-8 md:mt-0"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" /> Hapus Anak
                                                </Button>
                                            )}
                                        </div>

                                        <Separator />

                                        {/* SECTION 2: STAGE SELECTION */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-500/20" />
                                                <h4 className="font-bold text-foreground">Jalur Pendidikan</h4>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Pilih jenjang sekolah yang ingin Anda persiapkan dananya.
                                            </p>

                                            {/* Isolated Logic Component per Child */}
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

                    {/* Global Error Message */}
                    {form.formState.errors.childrenPlans?.root && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium text-center animate-in shake">
                            {form.formState.errors.childrenPlans.root.message}
                        </div>
                    )}

                    {/* FOOTER ACTIONS */}
                    <div className="flex items-center justify-between gap-4 pt-6 border-t">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onBack}
                            className="flex items-center gap-2 hover:bg-muted"
                            disabled={isLoading}
                        >
                            <ChevronLeft className="w-4 h-4" /> Kembali
                        </Button>

                        <Button
                            type="submit"
                            size="lg"
                            className="px-8 shadow-lg shadow-primary/20 min-w-48 font-bold"
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

/**
 * Watcher Component: Mengupdate Judul Tab secara Real-time saat user mengetik nama
 */
function ChildNameTabWatcher({ control, index }: { control: Control<EducationSimulationForm>, index: number }) {
    const name = useWatch({
        control,
        name: `childrenPlans.${index}.childName`,
    });
    return <span className="truncate max-w-25">{name || `Anak #${index + 1}`}</span>;
}

/**
 * Stage Manager Component: Mengisolasi logika Add/Remove Stage agar tidak re-render parent berlebihan
 */
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

    // Extract level array untuk StageSelector
    const selectedLevels = currentStages?.map(s => s.level) || [];

    const handleStagesChange = (newLevels: SchoolLevelType[]) => {
        const currentYear = new Date().getFullYear();
        // Validasi tahun lahir, fallback ke tahun ini jika kosong
        const birthYear = childDob ? new Date(childDob).getFullYear() : currentYear;

        const calculateStartYear = (level: SchoolLevelType) => {
            const entryOffsets: Record<SchoolLevelType, number> = {
                TK: 4, SD: 6, SMP: 12, SMA: 15, S1: 18, S2: 23
            };
            return birthYear + entryOffsets[level];
        };

        // Reconcile arrays: Keep existing data if level exists, create new if not
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
                <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200/50">
                    <span className="text-lg">💡</span>
                    <p>
                        Mohon isi <strong>Tanggal Lahir</strong> terlebih dahulu agar kami bisa menghitung estimasi tahun masuk sekolah secara otomatis.
                    </p>
                </div>
            )}

            {fields.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center gap-2 pt-2">
                        <Badge variant="outline" className="text-xs font-normal bg-background">
                            {fields.length} Jenjang Dipilih
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

            {fields.length === 0 && childDob && (
                <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
                    <p>Belum ada jenjang sekolah yang dipilih.</p>
                    <p className="text-xs mt-1">Klik opsi di atas (TK, SD, SMP...) untuk menambahkan.</p>
                </div>
            )}
        </div>
    );
}