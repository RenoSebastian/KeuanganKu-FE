"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DeleteModuleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isDeleting: boolean;
    moduleTitle: string;
}

export function DeleteModuleDialog({
    open,
    onOpenChange,
    onConfirm,
    isDeleting,
    moduleTitle,
}: DeleteModuleDialogProps) {
    const [confirmInput, setConfirmInput] = useState("");
    const CONFIRM_KEYWORD = "DELETE";

    // Reset input setiap kali dialog dibuka/ditutup
    useEffect(() => {
        if (open) {
            setConfirmInput("");
        }
    }, [open]);

    const isConfirmed = confirmInput === CONFIRM_KEYWORD;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-red-100 rounded-full">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <AlertDialogTitle className="text-xl">Hapus Modul?</AlertDialogTitle>
                    </div>

                    <AlertDialogDescription className="space-y-4">
                        <p>
                            Tindakan ini bersifat <strong>PERMANEN</strong> dan tidak dapat dibatalkan.
                        </p>

                        <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-800">
                            <AlertDescription className="text-sm">
                                Modul <strong>"{moduleTitle}"</strong> akan dihapus beserta seluruh materi (Sections), Kuis, dan riwayat pengerjaan user.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2 pt-2">
                            <Label className="text-xs font-semibold text-gray-500 uppercase">
                                Ketik <span className="text-red-600 font-bold">"{CONFIRM_KEYWORD}"</span> untuk konfirmasi
                            </Label>
                            <Input
                                value={confirmInput}
                                onChange={(e) => setConfirmInput(e.target.value)}
                                placeholder="Ketik DELETE disini..."
                                className="border-red-200 focus-visible:ring-red-500"
                                autoComplete="off"
                            />
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="mt-4">
                    <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={!isConfirmed || isDeleting}
                        onClick={(e) => {
                            e.preventDefault();
                            if (isConfirmed) onConfirm();
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? (
                            "Menghapus..."
                        ) : (
                            <div className="flex items-center gap-2">
                                <Trash2 className="h-4 w-4" />
                                <span>Hapus Permanen</span>
                            </div>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}