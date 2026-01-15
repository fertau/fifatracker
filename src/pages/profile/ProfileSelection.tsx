import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { usePlayers } from '../../hooks/usePlayers';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';
import type { Player } from '../../types';

interface ProfileSelectionProps {
    onSelect: (player: Player) => void;
}

export function ProfileSelection({ onSelect }: ProfileSelectionProps) {
    const { players, loading, createPlayer } = usePlayers();
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('🦁');
    const { setTheme } = useTheme();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        const player = await createPlayer(newName, selectedAvatar);
        setTheme(player.themePreference);
        onSelect(player);
    };

    const AVATARS = ['🦁', '🚀', '🦖', '⚽', '🎮', '🔥', '💎', '👻'];

    if (loading) return <div className="flex h-screen items-center justify-center text-primary animate-pulse">Cargando Jugadores...</div>;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            <AnimatePresence mode="wait">
                {!isCreating ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-md space-y-8"
                    >
                        <div className="text-center space-y-2">
                            <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                                ¿QUIÉN JUEGA?
                            </h1>
                            <p className="text-gray-400">Selecciona tu perfil</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {players.map((player) => (
                                <Card
                                    key={player.id}
                                    glass
                                    className="cursor-pointer group hover:border-primary transition-all flex flex-col items-center gap-3 py-6"
                                    onClick={() => {
                                        setTheme(player.themePreference);
                                        onSelect(player);
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <div className="text-5xl drop-shadow-[0_0_10px_rgba(var(--color-primary),0.5)]">
                                        {player.avatar}
                                    </div>
                                    <span className="font-heading text-xl font-bold tracking-wide group-hover:text-primary transition-colors">
                                        {player.name}
                                    </span>
                                </Card>
                            ))}

                            <Card
                                glass={false}
                                className="cursor-pointer border-dashed border-2 border-white/10 hover:border-primary/50 flex flex-col items-center justify-center gap-3 py-6 text-gray-500 hover:text-white transition-all bg-transparent"
                                onClick={() => setIsCreating(true)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <span className="font-heading font-bold text-sm">NUEVO JUGADOR</span>
                            </Card>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-md"
                    >
                        <Card className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                                    NUEVO PERFIL
                                </h2>
                                <p className="text-sm text-gray-400">Elige tu nombre y avatar</p>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Nombre</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-center font-heading text-lg font-bold placeholder-white/10"
                                        placeholder="Tu nick"
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Avatar</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {AVATARS.map(emoji => (
                                            <button
                                                type="button"
                                                key={emoji}
                                                onClick={() => setSelectedAvatar(emoji)}
                                                className={`text-2xl p-3 rounded-xl transition-all ${selectedAvatar === emoji ? 'bg-primary/20 ring-2 ring-primary scale-110' : 'bg-white/5 hover:bg-white/10'}`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsCreating(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" glow className="flex-1">
                                        CREAR
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
