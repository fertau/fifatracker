import { useParams, Link } from 'react-router-dom';
import { Trophy, Users, ArrowLeft } from 'lucide-react';
import { useTournaments } from '../../hooks/useTournaments';
import { usePlayers } from '../../hooks/usePlayers';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function TournamentDetails() {
    const { id } = useParams<{ id: string }>();
    const { tournaments } = useTournaments();
    const { players } = usePlayers();

    const tournament = tournaments.find(t => t.id === id);

    if (!tournament) {
        return <div className="text-center p-10 text-gray-500">Torneo no encontrado</div>;
    }

    // Helper to get player details
    const getPlayer = (id: string) => players.find(p => p.id === id);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link to="/">
                    <Button variant="ghost" size="sm" className="p-2"><ArrowLeft /></Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        {tournament.name}
                    </h2>
                    <div className="flex gap-3 text-xs text-gray-400 uppercase font-bold">
                        <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> {tournament.type === 'league' ? 'LIGA' : 'ELIMINATORIA'}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {tournament.participants.length} JUGADORES</span>
                    </div>
                </div>
            </div>

            {tournament.type === 'league' ? (
                <Card className="overflow-hidden p-0">
                    <div className="bg-white/5 p-3 text-center font-bold text-sm tracking-widest text-primary border-b border-white/5">
                        TABLA DE POSICIONES
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 border-b border-white/5">
                                <th className="p-3 text-left">Jugador</th>
                                <th className="p-3">PJ</th>
                                <th className="p-3 text-primary font-bold">PTS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {tournament.participants.map((playerId, index) => {
                                const player = getPlayer(playerId);
                                if (!player) return null;
                                // Mock points for now
                                const pts = Math.floor(Math.random() * 10);

                                return (
                                    <tr key={playerId} className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 flex items-center gap-2">
                                            <span className="text-gray-500 font-mono w-4">{index + 1}</span>
                                            <span>{player.avatar} {player.name}</span>
                                        </td>
                                        <td className="p-3 text-center text-gray-400">0</td>
                                        <td className="p-3 text-center font-bold text-lg text-neon-blue">{pts}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Card>
            ) : (
                <Card className="p-6 text-center space-y-4">
                    <Trophy className="w-12 h-12 text-gray-600 mx-auto" />
                    <p className="text-gray-400">El cuadro de eliminatorias estará disponible pronto.</p>
                </Card>
            )}

            <div className="space-y-4">
                <h3 className="uppercase text-xs font-bold text-gray-500 tracking-widest">Próximos Partidos</h3>
                <Card glass className="p-4 text-center text-gray-500 text-sm">
                    No hay partidos programados
                </Card>
            </div>
        </div>
    );
}
