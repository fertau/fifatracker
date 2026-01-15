import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Calendar, Trophy, Edit2, AlertTriangle, X, Save, Clock } from 'lucide-react';
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

    // Edit Form State
    const [editScore1, setEditScore1] = useState(0);
    const [editScore2, setEditScore2] = useState(0);
    const [editDate, setEditDate] = useState('');

    // Sort matches by date descending
    const sortedMatches = [...matches].sort((a, b) => b.date - a.date);

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
        setEditDate(d.toISOString().slice(0, 16)); // Format for datetime-local
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
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        Historial
                    </h2>
                    <p className="text-sm text-gray-400">Últimos partidos registrados</p>
                </div>
            </div>

            <div className="space-y-4">
                {sortedMatches.length > 0 ? sortedMatches.map(match => {
                    const team1Names = match.players.team1.map(id => getPlayer(id)?.name).join(', ');
                    const team2Names = match.players.team2.map(id => getPlayer(id)?.name).join(', ');

                    const score1 = match.score.team1;
                    const score2 = match.score.team2;
                    let resultInfo = '';

                    if (match.endedBy === 'penalties') resultInfo = ' (Penales)';
                    if (match.endedBy === 'forfeit') resultInfo = ' (Abandono)';

                    return (
                        <Card key={match.id} glass={false} className="relative overflow-hidden group border-white/5">
                            <div className="p-4 grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                                {/* Team 1 */}
                                <div className="text-right">
                                    <span className={cn("font-bold block truncate", score1 > score2 ? "text-neon-blue" : "text-gray-400")}>
                                        {team1Names}
                                    </span>
                                </div>

                                {/* Score */}
                                <div className="flex flex-col items-center">
                                    <div className="bg-black/40 px-3 py-1 rounded-lg border border-white/10 font-mono font-bold text-xl tracking-widest relative">
                                        {score1} - {score2}
                                        {match.edits && match.edits.length > 0 && (
                                            <button
                                                onClick={() => setShowAuditFor(showAuditFor === match.id ? null : match.id)}
                                                className="absolute -top-2 -right-2 bg-yellow-500 text-black p-0.5 rounded-full hover:scale-110 transition-transform shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                                            >
                                                <AlertTriangle className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wider">
                                        {match.type} {resultInfo}
                                    </span>
                                </div>

                                {/* Team 2 */}
                                <div className="text-left">
                                    <span className={cn("font-bold block truncate", score2 > score1 ? "text-accent" : "text-gray-400")}>
                                        {team2Names}
                                    </span>
                                </div>
                            </div>

                            {/* Audit Log Overlay */}
                            {showAuditFor === match.id && match.edits && (
                                <div className="px-4 py-3 bg-yellow-500/10 border-t border-yellow-500/20 text-[10px] space-y-2 animate-in slide-in-from-top-2">
                                    <div className="flex items-center gap-1 text-yellow-500 font-bold uppercase tracking-wider">
                                        <Clock className="w-3 h-3" /> Historial de Modificaciones
                                    </div>
                                    {match.edits.map((edit, idx) => (
                                        <div key={idx} className="bg-black/30 p-2 rounded border border-yellow-500/10">
                                            <div className="flex justify-between font-bold text-gray-300 mb-1">
                                                <span>Modificado por: {edit.userName}</span>
                                                <span>{new Date(edit.timestamp).toLocaleString()}</span>
                                            </div>
                                            <p className="text-gray-500">{edit.changes}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Metadata Footer */}
                            <div className="bg-black/20 px-4 py-2 flex justify-between items-center text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(match.date).toLocaleDateString()} {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => startEdit(match)}
                                        className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
                                    >
                                        <Edit2 className="w-3 h-3" /> Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(match.id)}
                                        className="flex items-center gap-1 text-red-500 hover:text-red-400 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-3 h-3" /> Eliminar
                                    </button>
                                </div>
                            </div>
                        </Card>
                    );
                }) : (
                    <div className="text-center py-10 opacity-50 space-y-4">
                        <Trophy className="w-16 h-16 mx-auto text-gray-600" />
                        <p>No hay partidos registrados aún.</p>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingMatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <Card glass className="w-full max-w-sm p-6 space-y-6 border-primary/30">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-primary" /> Editar Partido
                            </h3>
                            <button onClick={() => setEditingMatch(null)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-gray-400">Fecha y Hora</label>
                                <input
                                    type="datetime-local"
                                    className="w-full bg-surface border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none"
                                    value={editDate}
                                    onChange={(e) => setEditDate(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs uppercase font-bold text-neon-blue">Local</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full bg-surface border border-white/10 rounded-lg p-3 text-2xl font-bold text-center focus:border-primary outline-none"
                                        value={editScore1}
                                        onChange={(e) => setEditScore1(parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs uppercase font-bold text-accent">Visitante</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full bg-surface border border-white/10 rounded-lg p-3 text-2xl font-bold text-center focus:border-primary outline-none"
                                        value={editScore2}
                                        onChange={(e) => setEditScore2(parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button variant="ghost" className="flex-1" onClick={() => setEditingMatch(null)}>Cancelar</Button>
                            <Button className="flex-1" glow onClick={handleUpdate}>
                                <Save className="w-4 h-4 mr-2" /> Guardar
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
