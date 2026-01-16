import { Link } from 'react-router-dom';
import { Trophy, Users, TrendingUp, Star, ArrowUpRight, Activity, Clock, MoreHorizontal, CheckCircle2, XCircle, MinusCircle, Target, Shield } from 'lucide-react';
import { usePlayers } from '../hooks/usePlayers';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';
import type { Player, PlayerStats, Match } from '../types';

interface DashboardProps {
    player: Player;
}

export function HomePage({ player }: DashboardProps) {
    const { players, getFriendsOf } = usePlayers();
    const { matches } = useData();

    const myFriends = getFriendsOf(player.id);

    // DYNAMIC STATS CALCULATION
    const playersWithDerivedStats = players.map(p => {
        const myMatches = matches.filter(m =>
            m.players.team1.includes(p.id) || m.players.team2.includes(p.id)
        );

        let wins = 0;
        let draws = 0;
        let losses = 0;
        let goalsScored = 0;
        let goalsConceded = 0;

        myMatches.forEach(m => {
            const isTeam1 = m.players.team1.includes(p.id);
            const isTeam2 = m.players.team2.includes(p.id);
            const myScore = isTeam1 ? m.score.team1 : m.score.team2;
            const oppScore = isTeam1 ? m.score.team2 : m.score.team1;

            goalsScored += myScore;
            goalsConceded += oppScore;

            if (m.endedBy === 'regular') {
                if (myScore > oppScore) wins++;
                else if (myScore < oppScore) losses++;
                else draws++;
            } else if (m.endedBy === 'penalties') {
                const amIWinner = (isTeam1 && m.penaltyWinner === 1) || (isTeam2 && m.penaltyWinner === 2);
                if (amIWinner) wins++; else losses++;
            } else if (m.endedBy === 'forfeit') {
                const amILoser = (isTeam1 && m.forfeitLoser === 1) || (isTeam2 && m.forfeitLoser === 2);
                if (amILoser) losses++; else wins++;
            }
        });

        const derivedStats: PlayerStats = {
            matchesPlayed: myMatches.length,
            wins,
            draws,
            losses,
            goalsScored,
            goalsConceded
        };

        return {
            ...p,
            derivedStats
        };
    });

    // Sort players by win rate for ranking
    const rankedPlayers = [...playersWithDerivedStats].sort((a, b) => {
        const rateA = a.derivedStats.matchesPlayed > 0 ? a.derivedStats.wins / a.derivedStats.matchesPlayed : 0;
        const rateB = b.derivedStats.matchesPlayed > 0 ? b.derivedStats.wins / b.derivedStats.matchesPlayed : 0;
        if (rateB !== rateA) return rateB - rateA;
        return b.derivedStats.goalsScored - a.derivedStats.goalsScored; // Tie-breaker: goals
    });

    const currentPlayerWithStats = playersWithDerivedStats.find(p => p.id === player.id);
    const myRank = rankedPlayers.findIndex(p => p.id === player.id) + 1;

    // --- AUTOMATIC SESSION CLUSTERING LOGIC ---
    const getNames = (ids: string[]) => ids.map(id => players.find(p => p.id === id)?.name || 'Jugador').join(', ');

    const sessions = (() => {
        if (matches.length === 0) return [];
        const sorted = [...matches].sort((a, b) => a.date - b.date);
        const clusters: Match[][] = [];
        let currentCluster: Match[] = [sorted[0]];

        for (let i = 1; i < sorted.length; i++) {
            const lastMatch = currentCluster[currentCluster.length - 1];
            const currentMatch = sorted[i];

            const timeDiff = currentMatch.date - lastMatch.date;
            const lastPlayers = new Set([...lastMatch.players.team1, ...lastMatch.players.team2]);
            const currentPlayers = new Set([...currentMatch.players.team1, ...currentMatch.players.team2]);

            // Criteria: Less than 2 hours gap AND same exact set of players involved
            const samePlayers = lastPlayers.size === currentPlayers.size &&
                [...lastPlayers].every(p => currentPlayers.has(p));

            if (timeDiff < 2 * 60 * 60 * 1000 && samePlayers) {
                currentCluster.push(currentMatch);
            } else {
                clusters.push(currentCluster);
                currentCluster = [currentMatch];
            }
        }
        clusters.push(currentCluster);
        return clusters.reverse(); // Newest sessions first
    })();

    // Derive Social News from Sessions
    const socialNews: any[] = [];

    // 1. Session News (Top 5 sessions)
    sessions.slice(0, 5).forEach((session, sIdx) => {
        const count = session.length;
        const firstMatch = session[0];
        const participantIds = new Set([...firstMatch.players.team1, ...firstMatch.players.team2]);

        if (count === 1) {
            // Individual Match
            const m = session[0];
            const t1 = getNames(m.players.team1);
            const t2 = getNames(m.players.team2);
            socialNews.push({
                id: `session-${sIdx}`,
                type: 'match',
                title: 'Partido Finalizado',
                content: `${t1} vs ${t2} (${m.score.team1} - ${m.score.team2})`,
                time: new Date(m.date).toLocaleDateString(),
                icon: <Activity className="w-4 h-4 text-primary" />,
                badge: m.type
            });
        } else {
            // Grouped Session
            const isH2H = participantIds.size === 2; // 1v1 or same 2 players swaping? No, just 2 people involved.

            if (isH2H) {
                const pIds = Array.from(participantIds);
                let p1Wins = 0;
                let p2Wins = 0;
                let draws = 0;

                session.forEach(m => {
                    // This assumes 1v1 for simplification of summary
                    const p1Id = pIds[0];
                    const isP1Team1 = m.players.team1.includes(p1Id);
                    const s1 = isP1Team1 ? m.score.team1 : m.score.team2;
                    const s2 = isP1Team1 ? m.score.team2 : m.score.team1;

                    if (m.endedBy === 'regular') {
                        if (s1 > s2) p1Wins++; else if (s2 > s1) p2Wins++; else draws++;
                    } else if (m.endedBy === 'penalties') {
                        const winTeam = m.penaltyWinner;
                        const p1Team = isP1Team1 ? 1 : 2;
                        if (winTeam === p1Team) p1Wins++; else p2Wins++;
                    } else if (m.endedBy === 'forfeit') {
                        const loseTeam = m.forfeitLoser;
                        const p1Team = isP1Team1 ? 1 : 2;
                        if (loseTeam === p1Team) p2Wins++; else p1Wins++;
                    }
                });

                const p1Name = players.find(p => p.id === pIds[0])?.name || 'Jugador';
                const p2Name = players.find(p => p.id === pIds[1])?.name || 'Jugador';

                socialNews.push({
                    id: `session-${sIdx}`,
                    type: 'session',
                    title: 'Duelo Finalizado',
                    content: `${p1Name} ${p1Wins} - ${p2Wins} ${p2Name} (${count} partidas)`,
                    time: 'Sesión Agrupada',
                    icon: <Users className="w-4 h-4 text-accent" />,
                    badge: 'H2H'
                });
            } else {
                // Multi-player Session
                const playerNames = getNames(Array.from(participantIds));
                socialNews.push({
                    id: `session-${sIdx}`,
                    type: 'session',
                    title: 'Sesión Grupal',
                    content: `${playerNames}: ${count} partidos registrados.`,
                    time: 'Hace un momento',
                    icon: <Users className="w-4 h-4 text-purple-500" />,
                    badge: `${participantIds.size} Jugadores`
                });
            }
        }
    });

    // 2. Ranking / Milestone News (limit to top 1-2 keep it clean)
    if (myRank > 0 && myRank <= 3 && matches.length > 0) {
        socialNews.push({
            id: 'rank-top',
            type: 'rank',
            title: '¡Imparable!',
            content: `Mantienes tu posición en el TOP 3 del ranking mundial.`,
            time: 'Ranking',
            icon: <Star className="w-4 h-4 text-yellow-500" />
        });
    }

    const topScorer = [...playersWithDerivedStats]
        .filter(p => p.derivedStats.goalsScored > 0)
        .sort((a, b) => b.derivedStats.goalsScored - a.derivedStats.goalsScored)[0];

    if (topScorer && matches.length > 0) {
        socialNews.push({
            id: 'top-scorer',
            type: 'milestone',
            title: 'Pichichi',
            content: `${topScorer.name} lidera la tabla de goleadores con ${topScorer.derivedStats.goalsScored} tantos.`,
            time: 'Liderazgo',
            icon: <Trophy className="w-4 h-4 text-yellow-400" />
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
                    <span className="font-bold text-primary font-mono italic">#{myRank || '-'}</span>
                </div>
            </div>

            {/* Social News Feed */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-secondary" /> Novedades Sociales
                    </h3>
                    <div className="text-[9px] uppercase font-black text-gray-600 tracking-widest flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Auto-Agrupado
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {socialNews.length > 0 ? socialNews.map(news => (
                        <Card key={news.id} glass={false} className="relative overflow-hidden group border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all p-4">
                            {/* Visual Indicator Line */}
                            <div className={cn(
                                "absolute left-0 top-0 bottom-0 w-1",
                                news.type === 'session' ? "bg-accent" :
                                    news.type === 'rank' ? "bg-yellow-500" :
                                        news.type === 'milestone' ? "bg-purple-500" : "bg-primary"
                            )} />

                            <div className="flex items-start gap-4">
                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                                    {news.icon}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">{news.title}</p>
                                        {news.badge && (
                                            <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded-full border border-white/10 font-black text-gray-400">
                                                {news.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm font-bold text-gray-200 leading-tight">{news.content}</p>
                                    <div className="flex items-center gap-2 pt-1">
                                        <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">{news.time}</span>
                                    </div>
                                </div>
                                {news.type === 'rank' && <ArrowUpRight className="w-4 h-4 text-yellow-500 animate-pulse" />}
                            </div>
                        </Card>
                    )) : (
                        <div className="text-center py-8 bg-white/[0.01] rounded-3xl border border-dashed border-white/5">
                            <MoreHorizontal className="w-8 h-8 mx-auto text-gray-800 mb-2" />
                            <p className="text-xs text-gray-600 italic">No hay actividad reciente para agrupar.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Ranking */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Star className="w-3 h-3 text-yellow-500" /> Líderes de la Comunidad
                    </h3>
                    <Link to="/stats" className="text-[10px] text-primary hover:underline uppercase font-bold tracking-widest">
                        Ranking Completo
                    </Link>
                </div>
                <div className="space-y-2">
                    {rankedPlayers.slice(0, 3).map((p, idx) => (
                        <Card key={p.id} className={cn("p-4 flex items-center justify-between border-white/5 transition-all hover:border-white/20", idx === 0 && "border-yellow-500/20 bg-yellow-500/5")}>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <span className={cn("absolute -top-3 -left-2 font-black text-xs italic font-mono", idx === 0 ? "text-yellow-500" : "text-gray-600")}>
                                        #{idx + 1}
                                    </span>
                                    <span className="text-3xl drop-shadow-glow">{p.avatar}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm tracking-tight">{p.name} {p.id === player.id && "(Tú)"}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">
                                            {p.derivedStats.matchesPlayed} Partidos
                                        </span>
                                        <div className="w-1 h-1 bg-gray-700 rounded-full" />
                                        <span className="text-[9px] text-primary font-black uppercase tracking-widest">
                                            {p.derivedStats.matchesPlayed > 0 ? Math.round((p.derivedStats.wins / p.derivedStats.matchesPlayed) * 100) : 0}% Win Rate
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-black/20 px-3 py-1 rounded-lg border border-white/5 text-center min-w-[50px]">
                                <span className="block font-black text-xs text-primary">{p.derivedStats.wins}W</span>
                                <span className="text-[8px] text-gray-600 font-bold uppercase">{p.derivedStats.losses}L</span>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Advanced Performance Metrics */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-3 h-3 text-primary" /> Rendimiento Reciente
                    </h3>
                    <span className="text-[10px] text-gray-500 uppercase font-bold italic">Últimos 10 Partidos</span>
                </div>

                {/* Main Performance Cards */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Efficiency Card */}
                    <Card glass className="p-4 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <Target className="w-5 h-5 text-primary opacity-50" />
                            <div className="bg-primary/20 px-2 py-0.5 rounded text-[8px] font-black uppercase text-primary border border-primary/30">Lvl 1</div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-3xl font-black font-mono tracking-tighter text-white">
                                {currentPlayerWithStats?.derivedStats.matchesPlayed ? Math.round((currentPlayerWithStats.derivedStats.wins / currentPlayerWithStats.derivedStats.matchesPlayed) * 100) : 0}%
                            </span>
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none">Efectividad Total</p>
                        </div>
                    </Card>

                    {/* Goals Average Card */}
                    <Card glass className="p-4 border-accent/20 bg-gradient-to-br from-accent/10 to-transparent relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <Trophy className="w-5 h-5 text-accent opacity-50" />
                            <div className="bg-accent/20 px-2 py-0.5 rounded text-[8px] font-black uppercase text-accent border border-accent/30">Promedio</div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-3xl font-black font-mono tracking-tighter text-white">
                                {currentPlayerWithStats?.derivedStats.matchesPlayed ? (currentPlayerWithStats.derivedStats.goalsScored / currentPlayerWithStats.derivedStats.matchesPlayed).toFixed(1) : '0.0'}
                            </span>
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none">Goles por Partido</p>
                        </div>
                    </Card>
                </div>

                {/* Form and Detailed Stats */}
                <Card glass className="p-5 border-white/5 bg-white/[0.02]">
                    <div className="space-y-6">
                        {/* 10 Match Form */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Estado de Forma</label>
                                <div className="flex gap-1">
                                    {(() => {
                                        const myLastMatches = [...matches]
                                            .filter(m => m.players.team1.includes(player.id) || m.players.team2.includes(player.id))
                                            .sort((a, b) => b.date - a.date)
                                            .slice(0, 10)
                                            .reverse();

                                        const dots = [];
                                        for (let i = 0; i < 10; i++) {
                                            const m = myLastMatches[i];
                                            if (!m) {
                                                dots.push(<div key={i} className="w-3 h-3 rounded-full bg-white/5 border border-white/5" />);
                                            } else {
                                                const isT1 = m.players.team1.includes(player.id);
                                                const win = (isT1 && m.score.team1 > m.score.team2) || (!isT1 && m.score.team2 > m.score.team1);
                                                const draw = m.score.team1 === m.score.team2;

                                                dots.push(
                                                    <div key={i} className={cn(
                                                        "w-3 h-3 rounded-full border shadow-sm",
                                                        win ? "bg-primary border-primary/50 shadow-primary/20" :
                                                            draw ? "bg-gray-500 border-gray-400/50 shadow-gray-500/20" :
                                                                "bg-red-500 border-red-400/50 shadow-red-500/20"
                                                    )} />
                                                );
                                            }
                                        }
                                        return dots;
                                    })()}
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4">
                                <div className="text-center space-y-1">
                                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span className="text-[10px] font-black uppercase tracking-tighter">WINs</span>
                                    </div>
                                    <span className="text-xl font-black font-mono text-white">{currentPlayerWithStats?.derivedStats.wins || 0}</span>
                                </div>
                                <div className="text-center space-y-1 border-x border-white/5">
                                    <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                                        <MinusCircle className="w-3 h-3" />
                                        <span className="text-[10px] font-black uppercase tracking-tighter">Draws</span>
                                    </div>
                                    <span className="text-xl font-black font-mono text-white">{currentPlayerWithStats?.derivedStats.draws || 0}</span>
                                </div>
                                <div className="text-center space-y-1">
                                    <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
                                        <XCircle className="w-3 h-3" />
                                        <span className="text-[10px] font-black uppercase tracking-tighter">Lost</span>
                                    </div>
                                    <span className="text-xl font-black font-mono text-white">{currentPlayerWithStats?.derivedStats.losses || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Average Section */}
                        <div className="grid grid-cols-2 gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <Target className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">Favor</p>
                                    <p className="text-xs font-bold text-white leading-none">
                                        {currentPlayerWithStats?.derivedStats.matchesPlayed ? (currentPlayerWithStats.derivedStats.goalsScored / currentPlayerWithStats.derivedStats.matchesPlayed).toFixed(2) : '0.00'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500/10 rounded-xl">
                                    <Shield className="w-4 h-4 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">Contra</p>
                                    <p className="text-xs font-bold text-white leading-none">
                                        {currentPlayerWithStats?.derivedStats.matchesPlayed ? (currentPlayerWithStats.derivedStats.goalsConceded / currentPlayerWithStats.derivedStats.matchesPlayed).toFixed(2) : '0.00'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </section>

            {/* Quick Access to Social */}
            <Link to="/friends">
                <Card className="p-4 flex items-center justify-between border-white/10 hover:border-primary/50 transition-all bg-gradient-to-r from-transparent to-primary/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-bold text-sm tracking-tight italic uppercase">Comunidad</p>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Tienes {myFriends.length} amigos registrados</p>
                        </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-primary/50" />
                </Card>
            </Link>
        </div>
    );
}
