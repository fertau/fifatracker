import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Calendar, Trophy } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

export function MatchHistory() {
    const navigate = useNavigate();
    const { matches, deleteMatch, getPlayer } = useData();

    // Sort matches by date descending
    const sortedMatches = [...matches].sort((a, b) => b.date - a.date);

    const handleDelete = (id: string) => {
        // In a real app we'd confirm with a dialog
        if (confirm('¿Estás seguro de eliminar este partido? Se revertirán las estadísticas.')) {
            deleteMatch(id);
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

                    // Determine winner styling
                    const score1 = match.score.team1;
                    const score2 = match.score.team2;
                    let resultInfo = '';

                    if (match.endedBy === 'penalties') resultInfo = ' (Penales)';
                    if (match.endedBy === 'forfeit') resultInfo = ' (Abandono)';

                    return (
                        <Card key={match.id} glass={false} className="relative overflow-hidden group">
                            <div className="p-4 grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                                {/* Team 1 */}
                                <div className="text-right">
                                    <span className={cn("font-bold block truncate", score1 > score2 ? "text-neon-blue" : "text-gray-400")}>
                                        {team1Names}
                                    </span>
                                </div>

                                {/* Score */}
                                <div className="flex flex-col items-center">
                                    <div className="bg-black/40 px-3 py-1 rounded-lg border border-white/10 font-mono font-bold text-xl tracking-widest">
                                        {score1} - {score2}
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

                            {/* Metadata Footer */}
                            <div className="bg-black/20 px-4 py-2 flex justify-between items-center text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(match.date).toLocaleDateString()}
                                </span>

                                <button
                                    onClick={() => handleDelete(match.id)}
                                    className="flex items-center gap-1 text-red-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-3 h-3" /> Eliminar
                                </button>
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
        </div>
    );
}
