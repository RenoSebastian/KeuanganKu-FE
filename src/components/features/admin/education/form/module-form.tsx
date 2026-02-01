'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Save, ArrowLeft, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

import { moduleFormSchema, ModuleFormValues } from '@/lib/schemas/education-schema';
import { adminEducationService, publicEducationService } from '@/services/education.service';
import { EducationCategory, EducationModule } from '@/lib/types/education';
// [NEW] Import Guardrail Hook
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';

interface ModuleFormProps {
    initialData?: EducationModule;
}

export function ModuleForm({ initialData }: ModuleFormProps) {
    const router = useRouter();
    const [categories, setCategories] = useState<EducationCategory[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ModuleFormValues>({
        resolver: zodResolver(moduleFormSchema),
        defaultValues: {
            title: initialData?.title || '',
            categoryId: initialData?.category?.id || '',
            thumbnailUrl: initialData?.thumbnailUrl || '',
            excerpt: initialData?.excerpt || '',
            readingTime: initialData?.readingTime || 5,
            sections: initialData?.sections?.map(s => ({
                title: s.title || '',
                contentMarkdown: s.contentMarkdown,
                sectionOrder: s.sectionOrder,
                illustrationUrl: s.illustrationUrl || ''
            })) || [
                    { title: 'Pendahuluan', contentMarkdown: '', sectionOrder: 1, illustrationUrl: '' }
                ]
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'sections',
    });

    // [NEW] Guardrail: Prevent Accidental Navigation
    // Hook ini akan memunculkan alert browser jika user refresh/close tab saat isDirty = true
    useUnsavedChanges(form.formState.isDirty && !form.formState.isSubmitSuccessful);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await publicEducationService.getCategories();
                setCategories(data);
            } catch (error) {
                toast.error('Gagal memuat data kategori.');
            }
        };
        loadCategories();
    }, []);

    const onSubmit = async (data: ModuleFormValues) => {
        setIsSubmitting(true);
        try {
            if (initialData) {
                await adminEducationService.updateModule(initialData.id, data);
                toast.success('Modul berhasil diperbarui');
            } else {
                await adminEducationService.createModule(data);
                toast.success('Modul baru berhasil dibuat');
            }

            // Reset form state agar hook unsaved changes tidak ter-trigger saat redirect
            form.reset(data);

            router.push('/admin/education');
            router.refresh();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan modul.');
            // NOTE: Kita TIDAK mereset form jika error, agar user tidak kehilangan inputan mereka
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <Button variant="ghost" type="button" onClick={() => router.back()} className="text-muted-foreground">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {initialData ? 'Perbarui Modul' : 'Simpan Modul Baru'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* ... (Render Field yang sama seperti Fase 3) ... */}
                    {/* Code block untuk render input dipersingkat karena sama persis dengan Fase 3 */}
                    {/* Fokus di file ini adalah penambahan logic Guardrail dan handling onSubmit */}
                    <div className="space-y-3">
                        <Label>Judul Modul</Label>
                        <Input
                            {...form.register('title')}
                            placeholder="Contoh: Strategi Mengelola Keuangan Pribadi"
                            className="text-lg font-medium"
                        />
                        {form.formState.errors.title && <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>}
                    </div>

                    <div className="space-y-3">
                        <Label>Ringkasan Singkat (Excerpt)</Label>
                        <Textarea
                            {...form.register('excerpt')}
                            placeholder="Deskripsi singkat yang akan muncul di kartu modul..."
                            className="h-24 resize-none"
                        />
                        {form.formState.errors.excerpt && <p className="text-xs text-red-500">{form.formState.errors.excerpt.message}</p>}
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">Materi Pembelajaran</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ title: '', contentMarkdown: '', sectionOrder: fields.length + 1 })}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Tambah Halaman
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {fields.map((field, index) => (
                                <Card key={field.id} className="overflow-hidden border-l-4 border-l-blue-500/20">
                                    <CardContent className="pt-6 space-y-5">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 mr-4 space-y-2">
                                                <Label className="text-xs uppercase text-muted-foreground font-bold">Bagian {index + 1}</Label>
                                                <Input {...form.register(`sections.${index}.title`)} placeholder="Judul Bagian / Bab..." />
                                            </div>
                                            {fields.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-red-500 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Konten (Markdown)</Label>
                                            <Textarea
                                                {...form.register(`sections.${index}.contentMarkdown`)}
                                                className="min-h-75 font-mono text-sm leading-relaxed"
                                                placeholder="# Judul Utama&#10;&#10;Paragraf pembuka materi..."
                                            />
                                            {form.formState.errors.sections?.[index]?.contentMarkdown && (
                                                <p className="text-xs text-red-500">{form.formState.errors.sections[index]?.contentMarkdown?.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <ImageIcon className="w-3 h-3" /> Ilustrasi URL (Opsional)
                                            </Label>
                                            <Input {...form.register(`sections.${index}.illustrationUrl`)} placeholder="https://example.com/image.jpg" className="text-xs h-8" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="sticky top-6">
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-2">
                                <Label>Kategori</Label>
                                <Select
                                    onValueChange={(val) => form.setValue('categoryId', val, { shouldValidate: true })}
                                    defaultValue={initialData?.category?.id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.categoryId && <p className="text-xs text-red-500">{form.formState.errors.categoryId.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Cover Image (URL)</Label>
                                <Input {...form.register('thumbnailUrl')} placeholder="https://..." />
                                <p className="text-[10px] text-muted-foreground">Disarankan rasio 16:9</p>
                                {form.formState.errors.thumbnailUrl && <p className="text-xs text-red-500">{form.formState.errors.thumbnailUrl.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Estimasi Waktu Baca</Label>
                                <div className="relative">
                                    <Input type="number" {...form.register('readingTime', { valueAsNumber: true })} className="pr-12" />
                                    <span className="absolute right-3 top-2.5 text-sm text-gray-400">Menit</span>
                                </div>
                                {form.formState.errors.readingTime && <p className="text-xs text-red-500">{form.formState.errors.readingTime.message}</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}