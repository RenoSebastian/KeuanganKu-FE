import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Data Maintenance & Retention | KeuanganKu Admin",
    description: "Pusat kendali untuk pengarsipan data, pembersihan storage, dan manajemen siklus hidup database.",
};

interface MaintenanceLayoutProps {
    children: React.ReactNode;
}

/**
 * Layout khusus untuk modul Maintenance.
 * Memberikan Header konsisten dan pemisahan visual dari modul admin lainnya.
 */
export default function MaintenanceLayout({ children }: MaintenanceLayoutProps) {
    return (
        <div className="flex flex-col space-y-6">
            {/* HEADER SECTION
        Memberikan konteks jelas tentang halaman ini.
        Menggunakan typography standard Tailwind (h2 untuk page title).
      */}
            <div className="flex flex-col space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Data Retention & Maintenance
                </h2>
                <p className="text-muted-foreground">
                    Kelola kapasitas database, lakukan pengarsipan data historis, dan eksekusi pembersihan (pruning) data lama secara aman.
                </p>
            </div>

            {/* Separator Visual */}
            <div className="h-px bg-slate-200 w-full" />

            {/* CONTENT AREA
        Tempat di mana page.tsx akan dirender.
        Kita tidak memberikan padding tambahan di sini karena page.tsx 
        akan mengatur grid/layout internalnya sendiri.
      */}
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}