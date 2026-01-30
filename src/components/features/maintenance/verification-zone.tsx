"use client";

import { useState, useRef, ChangeEvent } from "react";
import { UploadCloud, FileCheck, XCircle, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// Types & Hooks
import { RetentionEntityType, StreamMetadata } from "@/lib/types/retention";
import { useFileInspector } from "@/hooks/use-file-inspector";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VerificationZoneProps {
    entityType: RetentionEntityType;
    cutoffDate: string;
    isExportDone: boolean; // Zone hanya aktif jika export sudah dilakukan
    onTokenVerified: (token: string) => void;
    onTokenRevoked: () => void;
}

export function VerificationZone({
    entityType,
    cutoffDate,
    isExportDone,
    onTokenVerified,
    onTokenRevoked,
}: VerificationZoneProps) {
    // --- STATE UI ---
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- LOGIC HOOK ---
    const {
        isScanning,
        progress,
        error,
        fileData,
        inspectFile,
        resetInspector
    } = useFileInspector({
        expectedEntityType: entityType,
        expectedCutoffDate: cutoffDate,
        onVerificationSuccess: (token, meta) => onTokenVerified(token),
        onVerificationFailed: () => onTokenRevoked(),
    });

    // --- EVENT HANDLERS ---

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!isExportDone || isScanning) return;
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (!isExportDone || isScanning) return;

        const files = e.dataTransfer.files;
        if (files?.length > 0) {
            await inspectFile(files[0]);
        }
    };

    const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            await inspectFile(e.target.files[0]);
        }
    };

    const handleReset = () => {
        if (fileInputRef.current) fileInputRef.current.value = "";
        resetInspector();
    };

    // --- RENDER HELPERS ---

    // 1. STATE: LOCKED (Belum Export)
    if (!isExportDone) {
        return (
            <Card className="bg-slate-50 border-dashed border-2 border-slate-200 opacity-60">
                <CardContent className="flex flex-col items-center justify-center h-48 text-center p-6">
                    <ShieldCheck className="h-10 w-10 text-slate-300 mb-3" />
                    <h3 className="text-sm font-semibold text-slate-500">Verifikasi Terkunci</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        Lakukan "Secure Export" di atas terlebih dahulu untuk membuka area verifikasi ini.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // 2. STATE: SUCCESS (Token Valid)
    if (fileData) {
        return (
            <Card className="bg-green-50 border-green-200 border-2 animate-in fade-in">
                <CardContent className="flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="bg-green-100 p-3 rounded-full">
                        <FileCheck className="h-8 w-8 text-green-600" />
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-green-800">Integritas Terverifikasi</h3>
                        <p className="text-sm text-green-700">
                            Security Token valid ditemukan. Anda siap melakukan pembersihan.
                        </p>
                    </div>

                    {/* Metadata Summary */}
                    <div className="w-full bg-white/60 rounded-md p-3 text-xs text-left space-y-1 border border-green-100">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Entity:</span>
                            <span className="font-mono font-bold">{fileData.entityType}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Records:</span>
                            <span className="font-mono">{fileData.totalRecords.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Generated:</span>
                            <span className="font-mono">{new Date(fileData.exportedAt).toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <Button variant="outline" size="sm" onClick={handleReset} className="border-green-300 text-green-700 hover:bg-green-100">
                        Scan File Lain
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // 3. STATE: IDLE / DRAGGING / SCANNING / ERROR
    return (
        <Card
            className={cn(
                "relative transition-all duration-200 border-2 border-dashed",
                isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-white",
                error ? "border-red-300 bg-red-50" : ""
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-purple-600" />
                    Langkah 2: Verifikasi Integritas
                </CardTitle>
                <CardDescription>
                    Drag & Drop file yang baru Anda download di sini untuk membuka kunci tombol hapus.
                </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center justify-center min-h-40 pb-8">

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInput}
                    accept=".json"
                    className="hidden"
                />

                {isScanning ? (
                    <div className="flex flex-col items-center space-y-3">
                        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                        <div className="space-y-1 text-center">
                            <p className="text-sm font-medium text-slate-700">Memindai Struktur File...</p>
                            <p className="text-xs text-slate-400">{progress}% completed</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center space-y-3 animate-in zoom-in-95">
                        <XCircle className="h-10 w-10 text-red-500" />
                        <div className="text-center px-4">
                            <p className="text-sm font-bold text-red-600">Verifikasi Gagal</p>
                            <p className="text-xs text-red-500 mt-1">{error}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleReset} className="text-red-600 hover:bg-red-100">
                            Coba Lagi
                        </Button>
                    </div>
                ) : (
                    // IDLE STATE
                    <div className="flex flex-col items-center space-y-3 text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="bg-slate-100 p-4 rounded-full transition-transform active:scale-95">
                            <UploadCloud className={cn("h-8 w-8", isDragging ? "text-blue-500" : "text-slate-400")} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700">
                                {isDragging ? "Lepaskan file di sini" : "Klik untuk upload atau drag file"}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Hanya file .json hasil export sistem</p>
                        </div>
                    </div>
                )}

            </CardContent>
        </Card>
    );
}