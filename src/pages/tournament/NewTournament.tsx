import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight, Sparkles } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { usePlayers } from '../../hooks/usePlayers';
import { useTournaments } from '../../hooks/useTournaments';
import { useSession } from '../../context/SessionContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CinematicDraw } from '../../components/tournament/CinematicDraw';
import type { Player } from '../../types';

interface NewTournamentProps {
    currentUser: Player;
}

export function NewTournament({ currentUser }: NewTournamentProps) {
    const navigate = useNavigate();
    const { players } = usePlayers();
    const { createTournament, generateLeagueFixtures, generateKnockoutFixtures, updateTournament } = useTournaments();
    const { session, isSessionActive } = useSession();

    const [name, setName] = useState('');
    const [type, setType] = useState<'league' | 'knockout'>('league');
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>(() => {
        return isSessionActive && session ? session.playersPresent : [];
    });
    const [showDraw, setShowDraw] = useState(false);

    const availablePlayers = isSessionActive && session
        ? players.filter(p => session.playersPresent.includes(p.id))
        : players;

    const selectedParticipants = players.filter(p => selectedPlayers.includes(p.id));

    const togglePlayer = (id: string) => {
        if (selectedPlayers.includes(id)) {
            setSelectedPlayers(prev => prev.filter(pId => pId !== id));
        } else {
            setSelectedPlayers(prev => [...prev, id]);
        }
    };

    const generateFixtures = useCallback((playerIds: string[]) => {
        return type === 'league'
            ? generateLeagueFixtures(playerIds)
            : generateKnockoutFixtures(playerIds);
    }, [type, generateLeagueFixtures, generateKnockoutFixtures]);

    const handleDrawConfirm = async (fixtures: { team1: string[]; team2: string[] }[]) => {
        try {
            const newTournament = await createTournament(name, type, selectedPlayers, currentUser.id);
            // Store fixtures on the tournament
            await updateTournament(newTournament.id, { fixtures });
            navigate(`/tournament/${newTournament.id}`, {
                state: { tournament: { ...newTournament, fixtures } }
            });
        } catch (error) {
            console.error('Error creating tournament:', error);
            alert('Error al crear el torneo');
        }
    };

    const handleQuickCreate = async () => {
        if (!name || selectedPlayers.length < 2) return;
        try {
            const newTournament = await createTournament(name, type, selectedPlayers, currentUser.id);
            navigate(`/tournament/${newTournament.id}`, {
                state: { tournament: newTournament }
            });
        } catch (error) {
            console.error('Error creating tournament:', error);
            alert('Error al crear el torneo');
        }
    };

    const canCreate = name.trim() && selectedPlayers.length >= 2;

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
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-bold text-sm truncate">{player.name}</span>
                                {player.id === currentUser.id && (
                                    <span className="text-[9px] text-yellow-500 uppercase font-black tracking-wider flex items-center gap-1">
                                        Organizador
                                    </span>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
                {availablePlayers.length === 0 && (
                    <p className="text-sm text-center text-gray-500 py-4">No hay jugadores en la sesión.</p>
                )}
            </div>

            {/* Two creation modes */}
            <div className="space-y-3">
                <Button
                    size="lg"
                    glow
                    className="w-full"
                    disabled={!canCreate}
                    onClick={() => setShowDraw(true)}
                >
                    <Sparkles className="w-5 h-5 mr-2" /> SORTEO CINEMATOGRÁFICO
                </Button>
                <Button
                    size="lg"
                    variant="ghost"
                    className="w-full"
                    disabled={!canCreate}
                    onClick={handleQuickCreate}
                >
                    CREAR RÁPIDO <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
            </div>

            {/* Cinematic Draw Overlay */}
            <AnimatePresence>
                {showDraw && canCreate && (
                    <CinematicDraw
                        participants={selectedParticipants}
                        tournamentName={name}
                        tournamentType={type}
                        generateFixtures={generateFixtures}
                        onConfirm={handleDrawConfirm}
                        onCancel={() => setShowDraw(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
