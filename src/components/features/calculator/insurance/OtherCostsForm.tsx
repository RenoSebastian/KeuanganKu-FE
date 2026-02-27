import React from 'react';
import { Card } from "@/components/ui/card";
import { Landmark } from "lucide-react";
import { InputGroup } from "./InputGroup";

interface OtherCostsFormProps {
    finalExpense: string;
    existingInsurance: string;
    onFinalExpenseChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onExistingInsuranceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const OtherCostsForm = ({
    finalExpense,
    existingInsurance,
    onFinalExpenseChange,
    onExistingInsuranceChange
}: OtherCostsFormProps) => {
    return (
        <Card className="p-6 rounded-[2rem] shadow-xl border-white/60 bg-white">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                <Landmark className="w-5 h-5 text-brand-600" /> 3. Biaya Duka & Asuransi Existing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Biaya Pemakaman & RS</label>
                    <InputGroup
                        value={finalExpense}
                        onChange={onFinalExpenseChange}
                        placeholder="0"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-emerald-600 uppercase">Asuransi Jiwa yg Sudah Punya</label>
                    <InputGroup
                        value={existingInsurance}
                        onChange={onExistingInsuranceChange}
                        placeholder="0"
                    />
                </div>
            </div>
        </Card>
    );
};