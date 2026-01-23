import { Link } from 'react-router-dom';
import { Trophy, Users, TrendingUp, Star, ArrowUpRight, Activity, MoreHorizontal, Heart, ChevronRight } from 'lucide-react';
import { usePlayers } from '../hooks/usePlayers';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { cn, getScoreBreakdown } from '../lib/utils';
import { useState } from 'react';
import { Info } from 'lucide-react';
import { FormStateDetail } from '../components/dashboard/FormStateDetail';
import type { Player, Match } from '../types';

interface DashboardProps {
    player: Player;
}

export function HomePage({ player }: DashboardProps) {
    const { players } = usePlayers();

    const { matches } = useData();

    const { rankedPlayers, recentRankedPlayers } = useLeaderboard();
    const [rankingPeriod, setRankingPeriod] = useState<'all' | 'recent'>('all');
    const displayRanking = rankingPeriod === 'all' ? rankedPlayers : recentRankedPlayers;

    const currentPlayerWithStats = displayRanking.find((p: any) => p.id === player.id);
    const myRank = displayRanking.findIndex((p: any) => p.id === player.id) + 1;

    const [showBreakdown, setShowBreakdown] = useState<string | null>(null);
    const [showFormDetail, setShowFormDetail] = useState(false);
    const [likedNews, setLikedNews] = useState<Record<string, boolean>>(() => {
        const saved = localStorage.getItem('social_likes');
        return saved ? JSON.parse(saved) : {};
    });

    const toggleLike = (newsId: string) => {
        const newLikes = { ...likedNews, [newsId]: !likedNews[newsId] };
        setLikedNews(newLikes);
        localStorage.setItem('social_likes', JSON.stringify(newLikes));
    };

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
            const diff = Math.abs(m.score.team1 - m.score.team2);

            let badge: string = m.type;
            let label = 'Partido Finalizado';
            if (diff >= 4) { badge = 'Goleada'; }
            if (m.endedBy === 'penalties') { badge = 'Drama'; label = 'Definición por Penales'; }

            socialNews.push({
                id: `match-${m.date}`,
                type: 'match',
                title: label,
                content: `${t1} vs ${t2} (${m.score.team1} - ${m.score.team2})`,
                time: new Date(m.date).toLocaleDateString(),
                icon: <Activity className="w-4 h-4 text-primary" />,
                badge: badge
            });
        } else {
            // Grouped Session
            const isH2H = participantIds.size === 2;

            if (isH2H) {
                const pIds = Array.from(participantIds);
                let p1Wins = 0;
                let p2Wins = 0;
                let draws = 0;

                session.forEach(m => {
                    const p1Id = pIds[0];
                    const isP1Team1 = m.players.team1.includes(p1Id);
                    const s1 = isP1Team1 ? m.score.team1 : m.score.team2;
                    const s2 = isP1Team1 ? m.score.team2 : m.score.team1;

                    if (m.endedBy === 'regular') {
                        if (s1 > s2) p1Wins++; else if (s2 > s1) p2Wins++; else draws++;
                    } else {
                        // Penalties or Forfeit
                        const winTeam = m.endedBy === 'penalties' ? m.penaltyWinner : (m.forfeitLoser === 1 ? 2 : 1);
                        const p1Team = isP1Team1 ? 1 : 2;
                        if (winTeam === p1Team) p1Wins++; else p2Wins++;
                    }
                });

                const p1Name = players.find(p => p.id === pIds[0])?.name || 'Jugador';
                const p2Name = players.find(p => p.id === pIds[1])?.name || 'Jugador';

                let badge = 'H2H';
                if (count >= 5) badge = 'Maratón';
                if (Math.abs(p1Wins - p2Wins) < 2 && count > 3) badge = 'Clásico';

                socialNews.push({
                    id: `session-${sIdx}`,
                    type: 'session',
                    title: 'Duelo Finalizado',
                    content: `${p1Wins > p2Wins ? '👑 ' : ''}${p1Name} ${p1Wins} - ${p2Wins} ${p2Name}${p2Wins > p1Wins ? ' 👑' : ''}`,
                    time: `${count} partidas jugadas`,
                    icon: <Users className="w-4 h-4 text-accent" />,
                    badge: badge
                });
            } else {
                // Multi-player Session
                const playerNames = getNames(Array.from(participantIds));
                socialNews.push({
                    id: `session-${sIdx}`,
                    type: 'session',
                    title: 'Sesión Grupal',
                    content: `Gran juntada de ${playerNames.split(',')[0]} y cía.`,
                    time: `${count} partidos registrados`,
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

    const topScorer = [...rankedPlayers]
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
                    <h2 className="text-4xl font-black font-heading tracking-tighter uppercase italic leading-none">Dashboard</h2>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.3em] mt-1">Tu progreso social</p>
                </div>
                <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span className="font-bold text-primary font-mono italic">#{myRank || '-'}</span>
                </div>
            </div>

            {/* Social News Feed (Carousel) */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-secondary" /> Novedades
                    </h3>
                    <div className="flex gap-1">
                        {socialNews.slice(0, 5).map((_, idx) => (
                            <div key={idx} className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        ))}
                    </div>
                </div>

                <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 scrollbar-hide">
                    {socialNews.length > 0 ? (
                        socialNews.slice(0, 5).map(news => (
                            <div key={news.id} className="w-full flex-shrink-0 snap-center scroll-ml-4">
                                <Card glass={false} className="relative overflow-hidden group border-white/5 bg-white/[0.02] p-6 h-full flex flex-col justify-center">
                                    {/* Visual Indicator Line */}
                                    <div className={cn(
                                        "absolute left-0 top-0 bottom-0 w-1.5",
                                        news.type === 'session' ? "bg-accent" :
                                            news.type === 'rank' ? "bg-yellow-500" :
                                                news.type === 'milestone' ? "bg-purple-500" : "bg-primary"
                                    )} />

                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                            {news.icon}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">{news.title}</p>
                                                {news.badge && (
                                                    <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded-full border border-white/10 font-black text-gray-400">
                                                        {news.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-gray-600 uppercase font-black tracking-widest">{news.time}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start mt-auto">
                                        <p className="text-lg font-bold text-gray-200 leading-tight pr-8">{news.content}</p>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleLike(news.id);
                                            }}
                                            className={cn(
                                                "p-2 rounded-full transition-all duration-300",
                                                likedNews[news.id] ? "text-red-500 scale-125" : "text-gray-700 hover:text-red-400 hover:scale-110"
                                            )}
                                        >
                                            <Heart className={cn("w-5 h-5", likedNews[news.id] && "fill-current")} />
                                        </button>
                                    </div>
                                </Card>
                            </div>
                        ))
                    ) : (
                        <div className="w-full flex-shrink-0 snap-center">
                            <div className="text-center py-8 bg-white/[0.01] rounded-3xl border border-dashed border-white/5 mx-auto">
                                <MoreHorizontal className="w-8 h-8 mx-auto text-gray-800 mb-2" />
                                <p className="text-xs text-gray-600 italic">No hay actividad reciente.</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Performance Metrics */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-3 h-3 text-primary" /> Rendimiento
                    </h3>
                    <span className="text-[10px] text-gray-500 uppercase font-bold italic">Últimos 10</span>
                </div>

                <div className="space-y-3">
                    {/* Enhanced Form State Card */}
                    <button
                        onClick={() => setShowFormDetail(true)}
                        className="w-full text-left group"
                    >
                        <Card glass className="p-5 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent hover:border-primary/40 transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Activity className="w-16 h-16" />
                            </div>
                            <div className="space-y-4 relative">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <label className="text-xs text-primary uppercase font-black tracking-widest flex items-center gap-2">
                                            <Activity className="w-4 h-4" />
                                            Estado de Forma
                                        </label>
                                        <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-0.5">Últimos 10 partidos</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-primary/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>

                                <div className="flex gap-2">
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
                                                dots.push(<div key={i} className="w-5 h-5 rounded-full bg-white/5 border border-white/5" />);
                                            } else {
                                                const isT1 = m.players.team1.includes(player.id);
                                                const win = (isT1 && m.score.team1 > m.score.team2) || (!isT1 && m.score.team2 > m.score.team1);
                                                const draw = m.score.team1 === m.score.team2;

                                                dots.push(
                                                    <div key={i} className={cn(
                                                        "w-5 h-5 rounded-full border-2 shadow-sm transition-transform group-hover:scale-110",
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

                                {/* Quick Stats */}
                                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                                    {(() => {
                                        const myLastMatches = [...matches]
                                            .filter(m => m.players.team1.includes(player.id) || m.players.team2.includes(player.id))
                                            .sort((a, b) => b.date - a.date)
                                            .slice(0, 10);

                                        let wins = 0, draws = 0, losses = 0;
                                        myLastMatches.forEach(m => {
                                            const isT1 = m.players.team1.includes(player.id);
                                            const myScore = isT1 ? m.score.team1 : m.score.team2;
                                            const oppScore = isT1 ? m.score.team2 : m.score.team1;

                                            if (m.endedBy === 'regular') {
                                                if (myScore > oppScore) wins++;
                                                else if (myScore < oppScore) losses++;
                                                else draws++;
                                            } else if (m.endedBy === 'penalties') {
                                                const amIWinner = (isT1 && m.penaltyWinner === 1) || (!isT1 && m.penaltyWinner === 2);
                                                if (amIWinner) wins++; else losses++;
                                            } else if (m.endedBy === 'forfeit') {
                                                const amILoser = (isT1 && m.forfeitLoser === 1) || (!isT1 && m.forfeitLoser === 2);
                                                if (amILoser) losses++; else wins++;
                                            }
                                        });

                                        return (
                                            <>
                                                <div className="flex-1 text-center">
                                                    <span className="text-xl font-black text-green-500 block leading-none">{wins}</span>
                                                    <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Victorias</span>
                                                </div>
                                                <div className="w-px h-8 bg-white/10" />
                                                <div className="flex-1 text-center">
                                                    <span className="text-xl font-black text-gray-400 block leading-none">{draws}</span>
                                                    <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Empates</span>
                                                </div>
                                                <div className="w-px h-8 bg-white/10" />
                                                <div className="flex-1 text-center">
                                                    <span className="text-xl font-black text-red-500 block leading-none">{losses}</span>
                                                    <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Derrotas</span>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </Card>
                    </button>

                    {/* Line 2: Detailed Stats Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        {/* Effectiveness */}
                        <Card glass className="p-3 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent flex flex-col justify-center items-center text-center">
                            <span className="text-2xl font-black font-mono tracking-tighter text-white mb-1">
                                {currentPlayerWithStats?.derivedStats.matchesPlayed ? Math.round((currentPlayerWithStats.derivedStats.wins / currentPlayerWithStats.derivedStats.matchesPlayed) * 100) : 0}%
                            </span>
                            <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest leading-none">Efectividad</p>
                        </Card>

                        {/* Avg Goals For */}
                        <Card glass className="p-3 border-accent/20 bg-gradient-to-br from-accent/10 to-transparent flex flex-col justify-center items-center text-center">
                            <span className="text-2xl font-black font-mono tracking-tighter text-white mb-0.5">
                                {currentPlayerWithStats?.derivedStats.matchesPlayed ? (currentPlayerWithStats.derivedStats.goalsScored / currentPlayerWithStats.derivedStats.matchesPlayed).toFixed(1) : '0.0'}
                            </span>
                            <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">PROM. FAVOR</p>
                        </Card>

                        {/* Avg Goals Against */}
                        <Card glass className="p-3 border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent flex flex-col justify-center items-center text-center">
                            <span className="text-2xl font-black font-mono tracking-tighter text-white mb-0.5">
                                {currentPlayerWithStats?.derivedStats.matchesPlayed ? (currentPlayerWithStats.derivedStats.goalsConceded / currentPlayerWithStats.derivedStats.matchesPlayed).toFixed(1) : '0.0'}
                            </span>
                            <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">PROM. CONTRA</p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Featured Ranking */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Star className="w-3 h-3 text-yellow-500" /> Ranking
                        </h3>
                        <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10 scale-90 origin-left">
                            <button
                                onClick={() => setRankingPeriod('all')}
                                className={cn(
                                    "px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all",
                                    rankingPeriod === 'all' ? "bg-primary text-white" : "text-gray-500"
                                )}
                            >
                                All-Time
                            </button>
                            <button
                                onClick={() => setRankingPeriod('recent')}
                                className={cn(
                                    "px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all",
                                    rankingPeriod === 'recent' ? "bg-primary text-white" : "text-gray-500"
                                )}
                            >
                                30 Días
                            </button>
                        </div>
                    </div>
                    <Link to="/stats" className="text-[10px] text-primary hover:underline uppercase font-bold tracking-widest">
                        Ver Todo
                    </Link>
                </div>
                <div className="space-y-2">
                    {displayRanking.slice(0, 3).map((p: any, idx: number) => {
                        const breakdown = getScoreBreakdown(p.derivedStats);
                        return (
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
                                                {p.derivedStats.matchesPlayed} PJ
                                            </span>
                                            <div className="w-1 h-1 bg-gray-700 rounded-full" />
                                            <button
                                                className="flex items-center gap-1 group/btn"
                                                onClick={() => setShowBreakdown(showBreakdown === p.id ? null : p.id)}
                                            >
                                                <span className="text-[9px] text-primary font-black uppercase tracking-widest group-hover/btn:underline">
                                                    {breakdown.total} PTS
                                                </span>
                                                <Info className="w-2.5 h-2.5 text-gray-600" />
                                            </button>
                                        </div>

                                        {showBreakdown === p.id && (
                                            <div className="mt-3 p-3 bg-black/40 rounded-xl border border-white/10 space-y-1.5 animate-in zoom-in-95 duration-200">
                                                <div className="flex justify-between text-[8px] uppercase font-black">
                                                    <span className="text-gray-500">Normalización:</span>
                                                    <span className="text-white">x{(breakdown.confidence).toFixed(2)}</span>
                                                </div>
                                                <div className="h-px bg-white/5" />
                                                <div className="flex justify-between text-[8px] uppercase font-black">
                                                    <span className="text-gray-500">Victorias:</span>
                                                    <span className="text-primary">+{breakdown.wins}</span>
                                                </div>
                                                <div className="flex justify-between text-[8px] uppercase font-black">
                                                    <span className="text-gray-500">Empates:</span>
                                                    <span className="text-gray-300">+{breakdown.draws}</span>
                                                </div>
                                                <div className="flex justify-between text-[8px] uppercase font-black">
                                                    <span className="text-gray-500">Dif. Goles:</span>
                                                    <span className={breakdown.goalDiff >= 0 ? "text-green-500" : "text-red-500"}>
                                                        {breakdown.goalDiff > 0 ? '+' : ''}{breakdown.goalDiff}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-[8px] uppercase font-black">
                                                    <span className="text-gray-500">Actividad:</span>
                                                    <span className="text-accent">+{breakdown.matches}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {idx === 0 && <Trophy className="w-5 h-5 text-yellow-500 opacity-50" />}
                            </Card>
                        );
                    })}
                </div>
            </section>


            {/* Community */}
            <section className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <Users className="w-3 h-3 text-primary" /> Comunidad
                </h3>
                <Link to="/friends">
                    <Card className="p-4 flex items-center justify-between border-white/10 hover:border-primary/50 transition-all bg-gradient-to-r from-transparent to-primary/5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                                <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-bold text-sm tracking-tight italic uppercase">Amigos y Jugadores</p>
                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Ver lista completa</p>
                            </div>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-primary/50" />
                    </Card>
                </Link>
            </section>

            {/* Form State Detail Modal */}
            {showFormDetail && (
                <FormStateDetail
                    player={player}
                    matches={matches}
                    onClose={() => setShowFormDetail(false)}
                />
            )}
        </div>
    );
}
