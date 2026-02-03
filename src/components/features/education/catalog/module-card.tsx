'use client';

import Link from 'next/link';
import { Clock, BookOpen, CheckCircle2, PlayCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress'; // Asumsi komponen UI ada
import { EducationModule, EducationProgressStatus } from '@/lib/types/education';
import { cn } from '@/lib/utils';

interface ModuleCardProps {
    module: EducationModule;
}

export function ModuleCard({ module }: ModuleCardProps) {
    // Logic Penentuan Status & Warna
    const isCompleted = module.userStatus === EducationProgressStatus.COMPLETED;
    const isStarted = module.userStatus === EducationProgressStatus.STARTED;

    // Placeholder progress (Idealnya dari BE, jika belum ada kita simulasi 0 atau 50% jika started)
    // Untuk fase ini kita gunakan logic sederhana based on status
    const progressValue = isCompleted ? 100 : (isStarted ? 30 : 0);

    return (
        <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 group border-l-4 border-l-transparent hover:border-l-primary">
            {/* --- THUMBNAIL SECTION --- */}
            <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                {module.thumbnailUrl ? (
                    <img
                        src={module.thumbnailUrl}
                        alt={module.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                        <BookOpen className="w-12 h-12 opacity-20" />
                    </div>
                )}

                {/* Category Badge Overlay */}
                <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-xs font-semibold shadow-sm">
                        {module.category?.name || 'Umum'}
                    </Badge>
                </div>

                {/* Status Badge Overlay */}
                {isCompleted && (
                    <div className="absolute top-3 right-3">
                        <Badge className="bg-green-500 hover:bg-green-600 text-white gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Selesai
                        </Badge>
                    </div>
                )}
            </div>

            {/* --- CONTENT SECTION --- */}
            <CardHeader className="p-4 pb-2 space-y-2 flex-1">
                <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {module.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                    {module.excerpt}
                </p>
            </CardHeader>

            <CardContent className="p-4 pt-0">
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{module.readingTime} Menit</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{module.sections?.length || 0} Bab</span>
                    </div>
                </div>

                {/* Progress Bar (Visible if Started or Completed) */}
                {(isStarted || isCompleted) && (
                    <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-[10px] font-medium text-gray-500">
                            <span>Progress Belajar</span>
                            <span>{progressValue}%</span>
                        </div>
                        <Progress value={progressValue} className="h-1.5" />
                    </div>
                )}
            </CardContent>

            {/* --- ACTION FOOTER --- */}
            <CardFooter className="p-4 pt-0 mt-auto">
                <Link href={`/learning/${module.slug}/read`} className="w-full">
                    <Button
                        className={cn(
                            "w-full gap-2",
                            isCompleted ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : ""
                        )}
                        variant={isCompleted ? "outline" : "default"}
                    >
                        {isCompleted ? (
                            <>Review Materi <ArrowRight className="w-4 h-4" /></>
                        ) : isStarted ? (
                            <>Lanjutkan <PlayCircle className="w-4 h-4" /></>
                        ) : (
                            <>Mulai Belajar <PlayCircle className="w-4 h-4" /></>
                        )}
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}