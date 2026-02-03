'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Save, ArrowLeft, Plus, Trash2, Image as ImageIcon, Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

import { moduleFormSchema, ModuleFormValues } from '@/lib/schemas/education-schema';
import { educationService } from '@/services/education.service';
import {
    EducationCategory,
    EducationModule,
    EducationLevel,
    CreateModulePayload,
    UpdateModulePayload,
    SectionPayload
} from '@/lib/types/education';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import api from '@/lib/axios';

interface ModuleFormProps {
    initialData?: EducationModule;
}

export function ModuleForm({ initialData }: ModuleFormProps) {
    const router = useRouter();
    const [categories, setCategories] = useState<EducationCategory[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState<string | null>(null);

    const form = useForm<ModuleFormValues>({
        resolver: zodResolver(moduleFormSchema) as Resolver<ModuleFormValues>,
        defaultValues: {
            title: initialData?.title || '',
            categoryId: initialData?.categoryId || '',
            thumbnailUrl: initialData?.thumbnailUrl || '',
            excerpt: initialData?.excerpt || '',
            // [FIX] Menggunakan default value yang valid untuk number dan enum
            readingTime: initialData?.readingTime || 5,
            level: initialData?.level || EducationLevel.BEGINNER,
            points: initialData?.points || 0,
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

    useUnsavedChanges(form.formState.isDirty && !form.formState.isSubmitSuccessful);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await educationService.getCategories();
                setCategories(data);
            } catch (error) {
                toast.error('Gagal memuat data kategori.');
            }
        };
        loadCategories();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, index?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Ukuran file terlalu besar (Maksimal 2MB)");
            return;
        }

        const uploadKey = index !== undefined ? `section-${index}` : 'thumbnail';
        setIsUploading(uploadKey);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Handle response wrapper structure
            const filePath = res.data?.data?.url || res.data?.url;

            if (index !== undefined) {
                form.setValue(`sections.${index}.illustrationUrl`, filePath, { shouldDirty: true });
            } else {
                form.setValue('thumbnailUrl', filePath, { shouldDirty: true });
            }
            toast.success("Gambar berhasil diunggah");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Gagal mengunggah gambar ke server");
        } finally {
            setIsUploading(null);
        }
    };

    const onSubmit = async (data: ModuleFormValues) => {
        setIsSubmitting(true);
        try {
            // [FIX] Strict Type Mapping untuk Payload
            // Memastikan array sections sesuai dengan SectionPayload DTO
            const sectionsPayload: SectionPayload[] = data.sections.map(s => ({
                title: s.title || '',
                contentMarkdown: s.contentMarkdown,
                sectionOrder: s.sectionOrder,
                illustrationUrl: s.illustrationUrl
            }));

            if (initialData?.id) {
                const payload: UpdateModulePayload = {
                    ...data,
                    sections: sectionsPayload
                };
                await educationService.updateModule(initialData.id, payload);
                toast.success('Modul berhasil diperbarui');
            } else {
                const payload: CreateModulePayload = {
                    ...data,
                    sections: sectionsPayload
                };
                await educationService.createModule(payload);
                toast.success('Modul baru berhasil dibuat');
            }

            form.reset(data);
            router.push('/admin/education');
            router.refresh();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan modul.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPreviewUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');
        if (path.startsWith('api/')) return `${base}/${path}`;
        if (path.startsWith('uploads/')) return `${base}/api/${path}`;
        return `${base}/${path}`;
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <Button variant="ghost" type="button" onClick={() => router.back()} className="text-muted-foreground">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                </Button>
                <div className="flex gap-3">
                    <Button type="submit" disabled={isSubmitting || !!isUploading}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        {initialData ? 'Perbarui Modul' : 'Simpan Modul Baru'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm bg-white">
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-3">
                                <Label className="font-bold text-base">Judul Modul</Label>
                                <Input
                                    {...form.register('title')}
                                    placeholder="Contoh: Strategi Mengelola Keuangan Pribadi"
                                    className="text-lg font-medium h-12"
                                />
                                {form.formState.errors.title && <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>}
                            </div>

                            <div className="space-y-3">
                                <Label className="font-bold text-base">Ringkasan Singkat</Label>
                                <Textarea
                                    {...form.register('excerpt')}
                                    placeholder="Deskripsi singkat yang akan muncul di kartu modul..."
                                    className="h-24 resize-none"
                                />
                                {form.formState.errors.excerpt && <p className="text-xs text-red-500">{form.formState.errors.excerpt.message}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-bold">Materi Pembelajaran</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ title: '', contentMarkdown: '', sectionOrder: fields.length + 1, illustrationUrl: '' })}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Tambah Halaman
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {fields.map((field, index) => {
                                const currentIllustrationUrl = form.watch(`sections.${index}.illustrationUrl`);
                                return (
                                    <Card key={field.id} className="overflow-hidden border-l-4 border-l-primary/40 shadow-sm">
                                        <CardContent className="pt-6 space-y-5">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 mr-4 space-y-2">
                                                    <Label className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Halaman {index + 1}</Label>
                                                    <Input {...form.register(`sections.${index}.title`)} placeholder="Judul Bagian..." className="font-semibold" />
                                                </div>
                                                {fields.length > 1 && (
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-red-500 hover:bg-red-50">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Konten Materi (Markdown)</Label>
                                                <Textarea
                                                    {...form.register(`sections.${index}.contentMarkdown`)}
                                                    className="min-h-80 font-mono text-sm leading-relaxed bg-slate-50/50"
                                                    placeholder="# Judul..."
                                                />
                                                {form.formState.errors.sections?.[index]?.contentMarkdown && (
                                                    <p className="text-xs text-red-500">{form.formState.errors.sections[index]?.contentMarkdown?.message}</p>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-sm font-medium">Gambar Ilustrasi</Label>
                                                <div className="flex items-center gap-4">
                                                    {currentIllustrationUrl ? (
                                                        <div className="relative w-32 h-20 rounded-md overflow-hidden border bg-muted shadow-sm">
                                                            <img src={getPreviewUrl(currentIllustrationUrl)} alt="Preview" className="w-full h-full object-cover" />
                                                            <button type="button" onClick={() => form.setValue(`sections.${index}.illustrationUrl`, '', { shouldDirty: true })} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                                                        </div>
                                                    ) : (
                                                        <div className="w-32 h-20 border-2 border-dashed rounded-md flex flex-col items-center justify-center bg-muted/30 text-muted-foreground">
                                                            <ImageIcon className="w-6 h-6 mb-1 opacity-20" />
                                                            <span className="text-[10px]">No Image</span>
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <Input type="file" accept="image/*" className="hidden" id={`file-section-${index}`} onChange={(e) => handleFileUpload(e, 'sections', index)} />
                                                        <Label htmlFor={`file-section-${index}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-9 px-4 cursor-pointer">
                                                            {isUploading === `section-${index}` ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                                            {currentIllustrationUrl ? 'Ganti Gambar' : 'Upload Gambar'}
                                                        </Label>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="sticky top-6 shadow-sm border-t-4 border-t-primary">
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-2">
                                <Label className="font-bold">Kategori</Label>
                                <Select onValueChange={(val) => form.setValue('categoryId', val, { shouldValidate: true, shouldDirty: true })} defaultValue={initialData?.categoryId}>
                                    <SelectTrigger><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.categoryId && <p className="text-xs text-red-500">{form.formState.errors.categoryId.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold">Level Kesulitan</Label>
                                <Select onValueChange={(val) => form.setValue('level', val as EducationLevel, { shouldValidate: true, shouldDirty: true })} defaultValue={initialData?.level || EducationLevel.BEGINNER}>
                                    <SelectTrigger><SelectValue placeholder="Pilih Level" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={EducationLevel.BEGINNER}>Beginner</SelectItem>
                                        <SelectItem value={EducationLevel.INTERMEDIATE}>Intermediate</SelectItem>
                                        <SelectItem value={EducationLevel.ADVANCED}>Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold">Estimasi Waktu Baca</Label>
                                <div className="relative">
                                    <Input type="number" {...form.register('readingTime', { valueAsNumber: true })} className="pr-12" />
                                    <span className="absolute right-3 top-2.5 text-sm text-gray-400">Menit</span>
                                </div>
                                {form.formState.errors.readingTime && <p className="text-xs text-red-500">{form.formState.errors.readingTime.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold">Poin Reward</Label>
                                <div className="relative">
                                    <Input type="number" {...form.register('points', { valueAsNumber: true })} className="pr-12" />
                                    <span className="absolute right-3 top-2.5 text-sm text-gray-400">Pts</span>
                                </div>
                                {form.formState.errors.points && <p className="text-xs text-red-500">{form.formState.errors.points.message}</p>}
                            </div>

                            <div className="space-y-3">
                                <Label className="font-bold">Cover Modul</Label>
                                <div className="space-y-4">
                                    {form.watch('thumbnailUrl') ? (
                                        <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                                            <img src={getPreviewUrl(form.watch('thumbnailUrl'))} alt="Cover Preview" className="w-full h-full object-cover" />
                                            <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 shadow-md" onClick={() => form.setValue('thumbnailUrl', '', { shouldDirty: true })}><X className="w-4 h-4" /></Button>
                                        </div>
                                    ) : (
                                        <div className="aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/20 text-muted-foreground"><Upload className="w-8 h-8 mb-2 opacity-10" /><p className="text-xs">Belum ada cover</p></div>
                                    )}
                                    <Input type="file" accept="image/*" className="hidden" id="module-thumbnail" onChange={(e) => handleFileUpload(e, 'thumbnailUrl')} />
                                    <Label htmlFor="module-thumbnail" className="flex items-center justify-center w-full rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-10 px-4 cursor-pointer">
                                        {isUploading === 'thumbnail' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />} Upload Cover
                                    </Label>
                                </div>
                                {form.formState.errors.thumbnailUrl && <p className="text-xs text-red-500">{form.formState.errors.thumbnailUrl.message}</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}