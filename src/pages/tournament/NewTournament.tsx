import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';
import { usePlayers } from '../../hooks/usePlayers';
import { useTournaments } from '../../hooks/useTournaments';
import { useSession } from '../../context/SessionContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function NewTournament() {
    const navigate = useNavigate();
    const { players } = usePlayers();
    const { createTournament } = useTournaments();
    const { session, isSessionActive } = useSession();

    const [name, setName] = useState('');
    const [type, setType] = useState<'league' | 'knockout'>('league');
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

    // Filter players based on active session
    const availablePlayers = isSessionActive && session
        ? players.filter(p => session.playersPresent.includes(p.id))
        : players;

    const togglePlayer = (id: string) => {
        if (selectedPlayers.includes(id)) {
            setSelectedPlayers(prev => prev.filter(pId => pId !== id));
        } else {
            setSelectedPlayers(prev => [...prev, id]);
        }
    };

    const handleCreate = () => {
        if (!name || selectedPlayers.length < 2) return;
        const newTournament = createTournament(name, type, selectedPlayers);
        navigate(`/tournament/${newTournament.id}`);
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    Nuevo Torneo
                </h2>
                <p className="text-sm text-gray-400">Configura tu campeonato</p>
            </div>

            <Card className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Torneo</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary outline-none transition-colors"
                        placeholder="Ej. Copa Mundialito"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Formato</label>
                    <div className="grid grid-cols-2 gap-3">
                        <div
                            onClick={() => setType('league')}
                            className={`p-3 rounded-xl border border-white/10 cursor-pointer transition-all ${type === 'league' ? 'bg-primary/20 border-primary' : 'bg-black/20 hover:bg-white/5'}`}
                        >
                            <div className="font-bold text-primary mb-1">LIGA</div>
                            <div className="text-xs text-gray-400">Todos contra todos. Quien suma más puntos gana.</div>
                        </div>
                        <div
                            onClick={() => setType('knockout')}
                            className={`p-3 rounded-xl border border-white/10 cursor-pointer transition-all ${type === 'knockout' ? 'bg-accent/20 border-accent' : 'bg-black/20 hover:bg-white/5'}`}
                        >
                            <div className="font-bold text-accent mb-1">ELIMINATORIA</div>
                            <div className="text-xs text-gray-400">El que pierde se va a casa. Bracket clásico.</div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2">
                    <Users className="w-4 h-4" /> Seleccionar Jugadores ({selectedPlayers.length})
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {availablePlayers.map(player => (
                        <Card
                            key={player.id}
                            className={`p-3 flex items-center gap-3 cursor-pointer transition-all ${selectedPlayers.includes(player.id) ? 'border-primary bg-primary/10' : 'opacity-80'}`}
                            onClick={() => togglePlayer(player.id)}
                            glass={false}
                        >
                            <span className="text-2xl">{player.avatar}</span>
                            <span className="font-bold text-sm truncate">{player.name}</span>
                        </Card>
                    ))}
                </div>
                {availablePlayers.length === 0 && (
                    <p className="text-sm text-center text-gray-500 py-4">No hay jugadores en la sesión.</p>
                )}
            </div>

            <Button
                size="lg"
                glow
                className="w-full"
                disabled={!name || selectedPlayers.length < 2}
                onClick={handleCreate}
            >
                CREAR TORNEO <ArrowRight className="w-5 h-5" />
            </Button>
        </div>
    );
}
