import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Calendar, Trophy, Edit2, AlertTriangle, X, Save, Clock, Users } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import type { Match, Player, AuditLogEntry } from '../../types';

interface MatchHistoryProps {
    currentUser: Player;
}

export function MatchHistory({ currentUser }: MatchHistoryProps) {
    const navigate = useNavigate();
    const { matches, deleteMatch, getPlayer, updateMatch } = useData();
    const [editingMatch, setEditingMatch] = useState<Match | null>(null);
    const [showAuditFor, setShowAuditFor] = useState<string | null>(null);

    // View States
    const [activeTab, setActiveTab] = useState<'total' | 'h2h'>('total');
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [matchTypeFilter, setMatchTypeFilter] = useState<'all' | '1v1' | '2v2'>('all');

    // Edit Form State
    const [editScore1, setEditScore1] = useState(0);
    const [editScore2, setEditScore2] = useState(0);
    const [editDate, setEditDate] = useState('');

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
            // In total view, we still only show matches where the current user participated?
            // User requested "historial total", usually means all matches involving them.
            // But if they want ALL matches of the app, we can just not filter by user.
            // Let's stick to matches where the user participated for a better personal experience.
            result = result.filter(m => [...m.players.team1, ...m.players.team2].includes(currentUser.id));
        }

        // Filter by Match Type
        if (matchTypeFilter !== 'all') {
            result = result.filter(m => m.type === matchTypeFilter);
        }

        return result;
    }, [matches, activeTab, selectedPlayerId, matchTypeFilter, currentUser.id]);

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
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest italic">Registros de partidos</p>
                    </div>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <Calendar className="w-5 h-5 text-primary" />
                </div>
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
                            <div className="p-4 grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                                {/* Team 1 */}
                                <div className="text-right space-y-1">
                                    <div className="flex flex-col items-end gap-1">
                                        {team1Players.map(p => (
                                            <span key={p?.id} className={cn("font-bold text-sm block truncate max-w-[80px]", score1 > score2 ? "text-primary" : "text-gray-400")}>
                                                {p?.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Score & Badge */}
                                <div className="flex flex-col items-center">
                                    <div className="bg-black/50 px-4 py-1.5 rounded-xl border border-white/10 font-mono font-bold text-lg tracking-widest relative shadow-inner">
                                        <span className={score1 > score2 ? "text-primary" : "text-white"}>{score1}</span>
                                        <span className="mx-2 text-white/20">-</span>
                                        <span className={score2 > score1 ? "text-accent" : "text-white"}>{score2}</span>

                                        {match.edits && match.edits.length > 0 && (
                                            <button
                                                onClick={() => setShowAuditFor(showAuditFor === match.id ? null : match.id)}
                                                className="absolute -top-3 -right-3 bg-yellow-500 text-black p-1 rounded-full hover:scale-110 transition-transform shadow-lg z-20 border-2 border-background"
                                            >
                                                <AlertTriangle className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-[9px] mt-2 uppercase font-black tracking-widest px-2 py-0.5 rounded border leading-none bg-white/5",
                                        match.type === '1v1' ? "text-blue-400 border-blue-400/20" : "text-purple-400 border-purple-400/20"
                                    )}>
                                        {match.type} {resultInfo}
                                    </span>
                                </div>

                                {/* Team 2 */}
                                <div className="text-left space-y-1">
                                    <div className="flex flex-col items-start gap-1">
                                        {team2Players.map(p => (
                                            <span key={p?.id} className={cn("font-bold text-sm block truncate max-w-[80px]", score2 > score1 ? "text-accent" : "text-gray-400")}>
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
                            <div className="bg-white/[0.02] px-4 py-2.5 flex justify-between items-center text-[10px] text-gray-500 border-t border-white/5">
                                <span className="flex items-center gap-1.5 opacity-60">
                                    <Calendar className="w-3.5 h-3.5 text-primary" />
                                    {new Date(match.date).toLocaleDateString()} • {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => startEdit(match)}
                                        className="flex items-center gap-1.5 text-primary/80 hover:text-primary transition-colors font-bold uppercase tracking-widest"
                                    >
                                        <Edit2 className="w-3 h-3" /> Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(match.id)}
                                        className="flex items-center gap-1.5 text-red-500/60 hover:text-red-500 transition-colors font-bold uppercase tracking-widest"
                                    >
                                        <Trash2 className="w-3 h-3" /> Borrar
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
