import { useState } from 'react';
import { X, TrendingUp, TrendingDown, Minus, Activity, Filter } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import type { Match, Player } from '../../types';

interface FormStateDetailProps {
    player: Player;
    matches: Match[];
    onClose: () => void;
}

export function FormStateDetail({ player, matches, onClose }: FormStateDetailProps) {
    const navigate = useNavigate();
    const [period, setPeriod] = useState<5 | 10 | 20>(10);

    // Get player's matches sorted by date
    const playerMatches = matches
        .filter(m => m.players.team1.includes(player.id) || m.players.team2.includes(player.id))
        .sort((a, b) => b.date - a.date)
        .slice(0, period);

    // Calculate form stats
    const formStats = playerMatches.reduce((acc, m) => {
        const isT1 = m.players.team1.includes(player.id);
        const myScore = isT1 ? m.score.team1 : m.score.team2;
        const oppScore = isT1 ? m.score.team2 : m.score.team1;

        let result: 'win' | 'draw' | 'loss' = 'draw';
        if (m.endedBy === 'regular') {
            if (myScore > oppScore) result = 'win';
            else if (myScore < oppScore) result = 'loss';
        } else if (m.endedBy === 'penalties') {
            const amIWinner = (isT1 && m.penaltyWinner === 1) || (!isT1 && m.penaltyWinner === 2);
            result = amIWinner ? 'win' : 'loss';
        } else if (m.endedBy === 'forfeit') {
            const amILoser = (isT1 && m.forfeitLoser === 1) || (!isT1 && m.forfeitLoser === 2);
            result = amILoser ? 'loss' : 'win';
        }

        acc[result]++;
        return acc;
    }, { win: 0, draw: 0, loss: 0 });

    // Calculate current streak
    const currentStreak = (() => {
        if (playerMatches.length === 0) return { type: null, count: 0 };

        let streakType: 'win' | 'loss' | null = null;
        let count = 0;

        for (const m of playerMatches.reverse()) {
            const isT1 = m.players.team1.includes(player.id);
            const myScore = isT1 ? m.score.team1 : m.score.team2;
            const oppScore = isT1 ? m.score.team2 : m.score.team1;

            let result: 'win' | 'draw' | 'loss' = 'draw';
            if (m.endedBy === 'regular') {
                if (myScore > oppScore) result = 'win';
                else if (myScore < oppScore) result = 'loss';
            } else if (m.endedBy === 'penalties') {
                const amIWinner = (isT1 && m.penaltyWinner === 1) || (!isT1 && m.penaltyWinner === 2);
                result = amIWinner ? 'win' : 'loss';
            } else if (m.endedBy === 'forfeit') {
                const amILoser = (isT1 && m.forfeitLoser === 1) || (!isT1 && m.forfeitLoser === 2);
                result = amILoser ? 'loss' : 'win';
            }

            if (result === 'draw') break;

            if (streakType === null) {
                streakType = result;
                count = 1;
            } else if (streakType === result) {
                count++;
            } else {
                break;
            }
        }

        return { type: streakType, count };
    })();

    const total = formStats.win + formStats.draw + formStats.loss;
    const winRate = total > 0 ? (formStats.win / total) * 100 : 0;

    const handleFilterByResult = (result: 'win' | 'draw' | 'loss') => {
        // Navigate to match history with filter
        navigate('/history', { state: { filterByResult: result } });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <Card glass className="w-full max-w-lg p-6 space-y-6 border-primary/30 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black font-heading italic uppercase tracking-tighter text-primary">
                            Estado de Forma
                        </h3>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                            Análisis detallado
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Period Selector */}
                <div className="flex gap-2 p-1 bg-white/[0.02] rounded-xl border border-white/5">
                    {[5, 10, 20].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p as 5 | 10 | 20)}
                            className={cn(
                                "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                period === p ? "bg-primary text-black shadow-lg" : "text-gray-600 hover:text-gray-400"
                            )}
                        >
                            Últimos {p}
                        </button>
                    ))}
                </div>

                {/* Current Streak */}
                {currentStreak.type && currentStreak.count > 1 && (
                    <Card className={cn(
                        "p-4 border-2",
                        currentStreak.type === 'win' ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
                    )}>
                        <div className="flex items-center gap-3">
                            {currentStreak.type === 'win' ? (
                                <TrendingUp className="w-8 h-8 text-green-500" />
                            ) : (
                                <TrendingDown className="w-8 h-8 text-red-500" />
                            )}
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                                    Racha Actual
                                </p>
                                <p className="text-xl font-black">
                                    {currentStreak.count} {currentStreak.type === 'win' ? 'Victorias' : 'Derrotas'} Consecutivas
                                </p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Stats Breakdown */}
                <div className="space-y-3">
                    <h4 className="text-[10px] uppercase font-black tracking-widest text-gray-500">
                        Desglose de Resultados
                    </h4>

                    {/* Victories */}
                    <button
                        onClick={() => handleFilterByResult('win')}
                        className="w-full group"
                    >
                        <Card className="p-4 border-green-500/20 bg-gradient-to-r from-green-500/10 to-transparent hover:border-green-500/40 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                                        <TrendingUp className="w-6 h-6 text-green-500" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                                            Victorias
                                        </p>
                                        <p className="text-2xl font-black text-green-500">
                                            {formStats.win}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-green-500/50">
                                        {total > 0 ? Math.round((formStats.win / total) * 100) : 0}%
                                    </p>
                                    <Filter className="w-4 h-4 text-gray-600 group-hover:text-primary transition-colors ml-auto" />
                                </div>
                            </div>
                        </Card>
                    </button>

                    {/* Draws */}
                    <button
                        onClick={() => handleFilterByResult('draw')}
                        className="w-full group"
                    >
                        <Card className="p-4 border-gray-500/20 bg-gradient-to-r from-gray-500/10 to-transparent hover:border-gray-500/40 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-500/20 flex items-center justify-center border border-gray-500/30">
                                        <Minus className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                                            Empates
                                        </p>
                                        <p className="text-2xl font-black text-gray-300">
                                            {formStats.draw}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-gray-500/50">
                                        {total > 0 ? Math.round((formStats.draw / total) * 100) : 0}%
                                    </p>
                                    <Filter className="w-4 h-4 text-gray-600 group-hover:text-primary transition-colors ml-auto" />
                                </div>
                            </div>
                        </Card>
                    </button>

                    {/* Losses */}
                    <button
                        onClick={() => handleFilterByResult('loss')}
                        className="w-full group"
                    >
                        <Card className="p-4 border-red-500/20 bg-gradient-to-r from-red-500/10 to-transparent hover:border-red-500/40 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                                        <TrendingDown className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                                            Derrotas
                                        </p>
                                        <p className="text-2xl font-black text-red-500">
                                            {formStats.loss}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-red-500/50">
                                        {total > 0 ? Math.round((formStats.loss / total) * 100) : 0}%
                                    </p>
                                    <Filter className="w-4 h-4 text-gray-600 group-hover:text-primary transition-colors ml-auto" />
                                </div>
                            </div>
                        </Card>
                    </button>
                </div>

                {/* Win Rate Summary */}
                <Card className="p-4 bg-primary/5 border-primary/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Activity className="w-6 h-6 text-primary" />
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                                    Efectividad
                                </p>
                                <p className="text-sm text-gray-500">
                                    Últimos {period} partidos
                                </p>
                            </div>
                        </div>
                        <p className="text-4xl font-black text-primary">
                            {Math.round(winRate)}%
                        </p>
                    </div>
                </Card>

                <Button
                    variant="ghost"
                    className="w-full"
                    onClick={onClose}
                >
                    Cerrar
                </Button>
            </Card>
        </div>
    );
}
