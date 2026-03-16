'use client';

import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { mediaService } from '@/services/media.service';

interface MarkdownRendererProps {
    content: string;
    // [FIXED] Menambahkan kontrak baru untuk menerima array gambar dari Section
    imageUrls?: string[];
    className?: string;
}

export function MarkdownRenderer({ content, imageUrls = [], className }: MarkdownRendererProps) {
    return (
        <div className="space-y-8">

            {/* [FEATURE] Multi-Image / Smart Grid Gallery Renderer */}
            {imageUrls.length > 0 && (
                <div className={cn(
                    "grid gap-4",
                    imageUrls.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
                )}>
                    {imageUrls.map((url, index) => (
                        <div
                            key={index}
                            className={cn(
                                "relative overflow-hidden rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 bg-muted group",
                                // Logika penyesuaian dimensi berdasarkan jumlah gambar
                                imageUrls.length === 1 ? "max-h-100 flex justify-center w-full" : "aspect-video",
                                // Jika ada 3 gambar, gambar terakhir membentang 2 kolom (Masonry effect)
                                (imageUrls.length === 3 && index === 2) ? "md:col-span-2 md:aspect-21/9" : ""
                            )}
                        >
                            <img
                                src={mediaService.getFullUrl(url)}
                                alt={`Ilustrasi Materi ${index + 1}`}
                                className={cn(
                                    "w-full h-full transition-transform duration-500 group-hover:scale-105",
                                    // Gambar tunggal dipertahankan rasionya, Grid menggunakan cover agar seragam
                                    imageUrls.length === 1 ? "object-contain" : "object-cover"
                                )}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Markdown Content Wrapper */}
            <div className={cn(
                // Base Typography Styles
                "prose prose-slate max-w-none dark:prose-invert",
                // Specific Overrides for Better Reading Experience
                "prose-headings:font-bold prose-headings:tracking-tight",
                "prose-p:leading-relaxed prose-p:text-gray-600 dark:prose-p:text-gray-300",
                "prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto prose-img:max-h-[400px] prose-img:object-contain",
                "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
                "prose-strong:text-gray-900 dark:prose-strong:text-white",
                "prose-li:marker:text-primary",
                className
            )}>
                <ReactMarkdown>
                    {content}
                </ReactMarkdown>
            </div>

        </div>
    );
}