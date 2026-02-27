'use client';

import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    return (
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
    );
}