import { cn } from '../../lib/utils';

interface SkeletonProps {
    className?: string;
    variant?: 'default' | 'text' | 'card' | 'avatar' | 'button';
    count?: number;
}

export function Skeleton({ className, variant = 'default', count = 1 }: SkeletonProps) {
    const skeletons = Array.from({ length: count }, (_, i) => (
        <div
            key={i}
            className={cn(
                'animate-pulse rounded-lg bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%]',
                'animate-shimmer',
                variant === 'text' && 'h-4 w-full',
                variant === 'card' && 'h-32 w-full',
                variant === 'avatar' && 'h-12 w-12 rounded-full',
                variant === 'button' && 'h-10 w-24 rounded-xl',
                className
            )}
            style={{
                animation: 'shimmer 2s infinite linear'
            }}
        />
    ));

    return count === 1 ? skeletons[0] : <div className="space-y-3">{skeletons}</div>;
}

// Add shimmer animation to index.css
