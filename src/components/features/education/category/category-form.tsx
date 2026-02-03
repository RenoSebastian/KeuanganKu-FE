"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

// Services & API
import apiClient from "@/lib/axios";
import { educationService } from "@/services/education.service";

// Types & Schemas
import {
    EducationCategory,
    CreateCategoryPayload,
    UpdateCategoryPayload
} from "@/lib/types/education";
import {
    categorySchema,
    CategoryFormValues
} from "@/lib/schemas/education-schema";

// UI Components
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CategoryFormProps {
    initialData?: EducationCategory | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export function CategoryForm({ initialData, onSuccess, onCancel }: CategoryFormProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Initialize Form
    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            iconUrl: initialData?.iconUrl || "",
        },
    });

    // 2. Media Upload Handler (Instant Upload Pattern)
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validasi Ukuran di Client (Pre-check) - Max 2MB
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Ukuran file terlalu besar. Maksimal 2MB.");
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("file", file);

            // POST ke Media Service Backend
            const response = await apiClient.post("/media/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Adapt response structure (handle wrapped or direct data)
            const uploadedUrl = response.data.data?.url || response.data.url;

            // Update form state
            form.setValue("iconUrl", uploadedUrl, { shouldValidate: true, shouldDirty: true });
            toast.success("Icon berhasil diupload");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Gagal mengupload gambar. Pastikan format JPG/PNG.");
        } finally {
            setIsUploading(false);
            e.target.value = ""; // Reset input
        }
    };

    const handleRemoveImage = () => {
        form.setValue("iconUrl", "", { shouldValidate: true, shouldDirty: true });
    };

    // Helper untuk menampilkan gambar preview dengan path yang benar
    const getImageUrl = (path: string) => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');
        if (path.startsWith('api/')) return `${base}/${path}`;
        if (path.startsWith('uploads/')) return `${base}/api/${path}`;
        return `${base}/${path}`;
    };

    // 3. Submit Handler
    const onSubmit = async (values: CategoryFormValues) => {
        try {
            setIsSubmitting(true);

            if (initialData?.id) {
                // Mode Edit
                const payload: UpdateCategoryPayload = values;
                await educationService.updateCategory(initialData.id, payload);
                toast.success("Kategori berhasil diperbarui");
            } else {
                // Mode Create
                const payload: CreateCategoryPayload = {
                    name: values.name,
                    description: values.description || "",
                    iconUrl: values.iconUrl,
                };
                await educationService.createCategory(payload);
                toast.success("Kategori baru berhasil dibuat");
            }

            onSuccess(); // Tutup dialog & refresh list
        } catch (error: any) {
            console.error("Submit error:", error);
            const msg = error.response?.data?.message || "Terjadi kesalahan saat menyimpan data.";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* --- Media Upload Section --- */}
                <FormField
                    control={form.control}
                    name="iconUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Icon Kategori</FormLabel>
                            <FormControl>
                                <div className="flex items-center gap-4">
                                    {/* Image Preview Area */}
                                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-gray-50">
                                        {field.value ? (
                                            <>
                                                <Image
                                                    src={getImageUrl(field.value)}
                                                    alt="Icon Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="absolute right-0 top-0 bg-red-500 p-1 text-white hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                                {isUploading ? (
                                                    <Loader2 className="h-6 w-6 animate-spin" />
                                                ) : (
                                                    <ImageIcon className="h-8 w-8 opacity-50" />
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Upload Button */}
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={isUploading}
                                            onClick={() => document.getElementById("icon-upload-trigger")?.click()}
                                        >
                                            {isUploading ? "Uploading..." : "Upload Icon"}
                                            <Upload className="ml-2 h-4 w-4" />
                                        </Button>
                                        <input
                                            id="icon-upload-trigger"
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg, image/webp"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                        <p className="text-[10px] text-muted-foreground">
                                            Max 2MB. Format: PNG, JPG, WEBP.
                                        </p>
                                    </div>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* --- Text Fields --- */}
                <div className="grid gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Kategori</FormLabel>
                                <FormControl>
                                    <Input placeholder="Contoh: Investasi Saham" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Deskripsi (Opsional)</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Jelaskan singkat tentang kategori ini..."
                                        className="resize-none"
                                        rows={3}
                                        {...field}
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* --- Action Buttons --- */}
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={isSubmitting || isUploading}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Simpan Perubahan" : "Buat Kategori"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}