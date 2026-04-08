import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Pin, PinOff, Trophy, Flame, Zap, Swords, TrendingUp, ArrowLeft } from 'lucide-react';
import { useRivalry, getRivalryKey } from '../../hooks/useRivalry';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { HeatGauge } from '../../components/rivalry/HeatGauge';
import { cn } from '../../lib/utils';
import type { Player, Match } from '../../types';

interface RivalryPageProps {
    currentUser: Player;
}

export function RivalryPage({ currentUser }: RivalryPageProps) {
    const { playerAId, playerBId } = useParams<{ playerAId: string; playerBId: string }>();
    const navigate = useNavigate();
    const { updatePlayer } = useData();

    // Canonicalize: ensure IDs are sorted
    if (playerAId && playerBId) {
        const [sortedA, sortedB] = [playerAId, playerBId].sort();
        if (sortedA !== playerAId || sortedB !== playerBId) {
            return <Navigate to={`/rivalry/${sortedA}/${sortedB}`} replace />;
        }
    }

    if (!playerAId || !playerBId) {
        return <Navigate to="/" replace />;
    }

    const stats = useRivalry(playerAId, playerBId);
    const { playerA, playerB, allTimeRecord, currentStreak, biggestWin, mostDramatic, recentForm, heatScore, commentary, totalMatches } = stats;

    // Determine perspective for current user
    const isPlayerA = currentUser.id === playerAId;
    const myWins = isPlayerA ? allTimeRecord.a : allTimeRecord.b;
    const theirWins = isPlayerA ? allTimeRecord.b : allTimeRecord.a;

    const pinnedKeys = currentUser.pinnedRivalries || [];
    const rivalryKey = getRivalryKey(playerAId, playerBId);
    const isPinned = pinnedKeys.includes(rivalryKey);

    const togglePin = async () => {
        const updated = isPinned
            ? pinnedKeys.filter(k => k !== rivalryKey)
            : [...pinnedKeys, rivalryKey];
        await updatePlayer(currentUser.id, { pinnedRivalries: updated });
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('es-AR', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const getMatchResultLabel = (match: Match) => {
        const isTeam1 = match.players.team1.includes(currentUser.id);
        const myScore = isTeam1 ? match.score.team1 : match.score.team2;
        const theirScore = isTeam1 ? match.score.team2 : match.score.team1;

        let resultClass = 'text-gray-400';
        if (match.endedBy === 'regular') {
            if (myScore > theirScore) resultClass = 'text-green-400';
            else if (myScore < theirScore) resultClass = 'text-red-400';
        } else if (match.endedBy === 'penalties') {
            const iWin = (isTeam1 && match.penaltyWinner === 1) || (!isTeam1 && match.penaltyWinner === 2);
            resultClass = iWin ? 'text-green-400' : 'text-red-400';
        } else if (match.endedBy === 'forfeit') {
            const iLose = (isTeam1 && match.forfeitLoser === 1) || (!isTeam1 && match.forfeitLoser === 2);
            resultClass = iLose ? 'text-red-400' : 'text-green-400';
        }

        return {
            score: `${match.score.team1} - ${match.score.team2}`,
            suffix: match.endedBy === 'penalties' ? ' (pen)' : match.endedBy === 'forfeit' ? ' (W.O.)' : '',
            className: resultClass,
        };
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Volver
            </button>

            {/* Header */}
            <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-6">
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-3xl">
                            {playerA?.avatar || '👤'}
                        </div>
                        <span className="text-sm font-medium">{playerA?.name}</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <Swords className="w-6 h-6 text-primary mb-1" />
                        <span className="text-xs text-gray-300 uppercase tracking-widest">vs</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-3xl">
                            {playerB?.avatar || '👤'}
                        </div>
                        <span className="text-sm font-medium">{playerB?.name}</span>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePin}
                    className="text-xs"
                >
                    {isPinned ? (
                        <><PinOff className="w-4 h-4 mr-1" /> Desanclar</>
                    ) : (
                        <><Pin className="w-4 h-4 mr-1" /> Anclar al inicio</>
                    )}
                </Button>
            </div>

            {/* All-Time Record */}
            <Card glass className="p-6">
                <div className="text-center space-y-3">
                    <h3 className="text-xs uppercase tracking-widest text-gray-400">Historial</h3>
                    <div className="flex items-center justify-center gap-4">
                        <div className="text-center">
                            <div className={cn('text-4xl font-bold', myWins > theirWins ? 'text-green-400' : 'text-white')}>
                                {myWins}
                            </div>
                            <div className="text-xs text-gray-400 uppercase">{isPlayerA ? playerA?.name : playerB?.name}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-light text-gray-400">{allTimeRecord.draws}</div>
                            <div className="text-xs text-gray-400 uppercase">Empates</div>
                        </div>
                        <div className="text-center">
                            <div className={cn('text-4xl font-bold', theirWins > myWins ? 'text-red-400' : 'text-white')}>
                                {theirWins}
                            </div>
                            <div className="text-xs text-gray-400 uppercase">{isPlayerA ? playerB?.name : playerA?.name}</div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-400 italic">{commentary}</p>
                    <div className="flex justify-center">
                        <HeatGauge score={heatScore} size="md" />
                    </div>
                    <p className="text-xs text-gray-400">{totalMatches} partidos jugados</p>
                </div>
            </Card>

            {/* Streak */}
            {currentStreak.count > 0 && (
                <Card glass className="p-4">
                    <div className="flex items-center gap-3">
                        <Flame className="w-5 h-5 text-orange-400" />
                        <div>
                            <p className="text-sm font-medium">
                                Racha actual: {currentStreak.holder === playerAId ? playerA?.name : playerB?.name}
                            </p>
                            <p className="text-xs text-gray-400">{currentStreak.count} victorias seguidas</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Biggest Win */}
            {biggestWin && (
                <Card glass className="p-4">
                    <div className="flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <div>
                            <p className="text-sm font-medium">Mayor goleada</p>
                            <p className="text-xs text-gray-400">
                                {biggestWin.winner === playerAId ? playerA?.name : playerB?.name} ganó{' '}
                                {biggestWin.match.score.team1} - {biggestWin.match.score.team2}
                                {' '}({formatDate(biggestWin.match.date)})
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Most Dramatic */}
            {mostDramatic && (
                <Card glass className="p-4">
                    <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-purple-400" />
                        <div>
                            <p className="text-sm font-medium">Partido más dramático</p>
                            <p className="text-xs text-gray-400">
                                {mostDramatic.score.team1} - {mostDramatic.score.team2}
                                {mostDramatic.endedBy === 'penalties' ? ' (penales)' : ''}
                                {' '}({formatDate(mostDramatic.date)})
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Recent Form */}
            {recentForm.length > 0 && (
                <Card glass className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <h3 className="text-sm font-medium">Últimos partidos</h3>
                    </div>
                    <div className="space-y-2">
                        {[...recentForm].reverse().map(match => {
                            const { score, suffix, className } = getMatchResultLabel(match);
                            return (
                                <div key={match.id} className="flex items-center justify-between text-sm">
                                    <span className="text-xs text-gray-500">{formatDate(match.date)}</span>
                                    <span className={cn('font-mono font-medium', className)}>
                                        {score}{suffix}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {totalMatches === 0 && (
                <Card glass className="p-6 text-center">
                    <Swords className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">Sin partidos entre {playerA?.name} y {playerB?.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Jugá un partido para empezar la rivalidad</p>
                </Card>
            )}
        </div>
    );
}
