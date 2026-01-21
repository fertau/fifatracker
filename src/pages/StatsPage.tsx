import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Target, Users as UsersIcon, TrendingUp, Award, Info, X } from 'lucide-react';
import { useAdvancedStats } from '../hooks/useAdvancedStats';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import type { Player } from '../types';

interface StatsPageProps {
    player: Player;
}

export function StatsPage({ player }: StatsPageProps) {
    const stats = useAdvancedStats(player.id);
    const [rankingMode, setRankingMode] = useState<'1v1' | '2v2' | 'global'>('1v1');
    const { rankedPlayers } = useLeaderboard(rankingMode);
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="text-center space-y-2 relative">
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 p-2 text-primary hover:bg-primary/10 rounded-full"
                    onClick={() => setShowInfo(true)}
                >
                    <Info className="w-5 h-5" />
                </Button>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    Estadísticas Avanzadas
                </h1>
                <p className="text-gray-400">{player.name}</p>
            </div>

            {/* Info Modal */}
            {showInfo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
                    <Card glass className="w-full max-w-sm p-6 space-y-4 border-primary/30 rounded-2xl shadow-2xl relative">
                        <button
                            onClick={() => setShowInfo(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest">
                            <Info className="w-5 h-5" />
                            <h3>¿Cómo se calcula?</h3>
                        </div>
                        <div className="space-y-3 text-sm text-gray-300">
                            <p>El <strong>Ranking de Comunidad</strong> utiliza un algoritmo compuesto para determinar el rendimiento real:</p>
                            <ul className="space-y-1 list-disc pl-4 text-xs">
                                <li><strong>300 pts</strong> por Victoria</li>
                                <li><strong>100 pts</strong> por Empate</li>
                                <li><strong>10 pts</strong> por Diferencia de Gol Positiva</li>
                                <li><strong>5 pts</strong> por Partido Jugado (Premio a la constancia)</li>
                            </ul>
                            <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-xs italic text-gray-400">
                                <p>"El sistema recompensa jugar más partidos. Un jugador con 10 victorias en 100 partidos tendrá más puntos que uno con 1 victoria en 1 partido."</p>
                            </div>
                        </div>
                        <Button className="w-full" onClick={() => setShowInfo(false)}>Entendido</Button>
                    </Card>
                </div>
            )}

            {/* Community Ranking Table */}
            <Card className="overflow-hidden border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-bold uppercase tracking-widest text-sm">Ranking Comunidad</h3>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 scale-90 origin-right">
                    {(['1v1', '2v2', 'global'] as const).map(m => (
                        <button
                            key={m}
                            onClick={() => setRankingMode(m)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                rankingMode === m ? "bg-primary text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                            )}
                        >
                            {m}
                        </button>
                    ))}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-white/5 text-gray-400 uppercase tracking-wider font-bold">
                                <th className="p-3 text-center">#</th>
                                <th className="p-3">Jugador</th>
                                <th className="p-3 text-center">PJ</th>
                                <th className="p-3 text-center">W</th>
                                <th className="p-3 text-center">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {rankedPlayers.map((p, idx) => (
                                <tr key={p.id} className={p.id === player.id ? 'bg-primary/10' : 'hover:bg-white/5'}>
                                    <td className="p-3 text-center font-mono font-bold text-gray-500">
                                        {idx + 1}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{p.avatar}</span>
                                            <span className="font-bold">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-center text-gray-400 font-mono">
                                        {p.derivedStats.matchesPlayed}
                                    </td>
                                    <td className="p-3 text-center text-green-500 font-mono font-bold">
                                        {p.derivedStats.wins}
                                    </td>
                                    <td className="p-3 text-center font-black font-mono text-primary">
                                        {p.score}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Current Streak */}
            {stats.currentStreak.type && (
                <Card className="relative overflow-hidden">
                    <div className={`absolute top-0 left-0 right-0 h-1 ${stats.currentStreak.type === 'win' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stats.currentStreak.type === 'win' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            <TrendingUp className={`w-6 h-6 ${stats.currentStreak.type === 'win' ? 'text-green-500' : 'text-red-500'}`} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg">Racha Actual</h3>
                            <p className="text-sm text-gray-400">
                                {stats.currentStreak.count} {stats.currentStreak.type === 'win' ? 'victorias' : 'derrotas'} consecutivas
                            </p>
                        </div>
                        <div className="text-3xl font-bold">
                            {stats.currentStreak.count}
                        </div>
                    </div>
                </Card>
            )}

            {/* Nemesis */}
            {stats.nemesis.player && (
                <Card className="relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-red-500/20">
                            <Target className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg">Tu Némesis</h3>
                            <p className="text-sm text-gray-400">
                                {stats.nemesis.losses} derrotas contra {stats.nemesis.player.name}
                            </p>
                        </div>
                        <div className="text-4xl">{stats.nemesis.player.avatar}</div>
                    </div>
                </Card>
            )}

            {/* Best Duo */}
            {stats.bestDuo.partner && (
                <Card className="relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-500/20">
                            <UsersIcon className="w-6 h-6 text-green-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg">Mejor Dupla</h3>
                            <p className="text-sm text-gray-400">
                                {stats.bestDuo.wins} victorias con {stats.bestDuo.partner.name}
                            </p>
                        </div>
                        <div className="text-4xl">{stats.bestDuo.partner.avatar}</div>
                    </div>
                </Card>
            )}

            {/* Solo vs Team Stats */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" />
                        <h3 className="font-bold">Solo (1v1)</h3>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Victorias</span>
                            <span className="font-bold text-green-500">{stats.soloStats.wins}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Derrotas</span>
                            <span className="font-bold text-red-500">{stats.soloStats.losses}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Empates</span>
                            <span className="font-bold text-gray-500">{stats.soloStats.draws}</span>
                        </div>
                    </div>
                </Card>

                <Card className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-accent" />
                        <h3 className="font-bold">Equipo</h3>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Victorias</span>
                            <span className="font-bold text-green-500">{stats.teamStats.wins}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Derrotas</span>
                            <span className="font-bold text-red-500">{stats.teamStats.losses}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Empates</span>
                            <span className="font-bold text-gray-500">{stats.teamStats.draws}</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Performance Charts */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-primary" /> Evolución de Rendimiento
                    </h3>
                </div>

                <Card glass className="p-6 border-white/5 bg-white/[0.02] space-y-6">
                    {/* Score Chart */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Puntaje Total</p>
                                <h4 className="text-xl font-bold font-heading italic uppercase text-primary">Tendencia de Score</h4>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Últimos {stats.scoreHistory.length} partidos</span>
                            </div>
                        </div>

                        <div className="h-40 w-full relative">
                            {stats.scoreHistory.length > 1 ? (
                                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    {(() => {
                                        const min = Math.min(...stats.scoreHistory);
                                        const max = Math.max(...stats.scoreHistory);
                                        const range = Math.max(1, max - min);
                                        const points = stats.scoreHistory.map((v, i) => {
                                            const x = (i / (stats.scoreHistory.length - 1)) * 100;
                                            const y = 100 - ((v - min) / range) * 100;
                                            return `${x},${y}`;
                                        }).join(' ');

                                        const pathData = `M ${points}`;
                                        const areaData = `${pathData} L 100,100 L 0,100 Z`;

                                        return (
                                            <>
                                                <path d={areaData} fill="url(#scoreGradient)" />
                                                <path d={pathData} fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                                {stats.scoreHistory.map((v, i) => (
                                                    <circle
                                                        key={i}
                                                        cx={`${(i / (stats.scoreHistory.length - 1)) * 100}%`}
                                                        cy={`${100 - ((v - min) / range) * 100}%`}
                                                        r="3"
                                                        fill="var(--color-primary)"
                                                        className="hover:r-5 transition-all cursor-crosshair"
                                                    />
                                                ))}
                                            </>
                                        );
                                    })()}
                                </svg>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-700 uppercase font-black text-[10px] border border-dashed border-white/5 rounded-xl">
                                    Juega más partidos para ver tendencia
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Goals Trend */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Promedio de Goleo</p>
                                <div className="flex items-center gap-2">
                                    <h4 className="text-3xl font-black font-mono tracking-tighter">
                                        {(stats.totalGoalsScored / (stats.matchesPlayed || 1)).toFixed(2)}
                                    </h4>
                                    {stats.goalsPerMatchHistory.length > 1 && (
                                        <div className={cn(
                                            "flex items-center text-[10px] font-black px-2 py-0.5 rounded-full",
                                            stats.goalsPerMatchHistory[stats.goalsPerMatchHistory.length - 1] >= stats.goalsPerMatchHistory[0]
                                                ? "bg-green-500/20 text-green-500"
                                                : "bg-red-500/20 text-red-500"
                                        )}>
                                            {stats.goalsPerMatchHistory[stats.goalsPerMatchHistory.length - 1] >= stats.goalsPerMatchHistory[0] ? '+' : ''}
                                            {((stats.goalsPerMatchHistory[stats.goalsPerMatchHistory.length - 1] - stats.goalsPerMatchHistory[0]) / (stats.goalsPerMatchHistory[0] || 1) * 100).toFixed(0)}%
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-3 bg-accent/20 rounded-2xl border border-accent/20">
                                <Award className="w-6 h-6 text-accent" />
                            </div>
                        </div>
                    </div>
                </Card>
            </section>

            {/* Back Button */}
            <Link to="/">
                <Button variant="ghost" className="w-full">
                    Volver al Inicio
                </Button>
            </Link>
        </div>
    );
}
