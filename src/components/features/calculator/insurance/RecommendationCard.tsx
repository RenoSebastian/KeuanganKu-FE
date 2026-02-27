import React from 'react';
import { ShieldCheck } from "lucide-react";

interface RecommendationCardProps {
    recommendation: string;
}

export const RecommendationCard = ({ recommendation }: RecommendationCardProps) => {
    if (!recommendation) return null;

    return (
        <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl flex gap-4 items-start animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="p-2 bg-blue-100 rounded-full text-blue-600 mt-1 shrink-0">
                <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
                <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">Rekomendasi Strategis</h4>
                <p className="text-sm text-blue-800 leading-relaxed font-medium">
                    {recommendation}
                </p>
            </div>
        </div>
    );
};