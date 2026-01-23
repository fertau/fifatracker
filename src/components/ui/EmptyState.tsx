import { cn } from '../../lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary' | 'ghost';
    };
    className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
            {/* Icon */}
            <div className="mb-4 text-6xl opacity-30 grayscale">
                {icon}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold mb-2 text-white/80">
                {title}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-400 max-w-sm mb-6 leading-relaxed">
                {description}
            </p>

            {/* Action Button */}
            {action && (
                <Button
                    variant={action.variant || 'primary'}
                    onClick={action.onClick}
                    className="shadow-lg"
                >
                    {action.label}
                </Button>
            )}
        </div>
    );
}
