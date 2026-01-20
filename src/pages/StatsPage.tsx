import { Link } from 'react-router-dom';
import { Trophy, Target, Users as UsersIcon, TrendingUp, Award } from 'lucide-react';
import { useAdvancedStats } from '../hooks/useAdvancedStats';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import type { Player } from '../types';

interface StatsPageProps {
    player: Player;
}

export function StatsPage({ player }: StatsPageProps) {
    const stats = useAdvancedStats(player.id);
    const { rankedPlayers } = useLeaderboard();

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    Estadísticas Avanzadas
                </h1>
                <p className="text-gray-400">{player.name}</p>
            </div>

            {/* Community Ranking Table */}
            <Card className="overflow-hidden border-white/5 bg-white/[0.02]">
                <div className="p-4 border-b border-white/5 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-bold uppercase tracking-widest text-sm">Ranking Comunidad</h3>
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
                        {stats.nemesis.player.photoURL ? (
                            <img src={stats.nemesis.player.photoURL} alt={stats.nemesis.player.name} className="w-12 h-12 rounded-full border-2 border-red-500/50" />
                        ) : (
                            <div className="text-4xl">{stats.nemesis.player.avatar}</div>
                        )}
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
                        {stats.bestDuo.partner.photoURL ? (
                            <img src={stats.bestDuo.partner.photoURL} alt={stats.bestDuo.partner.name} className="w-12 h-12 rounded-full border-2 border-green-500/50" />
                        ) : (
                            <div className="text-4xl">{stats.bestDuo.partner.avatar}</div>
                        )}
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

            {/* Back Button */}
            <Link to="/">
                <Button variant="ghost" className="w-full">
                    Volver al Inicio
                </Button>
            </Link>
        </div>
    );
}
