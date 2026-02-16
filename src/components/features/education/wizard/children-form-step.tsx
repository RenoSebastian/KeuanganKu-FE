"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Baby, Plus, Trash2, GraduationCap, School, Calculator, ChevronLeft } from "lucide-react";
import { SchoolLevel, CostType, EducationMethod } from "@/lib/types/education";

/**
 * Schema Validasi untuk Array Anak & Jenjang Sekolah
 */
const stageSchema = z.object({
    level: z.nativeEnum(SchoolLevel),
    costType: z.nativeEnum(CostType),
    currentCost: z.coerce.number().min(0, "Biaya tidak boleh negatif"),
    yearsToStart: z.coerce.number().min(0, "Tahun mulai tidak valid"),
});

const childPlanSchema = z.object({
    childName: z.string().min(2, "Nama anak minimal 2 karakter"),
    childDob: z.string().min(1, "Tanggal lahir anak wajib diisi"),
    method: z.nativeEnum(EducationMethod).default(EducationMethod.GEOMETRIC),
    inflationRate: z.coerce.number().default(10),
    returnRate: z.coerce.number().default(12),
    stages: z.array(stageSchema).min(1, "Minimal pilih 1 jenjang sekolah"),
});

const childrenFormSchema = z.object({
    childrenPlans: z.array(childPlanSchema).min(1, "Minimal masukkan 1 data anak"),
});

type ChildrenFormValues = z.infer<typeof childrenFormSchema>;

interface ChildrenFormStepProps {
    initialData?: Partial<ChildrenFormValues>;
    onNext: (data: ChildrenFormValues) => void;
    onBack: () => void;
}

export const ChildrenFormStep: React.FC<ChildrenFormStepProps> = ({
    initialData,
    onNext,
    onBack
}) => {
    const form = useForm<ChildrenFormValues>({
        resolver: zodResolver(childrenFormSchema),
        defaultValues: {
            childrenPlans: initialData?.childrenPlans || [
                {
                    childName: "",
                    childDob: "",
                    method: EducationMethod.GEOMETRIC,
                    inflationRate: 10,
                    returnRate: 12,
                    stages: [
                        { level: SchoolLevel.SD, costType: CostType.ENTRY, currentCost: 0, yearsToStart: 0 },
                        { level: SchoolLevel.SMP, costType: CostType.ENTRY, currentCost: 0, yearsToStart: 0 },
                        { level: SchoolLevel.SMA, costType: CostType.ENTRY, currentCost: 0, yearsToStart: 0 },
                        { level: SchoolLevel.S1, costType: CostType.ENTRY, currentCost: 0, yearsToStart: 0 },
                    ],
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        name: "childrenPlans",
        control: form.control,
    });

    const onSubmit = (values: ChildrenFormValues) => {
        onNext(values);
    };

    const addNewChild = () => {
        append({
            childName: "",
            childDob: "",
            method: EducationMethod.GEOMETRIC,
            inflationRate: 10,
            returnRate: 12,
            stages: [
                { level: SchoolLevel.SD, costType: CostType.ENTRY, currentCost: 0, yearsToStart: 0 },
                { level: SchoolLevel.SMP, costType: CostType.ENTRY, currentCost: 0, yearsToStart: 0 },
                { level: SchoolLevel.SMA, costType: CostType.ENTRY, currentCost: 0, yearsToStart: 0 },
                { level: SchoolLevel.S1, costType: CostType.ENTRY, currentCost: 0, yearsToStart: 0 },
            ],
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Baby className="w-5 h-5 text-primary" />
                        Daftar Anak Klien
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Input rencana sekolah untuk setiap anak klien.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addNewChild}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Tambah Anak
                </Button>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Accordion type="multiple" defaultValue={["child-0"]} className="space-y-4">
                        {fields.map((field, index) => (
                            <AccordionItem
                                key={field.id}
                                value={`child-${index}`}
                                className="border rounded-lg bg-card px-4"
                            >
                                <div className="flex items-center justify-between py-2">
                                    <AccordionTrigger className="hover:no-underline py-2">
                                        <span className="font-semibold text-primary">
                                            {form.watch(`childrenPlans.${index}.childName`) || `Anak Ke-${index + 1}`}
                                        </span>
                                    </AccordionTrigger>
                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive h-8 w-8"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>

                                <AccordionContent className="pt-2 pb-6 space-y-6">
                                    {/* Basic Child Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name={`childrenPlans.${index}.childName`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nama Anak</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Contoh: Andi" {...field} />
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

                                    {/* Assumptions per Child */}
                                    <div className="bg-muted/30 p-4 rounded-md grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name={`childrenPlans.${index}.inflationRate`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Inflasi Sekolah (%)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" step="0.1" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`childrenPlans.${index}.returnRate`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Return Investasi (%)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" step="0.1" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`childrenPlans.${index}.method`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-2 md:col-span-1">
                                                    <FormLabel className="text-xs">Metode</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger size="sm">
                                                                <SelectValue placeholder="Pilih Metode" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value={EducationMethod.GEOMETRIC}>Geometric (Progresif)</SelectItem>
                                                            <SelectItem value={EducationMethod.ARITHMETIC}>Arithmetic (Flat)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* School Stages Table */}
                                    <div className="space-y-3">
                                        <FormLabel className="flex items-center gap-2 underline">
                                            <GraduationCap className="w-4 h-4" /> Rincian Biaya Sekolah
                                        </FormLabel>
                                        <div className="overflow-x-auto border rounded-md">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left">Jenjang</th>
                                                        <th className="px-3 py-2 text-left">Tahun Lagi</th>
                                                        <th className="px-3 py-2 text-left">Biaya Skrg (Rp)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {form.watch(`childrenPlans.${index}.stages`).map((_, sIndex) => (
                                                        <tr key={sIndex}>
                                                            <td className="px-3 py-2 font-medium">
                                                                {form.getValues(`childrenPlans.${index}.stages.${sIndex}.level`)}
                                                            </td>
                                                            <td className="px-3 py-2 w-32">
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`childrenPlans.${index}.stages.${sIndex}.yearsToStart`}
                                                                    render={({ field }) => (
                                                                        <Input
                                                                            type="number"
                                                                            className="h-8 py-1 px-2"
                                                                            {...field}
                                                                        />
                                                                    )}
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`childrenPlans.${index}.stages.${sIndex}.currentCost`}
                                                                    render={({ field }) => (
                                                                        <Input
                                                                            type="number"
                                                                            className="h-8 py-1 px-2"
                                                                            {...field}
                                                                        />
                                                                    )}
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    <div className="flex items-center justify-between gap-4 pt-4 border-t">
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
                            disabled={form.formState.isSubmitting}
                            className="px-10"
                        >
                            <Calculator className="w-4 h-4 mr-2" /> Hitung Simulasi
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};