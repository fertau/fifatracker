import { cn } from '../../lib/utils';

interface HeatGaugeProps {
    score: number; // 0-100
    size?: 'sm' | 'md';
}

export function HeatGauge({ score, size = 'md' }: HeatGaugeProps) {
    const clampedScore = Math.min(Math.max(score, 0), 100);

    const getColor = () => {
        if (clampedScore >= 80) return 'from-red-500 to-orange-500';
        if (clampedScore >= 60) return 'from-orange-500 to-yellow-500';
        if (clampedScore >= 40) return 'from-yellow-500 to-green-500';
        return 'from-green-500 to-blue-500';
    };

    const getLabel = () => {
        if (clampedScore >= 80) return '🔥 Intensa';
        if (clampedScore >= 60) return '⚡ Caliente';
        if (clampedScore >= 40) return '💪 Activa';
        return '❄️ Fría';
    };

    return (
        <div className={cn('flex items-center gap-2', size === 'sm' ? 'gap-1.5' : 'gap-2')}>
            <div className={cn(
                'rounded-full overflow-hidden bg-white/10',
                size === 'sm' ? 'w-16 h-1.5' : 'w-24 h-2'
            )}>
                <div
                    className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', getColor())}
                    style={{ width: `${clampedScore}%` }}
                />
            </div>
            <span className={cn(
                'text-gray-400 whitespace-nowrap',
                size === 'sm' ? 'text-xs' : 'text-sm'
            )}>
                {getLabel()}
            </span>
        </div>
    );
}
