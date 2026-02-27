import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export function QuotaAlert({ hasAccess, isLoading }: { hasAccess: boolean, isLoading: boolean }) {
    if (hasAccess || isLoading) return null;

    return (
        <Card className="p-5 rounded-2xl bg-red-50 border border-red-200 shadow-sm animate-pulse">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-xl text-red-600"><Lock className="w-6 h-6" /></div>
                <div>
                    <h3 className="text-sm font-bold text-red-800">Kuota Simulasi Habis</h3>
                    <p className="text-xs text-red-600 mt-1">Upgrade ke PRO untuk akses tanpa batas.</p>
                    <Link href="/pricing">
                        <Button size="sm" className="mt-3 bg-red-600 hover:bg-red-700 text-white font-bold w-full rounded-xl">Upgrade Sekarang</Button>
                    </Link>
                </div>
            </div>
        </Card>
    );
}