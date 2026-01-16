import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Check, Trophy, ArrowLeft, Users, UserPlus, X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { usePlayers } from '../../hooks/usePlayers';
import { useSession } from '../../context/SessionContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { Player } from '../../types';

export function SessionSetup({ currentUser }: { currentUser: Player }) {
    const navigate = useNavigate();
    const { getFriendsOf, autoFriendship, createPlayer } = usePlayers();
    const { startSession } = useSession();

    // Selection State
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [step, setStep] = useState<1 | 2>(1);

    // Quick Add Modal State
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPin, setNewPin] = useState('');
    const [newAvatar] = useState('⚽');
    const [creating, setCreating] = useState(false);

    // Only show friends!
    const myFriends = getFriendsOf(currentUser.id);

    const togglePlayer = (id: string) => {
        if (selectedPlayers.includes(id)) {
            setSelectedPlayers(prev => prev.filter(pId => pId !== id));
        } else {
            setSelectedPlayers(prev => [...prev, id]);
        }
    };

    const handleQuickRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newPin || creating) return;

        setCreating(true);
        try {
            const player = await createPlayer(newName, newAvatar, undefined, newPin);

            // Auto friendship with host
            await autoFriendship([currentUser.id, player.id]);

            // Select automatically
            setSelectedPlayers(prev => [...prev, player.id]);

            // Reset and close
            setNewName('');
            setNewPin('');
            setShowQuickAdd(false);
        } catch (error) {
            alert('Error al registrar jugador');
        } finally {
            setCreating(false);
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
                        <h2 className="text-2xl font-bold font-heading uppercase tracking-tighter italic text-white">Modalidad de Sesión</h2>
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
                                <h3 className="font-bold text-lg text-white">Sesión Casual</h3>
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
                                <h3 className="font-bold text-lg text-white">Torneo / Liga</h3>
                                <p className="text-xs text-gray-500">Organicen un campeonato serio con los jugadores elegidos.</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em] block mb-4 ml-1">Escuadrón Confirmado ({selectedPlayers.length + 1})</label>
                    <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-[11px] font-black uppercase tracking-widest text-primary">
                            <span>{currentUser.avatar}</span> {currentUser.name}
                        </div>
                        {selectedPlayers.map(id => {
                            const p = [...myFriends].find(f => f.id === id) || { name: 'Registrado', avatar: '👤' };
                            return (
                                <div key={id} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-gray-400 capitalize">
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
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest italic">Selecciona o invita a tus competidores</p>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/5 group relative">
                    <Users className="w-5 h-5 text-gray-400" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {/* Friends Cards */}
                {myFriends.map(player => {
                    const isSelected = selectedPlayers.includes(player.id);
                    return (
                        <Card
                            key={player.id}
                            className={cn(
                                "p-3 flex items-center gap-3 cursor-pointer transition-all border-2 relative overflow-hidden",
                                isSelected ? "border-primary bg-primary/10 shadow-[inner_0_0_10px_rgba(var(--color-primary),0.1)]" : "border-white/5 opacity-60 grayscale-[0.8]"
                            )}
                            onClick={() => togglePlayer(player.id)}
                            glass={false}
                        >
                            <div className="relative z-10">
                                <span className="text-3xl drop-shadow-lg">{player.avatar}</span>
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -bottom-1 -right-1 bg-primary text-black rounded-full p-0.5 border border-background shadow-lg"
                                    >
                                        <Check className="w-2 h-2" />
                                    </motion.div>
                                )}
                            </div>
                            <span className={cn(
                                "font-bold text-xs truncate relative z-10 transition-colors",
                                isSelected ? "text-white" : "text-gray-400"
                            )}>
                                {player.name}
                            </span>
                        </Card>
                    );
                })}

                {/* Quick Add Card */}
                <Card
                    onClick={() => setShowQuickAdd(true)}
                    className="p-3 flex items-center gap-3 cursor-pointer border-2 border-dashed border-white/10 hover:border-accent hover:bg-accent/5 transition-all text-accent group"
                    glass={false}
                >
                    <div className="w-9 h-9 flex items-center justify-center bg-accent/10 rounded-full border border-accent/20 group-hover:scale-110 transition-transform">
                        <UserPlus className="w-5 h-5" />
                    </div>
                    <span className="font-black text-[10px] uppercase tracking-widest opacity-70 group-hover:opacity-100 italic">Invitar</span>
                </Card>
            </div>

            {/* Quick Add Modal */}
            <AnimatePresence>
                {showQuickAdd && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl"
                    >
                        <Card glass className="w-full max-w-sm p-8 space-y-6 border-accent/30 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                            {/* Decorative Icon */}
                            <div className="absolute -top-10 -right-10 opacity-5">
                                <UserPlus className="w-40 h-40" />
                            </div>

                            <div className="flex justify-between items-start relative z-10">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-bold font-heading italic uppercase tracking-tighter text-white">Invitación Express</h3>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Registra a un amigo en el acto</p>
                                </div>
                                <button
                                    onClick={() => setShowQuickAdd(false)}
                                    className="p-2 bg-white/5 rounded-2xl text-gray-400 hover:text-white transition-colors border border-white/5"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleQuickRegister} className="space-y-5 relative z-10">
                                {/* Avatar & Name */}
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center text-4xl shadow-inner shrink-0 cursor-pointer hover:border-accent transition-colors">
                                            {newAvatar}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] ml-1">Nombre / Apodo</label>
                                            <input
                                                type="text"
                                                required
                                                autoFocus
                                                value={newName}
                                                onChange={e => setNewName(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold focus:border-accent outline-none transition-all placeholder:text-gray-700"
                                                placeholder="Ej. El Pistolero"
                                            />
                                        </div>
                                    </div>

                                    {/* PIN Setup */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between px-1">
                                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em]">Crea tu PIN personal</label>
                                            <span className="text-[8px] text-yellow-500/50 italic opacity-60">Requerido para logueo futuro</span>
                                        </div>
                                        <div className="relative">
                                            <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                            <input
                                                type="password"
                                                required
                                                maxLength={6}
                                                pattern="[0-9]*"
                                                inputMode="numeric"
                                                value={newPin}
                                                onChange={e => setNewPin(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-xs font-bold focus:border-accent outline-none transition-all tracking-[0.5em]"
                                                placeholder="••••"
                                            />
                                        </div>
                                        <p className="text-[9px] text-gray-600 px-1 leading-tight">
                                            Este PIN le permitirá a tu amigo entrar a su perfil desde otro dispositivo después de la sesión.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-4">
                                    <Button
                                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-accent/10"
                                        glow
                                        type="submit"
                                        disabled={creating || !newName || !newPin}
                                    >
                                        {creating ? 'Registrando...' : 'CREAR Y AGREGAR'}
                                    </Button>
                                    <p className="text-center text-[8px] text-gray-700 uppercase font-black tracking-widest italic">FIFA TRACKER EXPRESS AUTH</p>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40">
                <Button
                    size="lg"
                    glow
                    className="w-full shadow-2xl h-14 rounded-2xl font-black uppercase tracking-[0.1em] border-t border-white/10"
                    disabled={selectedPlayers.length < 1}
                    onClick={() => setStep(2)}
                >
                    CONTINUAR ({selectedPlayers.length})
                </Button>
            </div>
        </div>
    );
}
