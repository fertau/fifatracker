import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Trash2, Calendar, Trophy, Edit2, AlertTriangle, X, Save, Clock, Users, TrendingUp, Target } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import type { Match, Player, AuditLogEntry } from '../../types';
import { useAdvancedStats } from '../../hooks/useAdvancedStats';
import { useTournaments } from '../../hooks/useTournaments';

interface MatchHistoryProps {
    currentUser: Player;
}

export function MatchHistory({ currentUser }: MatchHistoryProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { matches, deleteMatch, getPlayer, updateMatch } = useData();
    const { tournaments } = useTournaments();
    const stats = useAdvancedStats(currentUser.id);

    const [editingMatch, setEditingMatch] = useState<Match | null>(null);
    const [showAuditFor, setShowAuditFor] = useState<string | null>(null);

    // View States
    const [activeTab, setActiveTab] = useState<'total' | 'h2h'>('total');
    const [resultFilter, setResultFilter] = useState<'all' | 'win' | 'draw' | 'loss'>('all');

    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [matchTypeFilter, setMatchTypeFilter] = useState<'all' | '1v1' | '2v2'>('all');

    // Edit Form State
    const [editScore1, setEditScore1] = useState(0);
    const [editScore2, setEditScore2] = useState(0);
    const [editDate, setEditDate] = useState('');

    // Handle navigation state for result filtering
    useEffect(() => {
        const state = location.state as { filterByResult?: 'win' | 'draw' | 'loss' };
        if (state?.filterByResult) {
            setResultFilter(state.filterByResult);
            // Clear the state to avoid re-applying on navigation
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // 1. Calculate Player Ranking (matches played WITH or AGAINST current user)
    const playersRankedByMatches = useMemo(() => {
        const counts: Record<string, number> = {};
        matches.forEach(m => {
            const allPlayers = [...m.players.team1, ...m.players.team2];
            if (allPlayers.includes(currentUser.id)) {
                allPlayers.forEach(pId => {
                    if (pId !== currentUser.id) {
                        counts[pId] = (counts[pId] || 0) + 1;
                    }
                });
            }
        });

        return Object.entries(counts)
            .map(([id, count]) => ({
                player: getPlayer(id),
                count
            }))
            .filter(item => item.player !== undefined)
            .sort((a, b) => b.count - a.count) as { player: Player; count: number }[];
    }, [matches, currentUser.id, getPlayer]);

    // 2. Filter Matches
    const filteredMatches = useMemo(() => {
        let result = [...matches].sort((a, b) => b.date - a.date);

        // Filter by H2H player
        if (activeTab === 'h2h' && selectedPlayerId) {
            result = result.filter(m => {
                const allPlayers = [...m.players.team1, ...m.players.team2];
                return allPlayers.includes(currentUser.id) && allPlayers.includes(selectedPlayerId);
            });
        } else if (activeTab === 'total') {
            result = result.filter(m => [...m.players.team1, ...m.players.team2].includes(currentUser.id));
        }

        // Filter by Match Type
        if (matchTypeFilter !== 'all') {
            result = result.filter(m => m.type === matchTypeFilter);
        }

        // Filter by Result
        if (resultFilter !== 'all') {
            result = result.filter(m => {
                const isT1 = m.players.team1.includes(currentUser.id);
                const myScore = isT1 ? m.score.team1 : m.score.team2;
                const oppScore = isT1 ? m.score.team2 : m.score.team1;

                let matchResult: 'win' | 'draw' | 'loss' = 'draw';
                if (m.endedBy === 'regular') {
                    if (myScore > oppScore) matchResult = 'win';
                    else if (myScore < oppScore) matchResult = 'loss';
                } else if (m.endedBy === 'penalties') {
                    const amIWinner = (isT1 && m.penaltyWinner === 1) || (!isT1 && m.penaltyWinner === 2);
                    matchResult = amIWinner ? 'win' : 'loss';
                } else if (m.endedBy === 'forfeit') {
                    const amILoser = (isT1 && m.forfeitLoser === 1) || (!isT1 && m.forfeitLoser === 2);
                    matchResult = amILoser ? 'loss' : 'win';
                }

                return matchResult === resultFilter;
            });
        }

        return result;
    }, [matches, activeTab, selectedPlayerId, matchTypeFilter, resultFilter, currentUser.id]);

    // 3. Calculate H2H Stats
    const h2hStats = useMemo(() => {
        if (!selectedPlayerId) return null;

        const h2hMatches = matches.filter(m => {
            const allPlayers = [...m.players.team1, ...m.players.team2];
            return allPlayers.includes(currentUser.id) && allPlayers.includes(selectedPlayerId);
        });

        let myWins = 0, myLosses = 0, draws = 0;
        let myGoals = 0, oppGoals = 0;
        let currentStreak = { type: null as 'win' | 'loss' | null, count: 0 };

        h2hMatches.sort((a, b) => b.date - a.date).forEach((m, idx) => {
            const isT1 = m.players.team1.includes(currentUser.id);
            const myScore = isT1 ? m.score.team1 : m.score.team2;
            const oppScore = isT1 ? m.score.team2 : m.score.team1;

            myGoals += myScore;
            oppGoals += oppScore;

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

            if (result === 'win') myWins++;
            else if (result === 'loss') myLosses++;
            else draws++;

            // Calculate streak (most recent matches)
            if (idx === 0) {
                if (result !== 'draw') {
                    currentStreak = { type: result, count: 1 };
                }
            } else if (currentStreak.type && currentStreak.type === result) {
                currentStreak.count++;
            }
        });

        return {
            totalMatches: h2hMatches.length,
            myWins,
            myLosses,
            draws,
            myGoals,
            oppGoals,
            goalDiff: myGoals - oppGoals,
            currentStreak
        };
    }, [matches, currentUser.id, selectedPlayerId]);

    const handleDelete = (id: string) => {
        if (confirm('¿Estás seguro de eliminar este partido? Se revertirán las estadísticas.')) {
            deleteMatch(id);
        }
    };

    const startEdit = (match: Match) => {
        setEditingMatch(match);
        setEditScore1(match.score.team1);
        setEditScore2(match.score.team2);
        const d = new Date(match.date);
        setEditDate(d.toISOString().slice(0, 16));
    };

    const handleUpdate = async () => {
        if (!editingMatch) return;

        const updatedMatch: Match = {
            ...editingMatch,
            score: { team1: editScore1, team2: editScore2 },
            date: new Date(editDate).getTime()
        };

        const changes = [];
        if (editingMatch.score.team1 !== editScore1) changes.push(`Local: ${editingMatch.score.team1} -> ${editScore1}`);
        if (editingMatch.score.team2 !== editScore2) changes.push(`Visitante: ${editingMatch.score.team2} -> ${editScore2}`);
        if (editingMatch.date !== updatedMatch.date) changes.push(`Fecha: ${new Date(editingMatch.date).toLocaleString()} -> ${new Date(updatedMatch.date).toLocaleString()}`);

        if (changes.length === 0) {
            setEditingMatch(null);
            return;
        }

        const audit: AuditLogEntry = {
            userId: currentUser.id,
            userName: currentUser.name,
            timestamp: Date.now(),
            changes: changes.join(', ')
        };

        try {
            await updateMatch(editingMatch, updatedMatch, audit);
            setEditingMatch(null);
        } catch (error) {
            alert('Error al actualizar el partido');
        }
    };

    // Calculate Tournament Wins
    const tournamentsWon = useMemo(() => {
        return tournaments.filter(t =>
            t.status === 'completed' && t.winner === currentUser.id
        ).length;
    }, [tournaments, currentUser.id]);

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent uppercase tracking-tighter italic">
                            Historial
                        </h2>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest italic">Tus Estadísticas</p>
                    </div>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <Calendar className="w-5 h-5 text-primary" />
                </div>
            </div>

            {/* SUMMARY DASHBOARD */}
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4">
                {/* Match Stats */}
                <Card glass className="p-4 bg-gradient-to-br from-white/[0.05] to-transparent border-t border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trophy className="w-12 h-12" />
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Partidos Jugados</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-white tracking-tight">{stats.matchesPlayed}</span>
                                <span className="text-xs text-gray-500 font-medium">Total</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-black/20 p-2 rounded-lg backdrop-blur-sm">
                            <div className="flex-1 text-center border-r border-white/10">
                                <span className="text-green-400 block text-lg leading-none">{stats.wins}</span>
                                <span className="text-[8px] text-gray-500">Vic</span>
                            </div>
                            <div className="flex-1 text-center border-r border-white/10">
                                <span className="text-gray-300 block text-lg leading-none">{stats.draws}</span>
                                <span className="text-[8px] text-gray-500">Emp</span>
                            </div>
                            <div className="flex-1 text-center">
                                <span className="text-red-400 block text-lg leading-none">{stats.losses}</span>
                                <span className="text-[8px] text-gray-500">Der</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Goal Stats */}
                <Card glass className="p-4 bg-gradient-to-br from-white/[0.05] to-transparent border-t border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trophy className="w-12 h-12" />
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Goles Totales</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-white tracking-tight">{stats.totalGoalsScored}</span>
                                <span className="text-xs text-gray-500 font-medium">GF</span>
                            </div>
                        </div>

                        <div className="space-y-1.5 bg-black/20 p-2 rounded-lg backdrop-blur-sm">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                <span className="text-gray-400">Promedio</span>
                                <span className="text-primary text-sm">{stats.matchesPlayed > 0 ? (stats.totalGoalsScored / stats.matchesPlayed).toFixed(1) : 0}</span>
                            </div>
                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: '60%' }} />
                                {/* Static width for visual, ideally calculated based on max or ratio */}
                            </div>
                            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider pt-1">
                                <span className="text-gray-500">Recibidos</span>
                                <span className="text-red-400">-{stats.totalGoalsConceded}</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Tournament Wins */}
                <Card glass className="p-4 bg-gradient-to-br from-white/[0.05] to-transparent border-t border-white/10 relative overflow-hidden group col-span-2">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trophy className="w-12 h-12 text-yellow-500" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-yellow-500/20 p-3 rounded-full border border-yellow-500/20">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Torneos Ganados</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white tracking-tight">{tournamentsWon}</span>
                                <span className="text-xs text-gray-500 font-medium">Campeonatos</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tab Switcher */}
            <div className="flex p-1 bg-white/[0.03] border border-white/5 rounded-2xl">
                <button
                    onClick={() => setActiveTab('total')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                        activeTab === 'total' ? "bg-primary text-black shadow-lg" : "text-gray-500 hover:text-white"
                    )}
                >
                    <Users className="w-4 h-4" /> Total
                </button>
                <button
                    onClick={() => setActiveTab('h2h')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                        activeTab === 'h2h' ? "bg-accent text-black shadow-lg" : "text-gray-500 hover:text-white"
                    )}
                >
                    <Trophy className="w-4 h-4" /> Cara a Cara
                </button>
            </div>

            {/* H2H Player Selector (Animated) */}
            {activeTab === 'h2h' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1 italic">Retadores frecuentes</label>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
                        {playersRankedByMatches.map(({ player, count }) => (
                            <button
                                key={player.id}
                                onClick={() => setSelectedPlayerId(selectedPlayerId === player.id ? null : player.id)}
                                className={cn(
                                    "flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all min-w-[90px]",
                                    selectedPlayerId === player.id
                                        ? "bg-accent/20 border-accent border-2 scale-105"
                                        : "bg-white/[0.02] border-white/5 border opacity-60 hover:opacity-100"
                                )}
                            >
                                <span className="text-3xl grayscale-[0.5]">{player.avatar}</span>
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-white truncate max-w-[70px] leading-tight">{player.name}</p>
                                    <p className="text-[8px] text-accent font-black uppercase tracking-tighter">{count} Pts</p>
                                </div>
                            </button>
                        ))}
                        {playersRankedByMatches.length === 0 && (
                            <p className="text-xs text-gray-500 italic p-4 text-center w-full">No has jugado con otros jugadores registrados.</p>
                        )}
                    </div>
                </div>
            )}

            {/* H2H Summary Card */}
            {activeTab === 'h2h' && selectedPlayerId && h2hStats && (
                <Card glass className="p-5 border-accent/20 bg-gradient-to-br from-accent/10 to-transparent animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                                    <Target className="w-6 h-6 text-accent" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-accent">Cara a Cara</h3>
                                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Resumen del enfrentamiento</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-white">{h2hStats.totalMatches}</p>
                                <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Partidos</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                                <p className="text-2xl font-black text-green-500">{h2hStats.myWins}</p>
                                <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest">Victorias</p>
                            </div>
                            <div className="text-center p-3 bg-gray-500/10 rounded-xl border border-gray-500/20">
                                <p className="text-2xl font-black text-gray-400">{h2hStats.draws}</p>
                                <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest">Empates</p>
                            </div>
                            <div className="text-center p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                                <p className="text-2xl font-black text-red-500">{h2hStats.myLosses}</p>
                                <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest">Derrotas</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                            <div>
                                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Diferencia de Goles</p>
                                <p className={cn(
                                    "text-xl font-black",
                                    h2hStats.goalDiff > 0 ? "text-green-500" : h2hStats.goalDiff < 0 ? "text-red-500" : "text-gray-400"
                                )}>
                                    {h2hStats.goalDiff > 0 ? '+' : ''}{h2hStats.goalDiff}
                                </p>
                            </div>
                            {h2hStats.currentStreak.type && h2hStats.currentStreak.count > 1 && (
                                <div className="text-right">
                                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Racha Actual</p>
                                    <p className={cn(
                                        "text-xl font-black flex items-center gap-1",
                                        h2hStats.currentStreak.type === 'win' ? "text-green-500" : "text-red-500"
                                    )}>
                                        {h2hStats.currentStreak.count}
                                        <TrendingUp className="w-4 h-4" />
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* Filters Row */}
            <div className="space-y-2">
                {/* Match Type Filter */}
                <div className="flex gap-2 p-1 bg-white/[0.02] rounded-xl border border-white/5">
                    {[
                        { id: 'all', label: 'Todos' },
                        { id: '1v1', label: '1 vs 1' },
                        { id: '2v2', label: '2 vs 2' }
                    ].map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setMatchTypeFilter(f.id as any)}
                            className={cn(
                                "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                matchTypeFilter === f.id ? "bg-white/10 text-white" : "text-gray-600 hover:text-gray-400"
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Result Filter */}
                {resultFilter !== 'all' && (
                    <div className="flex items-center justify-between p-2 bg-primary/10 rounded-xl border border-primary/20">
                        <p className="text-[9px] text-primary uppercase font-black tracking-widest">
                            Filtrando por: {resultFilter === 'win' ? 'Victorias' : resultFilter === 'draw' ? 'Empates' : 'Derrotas'}
                        </p>
                        <button
                            onClick={() => setResultFilter('all')}
                            className="text-[9px] text-gray-400 hover:text-white uppercase font-black tracking-widest"
                        >
                            Limpiar
                        </button>
                    </div>
                )}
            </div>

            {/* Matches List */}
            <div className="space-y-4">
                {filteredMatches.length > 0 ? filteredMatches.map(match => {
                    const team1Players = match.players.team1.map(id => getPlayer(id));
                    const team2Players = match.players.team2.map(id => getPlayer(id));

                    const score1 = match.score.team1;
                    const score2 = match.score.team2;
                    let resultInfo = '';

                    if (match.endedBy === 'penalties') resultInfo = ' (Penales)';
                    if (match.endedBy === 'forfeit') resultInfo = ' (Abandono)';

                    return (
                        <Card key={match.id} glass={false} className="relative overflow-hidden group border-white/5 bg-white/[0.01]">
                            <div className="p-3 grid grid-cols-[1fr,auto,1fr] gap-3 items-center">
                                {/* Team 1 */}
                                <div className="text-right space-y-0.5">
                                    <div className="flex flex-col items-end gap-0.5">
                                        {team1Players.map(p => (
                                            <span key={p?.id} className={cn("font-bold text-xs block truncate max-w-[70px]", score1 > score2 ? "text-primary" : "text-gray-400")}>
                                                {p?.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Score & Badge */}
                                <div className="flex flex-col items-center">
                                    <div className="bg-black/50 px-3 py-1 rounded-xl border border-white/10 font-mono font-bold text-base tracking-widest relative shadow-inner">
                                        <span className={score1 > score2 ? "text-primary" : "text-white"}>{score1}</span>
                                        <span className="mx-1.5 text-white/20">-</span>
                                        <span className={score2 > score1 ? "text-accent" : "text-white"}>{score2}</span>

                                        {match.edits && match.edits.length > 0 && (
                                            <button
                                                onClick={() => setShowAuditFor(showAuditFor === match.id ? null : match.id)}
                                                className="absolute -top-2 -right-2 bg-yellow-500 text-black p-0.5 rounded-full hover:scale-110 transition-transform shadow-lg z-20 border-2 border-background"
                                            >
                                                <AlertTriangle className="w-2.5 h-2.5" />
                                            </button>
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-[8px] mt-1.5 uppercase font-black tracking-widest px-1.5 py-0.5 rounded border leading-none bg-white/5",
                                        match.type === '1v1' ? "text-blue-400 border-blue-400/20" : "text-purple-400 border-purple-400/20"
                                    )}>
                                        {match.type} {resultInfo}
                                    </span>
                                </div>

                                {/* Team 2 */}
                                <div className="text-left space-y-0.5">
                                    <div className="flex flex-col items-start gap-0.5">
                                        {team2Players.map(p => (
                                            <span key={p?.id} className={cn("font-bold text-xs block truncate max-w-[70px]", score2 > score1 ? "text-accent" : "text-gray-400")}>
                                                {p?.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Audit Log Overlay */}
                            {showAuditFor === match.id && match.edits && (
                                <div className="px-4 py-3 bg-yellow-500/10 border-t border-yellow-500/20 text-[10px] space-y-2 animate-in slide-in-from-top-2">
                                    <div className="flex items-center gap-1 text-yellow-500 font-bold uppercase tracking-widest">
                                        <Clock className="w-3 h-3" /> Bitácora de Cambios
                                    </div>
                                    {match.edits.map((edit, idx) => (
                                        <div key={idx} className="bg-black/40 p-2 rounded-xl border border-yellow-500/10">
                                            <div className="flex justify-between font-bold text-gray-400 mb-1 italic">
                                                <span>👤 {edit.userName}</span>
                                                <span>{new Date(edit.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                            </div>
                                            <p className="text-gray-500 leading-tight">{edit.changes}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Metadata Footer */}
                            <div className="bg-white/[0.02] px-3 py-2 flex justify-between items-center text-[9px] text-gray-500 border-t border-white/5">
                                <span className="flex items-center gap-1 opacity-60">
                                    <Calendar className="w-3 h-3 text-primary" />
                                    {new Date(match.date).toLocaleDateString()} • {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => startEdit(match)}
                                        className="flex items-center gap-1 text-primary/80 hover:text-primary transition-colors font-bold uppercase tracking-widest"
                                    >
                                        <Edit2 className="w-2.5 h-2.5" /> Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(match.id)}
                                        className="flex items-center gap-1 text-red-500/60 hover:text-red-500 transition-colors font-bold uppercase tracking-widest"
                                    >
                                        <Trash2 className="w-2.5 h-2.5" /> Borrar
                                    </button>
                                </div>
                            </div>
                        </Card>
                    );
                }) : (
                    <div className="text-center py-20 bg-white/[0.02] rounded-[2.5rem] border-2 border-dashed border-white/5 space-y-4">
                        <Trophy className="w-16 h-16 mx-auto text-gray-700 opacity-20" />
                        <div className="space-y-1 px-8">
                            <p className="text-gray-400 font-bold">Sin registros</p>
                            <p className="text-xs text-gray-600">
                                {activeTab === 'h2h' && !selectedPlayerId
                                    ? "Selecciona un jugador para ver tu historial mutuo."
                                    : "No se encontraron partidos para este filtro."}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingMatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
                    <Card glass className="w-full max-w-sm p-8 space-y-6 border-primary/30 rounded-[2.5rem] shadow-2xl">
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-bold font-heading italic uppercase tracking-tighter flex items-center gap-2">
                                    Actualizar
                                </h3>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none">Corregir marcador</p>
                            </div>
                            <button onClick={() => setEditingMatch(null)} className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] ml-1">Fecha y Hora</label>
                                <input
                                    type="datetime-local"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold focus:border-primary outline-none transition-all"
                                    value={editDate}
                                    onChange={(e) => setEditDate(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-primary tracking-[0.2em] ml-1 text-center block">Local</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 text-4xl font-black text-center focus:border-primary outline-none transition-all shadow-inner"
                                        value={editScore1}
                                        onChange={(e) => setEditScore1(parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-accent tracking-[0.2em] ml-1 text-center block">Visitante</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 text-4xl font-black text-center focus:border-accent outline-none transition-all shadow-inner"
                                        value={editScore2}
                                        onChange={(e) => setEditScore2(parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                            <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs" glow onClick={handleUpdate}>
                                <Save className="w-4 h-4 mr-2" /> Guardar Cambios
                            </Button>
                            <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest opacity-50" onClick={() => setEditingMatch(null)}>Cancelar</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
