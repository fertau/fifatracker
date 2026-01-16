import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Check, Trophy, ArrowLeft, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlayers } from '../../hooks/usePlayers';
import { useSession } from '../../context/SessionContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { Player } from '../../types';

export function SessionSetup({ currentUser }: { currentUser: Player }) {
    const navigate = useNavigate();
    const { getFriendsOf, autoFriendship } = usePlayers();
    const { startSession } = useSession();
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [step, setStep] = useState<1 | 2>(1);

    // Only show friends!
    const myFriends = getFriendsOf(currentUser.id);

    const togglePlayer = (id: string) => {
        if (selectedPlayers.includes(id)) {
            setSelectedPlayers(prev => prev.filter(pId => pId !== id));
        } else {
            setSelectedPlayers(prev => [...prev, id]);
        }
    };

    const handleStartCasual = async () => {
        if (selectedPlayers.length < 1) return;

        // Auto-friendship between host and selected players
        const allInSession = [currentUser.id, ...selectedPlayers];
        await autoFriendship(allInSession);

        startSession(selectedPlayers);
        navigate('/');
    };

    const handleStartTournament = async () => {
        if (selectedPlayers.length < 1) return;

        // Start session first
        const allInSession = [currentUser.id, ...selectedPlayers];
        await autoFriendship(allInSession);
        startSession(selectedPlayers);

        // Then go to tournament create (which is now session-aware)
        navigate('/tournament/new');
    };

    if (step === 2) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold font-heading uppercase tracking-tighter italic">Modalidad de Sesión</h2>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1 italic">Paso final</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <Card
                        glass
                        className="p-6 cursor-pointer border-accent/20 hover:border-accent transition-all group"
                        onClick={handleStartCasual}
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-accent/10 rounded-2xl text-accent group-hover:scale-110 transition-transform">
                                <Play className="w-6 h-6 fill-current" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Sesión Casual</h3>
                                <p className="text-xs text-gray-500">Jueguen partidos rápidos y registren resultados libremente.</p>
                            </div>
                        </div>
                    </Card>

                    <Card
                        glass
                        className="p-6 cursor-pointer border-yellow-500/20 hover:border-yellow-500 transition-all group"
                        onClick={handleStartTournament}
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500 group-hover:scale-110 transition-transform">
                                <Trophy className="w-6 h-6 fill-current" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Torneo / Liga</h3>
                                <p className="text-xs text-gray-500">Organicen un campeonato serio con los jugadores elegidos.</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-3">Jugadores confirmados ({selectedPlayers.length + 1})</label>
                    <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-[10px] font-bold">
                            <span>{currentUser.avatar}</span> {currentUser.name} (Tú)
                        </div>
                        {selectedPlayers.map(id => {
                            const p = myFriends.find(f => f.id === id);
                            return p && (
                                <div key={id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400">
                                    <span>{p.avatar}</span> {p.name}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-left-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent uppercase tracking-tighter italic">
                        ¿Quiénes juegan hoy?
                    </h2>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest italic">Selecciona a tus competidores</p>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                    <Users className="w-5 h-5 text-gray-400" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {myFriends.length > 0 ? myFriends.map(player => {
                    const isSelected = selectedPlayers.includes(player.id);
                    return (
                        <Card
                            key={player.id}
                            className={`p-3 flex items-center gap-3 cursor-pointer transition-all border-2 ${isSelected ? 'border-primary bg-primary/10' : 'border-white/5 opacity-60 grayscale'}`}
                            onClick={() => togglePlayer(player.id)}
                            glass={false}
                        >
                            <div className="relative">
                                <span className="text-3xl drop-shadow-lg">{player.avatar}</span>
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 bg-primary text-black rounded-full p-0.5"
                                    >
                                        <Check className="w-3 h-3" />
                                    </motion.div>
                                )}
                            </div>
                            <span className={`font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                {player.name}
                            </span>
                        </Card>
                    );
                }) : (
                    <div className="col-span-2 text-center py-10 text-gray-500 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                        <Users className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-bold opacity-50 px-6">Para crear una sesión necesitas tener amigos agregados.</p>
                        <Button variant="ghost" className="mt-4 text-primary text-[10px] font-black uppercase tracking-widest" onClick={() => navigate('/friends')}>
                            Gestionar Amigos
                        </Button>
                    </div>
                )}
            </div>

            <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
                <Button
                    size="lg"
                    glow
                    className="w-full shadow-2xl h-14 rounded-2xl font-black uppercase tracking-[0.1em]"
                    disabled={selectedPlayers.length < 1}
                    onClick={() => setStep(2)}
                >
                    CONTINUAR ({selectedPlayers.length})
                </Button>
            </div>
        </div>
    );
}
