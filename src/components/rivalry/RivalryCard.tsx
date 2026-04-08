import { Link } from 'react-router-dom';
import { Pin, ChevronRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { HeatGauge } from './HeatGauge';
import type { DetectedRivalry } from '../../hooks/useRivalries';
import { cn } from '../../lib/utils';

interface RivalryCardProps {
    rivalry: DetectedRivalry;
    currentPlayerId: string;
    onTogglePin?: () => void;
}

export function RivalryCard({ rivalry, currentPlayerId }: RivalryCardProps) {
    const { stats, playerAId, playerBId, isPinned } = rivalry;
    const { playerA, playerB } = stats;

    // Determine which player is "me" and which is the opponent
    const isPlayerA = currentPlayerId === playerAId;
    const me = isPlayerA ? playerA : playerB;
    const opponent = isPlayerA ? playerB : playerA;
    const myWins = isPlayerA ? stats.allTimeRecord.a : stats.allTimeRecord.b;
    const theirWins = isPlayerA ? stats.allTimeRecord.b : stats.allTimeRecord.a;

    return (
        <Link to={`/rivalry/${playerAId}/${playerBId}`} aria-label={`Rivalidad ${me?.name} vs ${opponent?.name}`}>
            <Card glass className="p-4 relative group">
                {/* Pin indicator */}
                {isPinned && (
                    <Pin className="absolute top-2 right-2 w-3 h-3 text-primary fill-primary" />
                )}

                {/* Avatars + Record */}
                <div className="flex items-center gap-3">
                    {/* My avatar */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">
                            {me?.avatar || '👤'}
                        </div>
                        <span className="text-xs text-gray-400 truncate max-w-[60px]">{me?.name}</span>
                    </div>

                    {/* Record */}
                    <div className="flex-1 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <span className={cn('text-xl font-bold', myWins > theirWins ? 'text-green-400' : 'text-white')}>
                                {myWins}
                            </span>
                            <span className="text-gray-500 text-sm">-</span>
                            <span className="text-gray-400 text-xs">{stats.allTimeRecord.draws}</span>
                            <span className="text-gray-500 text-sm">-</span>
                            <span className={cn('text-xl font-bold', theirWins > myWins ? 'text-red-400' : 'text-white')}>
                                {theirWins}
                            </span>
                        </div>
                        <HeatGauge score={stats.heatScore} size="sm" />
                    </div>

                    {/* Opponent avatar */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">
                            {opponent?.avatar || '👤'}
                        </div>
                        <span className="text-xs text-gray-400 truncate max-w-[60px]">{opponent?.name}</span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
                </div>

                {/* Commentary */}
                <p className="text-xs text-gray-400 mt-2 text-center italic">
                    {stats.commentary}
                </p>
            </Card>
        </Link>
    );
}
