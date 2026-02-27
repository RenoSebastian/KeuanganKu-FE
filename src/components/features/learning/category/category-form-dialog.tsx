"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { CategoryForm } from "./category-form";
import { EducationCategory } from "@/lib/types/education";

interface CategoryFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: EducationCategory | null;
    onSuccess: () => void;
}

export function CategoryFormDialog({ open, onOpenChange, initialData, onSuccess }: CategoryFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-125">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Kategori" : "Tambah Kategori Baru"}</DialogTitle>
                    <DialogDescription>
                        Isi form di bawah ini untuk mengelola kategori pembelajaran.
                    </DialogDescription>
                </DialogHeader>
                <CategoryForm
                    initialData={initialData}
                    onSuccess={onSuccess}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
}