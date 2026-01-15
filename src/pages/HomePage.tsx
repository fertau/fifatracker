import { Link } from 'react-router-dom';
import { Trophy, Users, TrendingUp, Star, ArrowUpRight, Activity } from 'lucide-react';
import { usePlayers } from '../hooks/usePlayers';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';
import type { Player } from '../types';

interface DashboardProps {
    player: Player;
}

export function HomePage({ player }: DashboardProps) {
    const { players, getFriendsOf } = usePlayers();
    const { matches } = useData();

    const myFriends = getFriendsOf(player.id);

    // Sort players by win rate for ranking
    const rankedPlayers = [...players].sort((a, b) => {
        const rateA = a.stats.matchesPlayed > 0 ? a.stats.wins / a.stats.matchesPlayed : 0;
        const rateB = b.stats.matchesPlayed > 0 ? b.stats.wins / b.stats.matchesPlayed : 0;
        return rateB - rateA;
    });

    const myRank = rankedPlayers.findIndex(p => p.id === player.id) + 1;

    // Derive Social News (Mock/Simple logic based on data)
    const socialNews: any[] = [];

    // 1. New matches
    const recentMatches = [...matches].sort((a, b) => b.date - a.date).slice(0, 3);
    recentMatches.forEach(m => {
        socialNews.push({
            id: `match-${m.id}`,
            type: 'match',
            content: `Partido registrado: ${m.score.team1} - ${m.score.team2}`,
            time: new Date(m.date).toLocaleDateString(),
            icon: <Activity className="w-4 h-4 text-primary" />
        });
    });

    // 2. Ranking changes (Simulated for now based on performance)
    if (myRank <= 3) {
        socialNews.push({
            id: 'rank-top',
            type: 'rank',
            content: `¡Estás en el TOP 3 del ranking! Mantén el nivel.`,
            time: 'Hoy',
            icon: <Star className="w-4 h-4 text-yellow-500" />
        });
    }

    // 3. Streaks or high scores
    const topScorer = [...players].sort((a, b) => b.stats.goalsScored - a.stats.goalsScored)[0];
    if (topScorer) {
        socialNews.push({
            id: 'top-scorer',
            type: 'milestone',
            content: `${topScorer.name} es el máximo goleador con ${topScorer.stats.goalsScored} goles.`,
            time: 'Novedad',
            icon: <Trophy className="w-4 h-4 text-accent" />
        });
    }

    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500">
            {/* Main Header / Dashboard Info */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold font-heading tracking-tighter uppercase">Dashboard</h2>
                    <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Tu progreso social</p>
                </div>
                <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span className="font-bold text-primary font-mono italic">#{myRank}</span>
                </div>
            </div>

            {/* Social News Feed */}
            <section className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" /> Novedades Sociales
                </h3>
                <div className="space-y-3">
                    {socialNews.length > 0 ? socialNews.map(news => (
                        <Card key={news.id} glass={false} className="p-3 border-white/5 bg-white/[0.02]">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-white/5 border border-white/10 mt-1">
                                    {news.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-200">{news.content}</p>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">{news.time}</span>
                                </div>
                                {news.type === 'rank' && <ArrowUpRight className="w-4 h-4 text-green-500" />}
                            </div>
                        </Card>
                    )) : (
                        <p className="text-center py-4 text-gray-500 text-xs italic">No hay novedades recientes por ahora.</p>
                    )}
                </div>
            </section>

            {/* Featured Ranking */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Star className="w-3 h-3 text-yellow-500" /> Top Jugadores
                    </h3>
                    <Link to="/stats" className="text-[10px] text-primary hover:underline uppercase font-bold tracking-widest">
                        Ver Rankings Completos
                    </Link>
                </div>
                <div className="space-y-2">
                    {rankedPlayers.slice(0, 3).map((p, idx) => (
                        <Card key={p.id} className={cn("p-4 flex items-center justify-between border-white/5", idx === 0 && "border-yellow-500/20 bg-yellow-500/5")}>
                            <div className="flex items-center gap-4">
                                <span className={cn("font-bold text-xl italic font-mono w-6", idx === 0 ? "text-yellow-500" : "text-gray-400")}>
                                    {idx + 1}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{p.avatar}</span>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">{p.name} {p.id === player.id && "(Tú)"}</span>
                                        <span className="text-[10px] text-gray-500 uppercase font-bold">
                                            {p.stats.matchesPlayed > 0 ? Math.round((p.stats.wins / p.stats.matchesPlayed) * 100) : 0}% efectividad
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block font-bold text-sm text-primary">{p.stats.wins}W</span>
                                <span className="text-[10px] text-gray-500">{p.stats.matchesPlayed} partidas</span>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* My Stats Preview */}
            <div className="grid grid-cols-2 gap-3">
                <Card glass className="p-4 border-primary/20 bg-primary/5">
                    <TrendingUp className="w-4 h-4 text-primary mb-2" />
                    <span className="block text-2xl font-bold">{player.stats.goalsScored}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Goles Anotados</span>
                </Card>
                <Card glass className="p-4 border-accent/20 bg-accent/5">
                    <Activity className="w-4 h-4 text-accent mb-2" />
                    <span className="block text-2xl font-bold">{player.stats.matchesPlayed}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Partidos Jugados</span>
                </Card>
            </div>

            {/* Quick Access to Social */}
            <Link to="/friends">
                <Card className="p-4 flex items-center justify-between border-white/10 hover:border-primary transition-all">
                    <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-primary" />
                        <div>
                            <p className="font-bold text-sm">Mis Amigos</p>
                            <p className="text-[10px] text-gray-500 uppercase">Tienes {myFriends.length} amigos</p>
                        </div>
                    </div>
                </Card>
            </Link>
        </div>
    );
}
