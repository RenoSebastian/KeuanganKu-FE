import React from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InfoPopover } from "@/components/ui/info-popover";
import { User, Calendar, MapPin, Briefcase, Users } from "lucide-react";

// Tentukan tipe data untuk props agar komponen ini type-safe
interface ClientProfileFormProps {
    clientData: {
        clientName: string;
        clientDob: string;
        clientCity: string;
        clientJob: string;
        clientPhone: string;
    };
    dependents: number;
    onClientChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    // Kita buat handler spesifik untuk tanggungan agar lebih jelas
    onDependentsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ClientProfileForm = ({
    clientData,
    dependents,
    onClientChange,
    onDependentsChange
}: ClientProfileFormProps) => {
    return (
        <Card className="p-6 rounded-[2rem] shadow-xl border-white/60 bg-white">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-600" /> Profil Klien
            </h3>
            <div className="space-y-4">
                <div>
                    <Label className="text-xs font-semibold text-slate-500">Nama Lengkap</Label>
                    <Input
                        name="clientName"
                        placeholder="Contoh: Budi Santoso"
                        value={clientData.clientName}
                        onChange={onClientChange}
                        className="mt-1"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="text-xs font-semibold text-slate-500">Tanggal Lahir</Label>
                        <div className="relative mt-1">
                            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <Input
                                type="date"
                                name="clientDob"
                                value={clientData.clientDob}
                                onChange={onClientChange}
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs font-semibold text-slate-500">Nomor HP (Opsional)</Label>
                        <Input
                            name="clientPhone"
                            placeholder="0812..."
                            value={clientData.clientPhone}
                            onChange={onClientChange}
                            className="mt-1"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="text-xs font-semibold text-slate-500">Kota Domisili</Label>
                        <div className="relative mt-1">
                            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <Input
                                name="clientCity"
                                placeholder="Bandung"
                                value={clientData.clientCity}
                                onChange={onClientChange}
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs font-semibold text-slate-500">Pekerjaan</Label>
                        <div className="relative mt-1">
                            <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <Input
                                name="clientJob"
                                placeholder="PNS"
                                value={clientData.clientJob}
                                onChange={onClientChange}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </div>
                {/* INPUT JUMLAH TANGGUNGAN */}
                <div>
                    <Label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        Jumlah Tanggungan
                        <InfoPopover content={{
                            title: "Jumlah Tanggungan",
                            definition: "Orang yang biaya hidupnya bergantung pada penghasilan klien (Istri, Anak, Orang Tua).",
                            example: "Misal: Istri tidak bekerja + 2 anak = 3 Tanggungan."
                        }} />
                    </Label>
                    <div className="relative mt-1">
                        <Users className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={dependents || ""}
                            onChange={onDependentsChange}
                            className="pl-9"
                        />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">*Anak, Pasangan, atau Orang Tua yang dibiayai.</p>
                </div>
            </div>
        </Card>
    );
};