import { Badge } from '@/components/ui/badge';
import { EducationModuleStatus } from '@/lib/types/education';

interface StatusBadgeProps {
    status: EducationModuleStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const variants = {
        [EducationModuleStatus.DRAFT]: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200',
        [EducationModuleStatus.PUBLISHED]: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
        [EducationModuleStatus.ARCHIVED]: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200',
    };

    const labels = {
        [EducationModuleStatus.DRAFT]: 'Draft',
        [EducationModuleStatus.PUBLISHED]: 'Terbit',
        [EducationModuleStatus.ARCHIVED]: 'Arsip',
    };

    return (
        <Badge variant="outline" className={`${variants[status]} font-medium`}>
            {labels[status]}
        </Badge>
    );
}