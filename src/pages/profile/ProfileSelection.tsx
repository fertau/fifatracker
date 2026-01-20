import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Trash2, Lock } from 'lucide-react';
import { usePlayers } from '../../hooks/usePlayers';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PhotoCapture } from '../../components/PhotoCapture';
import { AvatarSelector } from '../../components/profile/AvatarSelector';
import type { Player } from '../../types';

interface ProfileSelectionProps {
    onSelect: (player: Player) => void;
}

export function ProfileSelection({ onSelect }: ProfileSelectionProps) {
    const { players, loading, createPlayer, deletePlayer, updatePlayer } = usePlayers();
    const [isCreating, setIsCreating] = useState(false);
    const [showPhotoCapture, setShowPhotoCapture] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPin, setNewPin] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('🦁');
    const [photoURL, setPhotoURL] = useState<string | undefined>();

    // Login flow
    const [selectedPlayerForLogin, setSelectedPlayerForLogin] = useState<Player | null>(null);
    const [loginPin, setLoginPin] = useState('');
    const [loginError, setLoginError] = useState(false);

    // PIN Setup flow
    const [setupPin, setSetupPin] = useState('');
    const [confirmSetupPin, setConfirmSetupPin] = useState('');

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        if (newPin.length < 4) {
            alert('El PIN debe tener al menos 4 dígitos');
            return;
        }

        try {
            const player = await createPlayer(newName, selectedAvatar, photoURL, newPin);
            onSelect(player);
        } catch (error) {
            console.error('Error creating player:', error);
            alert('Error al crear el jugador. Por favor verifica tu conexión e intenta de nuevo.');
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlayerForLogin) return;

        if (!selectedPlayerForLogin.pin || selectedPlayerForLogin.pin === loginPin) {
            onSelect(selectedPlayerForLogin);
        } else {
            setLoginError(true);
            setLoginPin('');
            setTimeout(() => setLoginError(false), 2000);
        }
    };

    const handlePhotoSelected = (url: string) => {
        setPhotoURL(url);
        setShowPhotoCapture(false);
    };

    const handlePinSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlayerForLogin) return;

        if (setupPin.length < 4) {
            alert('El PIN debe tener al menos 4 dígitos');
            return;
        }

        if (setupPin !== confirmSetupPin) {
            alert('Los PINs no coinciden');
            return;
        }

        try {
            await updatePlayer(selectedPlayerForLogin.id, { pin: setupPin });
            const updated = { ...selectedPlayerForLogin, pin: setupPin };
            onSelect(updated);
        } catch (error) {
            console.error('Error setting PIN:', error);
            alert('Error al guardar el PIN');
        }
    };



    if (loading) return <div className="flex h-screen items-center justify-center text-primary animate-pulse uppercase font-bold tracking-widest">Cargando Jugadores...</div>;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            <AnimatePresence mode="wait">
                {selectedPlayerForLogin ? (
                    <motion.div
                        key="login"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-sm"
                    >
                        <Card className="text-center space-y-6 p-8 border-primary/30">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary shadow-[0_0_20px_rgba(var(--color-primary),0.3)]">
                                    {selectedPlayerForLogin.photoURL ? (
                                        <img src={selectedPlayerForLogin.photoURL} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-white/5 flex items-center justify-center text-4xl">
                                            {selectedPlayerForLogin.avatar}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold font-heading">{selectedPlayerForLogin.name}</h2>
                                    <p className="text-gray-400 text-sm">
                                        {!selectedPlayerForLogin.pin ? 'Configura tu PIN de seguridad' : 'Introduce tu PIN de seguridad'}
                                    </p>
                                </div>
                            </div>

                            {!selectedPlayerForLogin.pin ? (
                                <form onSubmit={handlePinSetup} className="space-y-4">
                                    <div className="space-y-3">
                                        <input
                                            type="password"
                                            inputMode="numeric"
                                            maxLength={6}
                                            value={setupPin}
                                            onChange={(e) => setSetupPin(e.target.value.replace(/\D/g, ''))}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:border-primary transition-colors"
                                            placeholder="PIN"
                                            autoFocus
                                            required
                                        />
                                        <input
                                            type="password"
                                            inputMode="numeric"
                                            maxLength={6}
                                            value={confirmSetupPin}
                                            onChange={(e) => setConfirmSetupPin(e.target.value.replace(/\D/g, ''))}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:border-primary transition-colors"
                                            placeholder="Confirmar"
                                            required
                                        />
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Mínimo 4 dígitos</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button type="button" variant="ghost" className="flex-1" onClick={() => {
                                            setSelectedPlayerForLogin(null);
                                            setSetupPin('');
                                            setConfirmSetupPin('');
                                        }}>
                                            Cancelar
                                        </Button>
                                        <Button type="submit" glow className="flex-1" disabled={setupPin.length < 4 || setupPin !== confirmSetupPin}>
                                            GUARDAR PIN
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="relative">
                                        <input
                                            type="password"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={loginPin}
                                            onChange={(e) => setLoginPin(e.target.value)}
                                            className={`w-full bg-white/5 border-2 rounded-2xl px-4 py-4 text-center text-3xl font-mono tracking-[1em] focus:outline-none transition-all ${loginError ? 'border-red-500 animate-shake' : 'border-white/10 focus:border-primary'}`}
                                            placeholder="****"
                                            autoFocus
                                        />
                                        {loginError && <p className="text-red-500 text-xs mt-2 uppercase font-bold tracking-widest">PIN Incorrecto</p>}
                                    </div>
                                    <div className="flex gap-3">
                                        <Button type="button" variant="ghost" className="flex-1" onClick={() => {
                                            setSelectedPlayerForLogin(null);
                                            setLoginPin('');

                                        }}>
                                            Volver
                                        </Button>
                                        <Button type="submit" glow className="flex-1" disabled={loginPin.length < 4}>
                                            ENTRAR
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </Card>
                    </motion.div>
                ) : !isCreating ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-md space-y-8"
                    >
                        <div className="text-center space-y-2">
                            <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent font-heading tracking-tighter italic uppercase">
                                ¿Quién eres?
                            </h1>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Selecciona tu perfil para entrar</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {players.map((player) => (
                                <Card
                                    key={player.id}
                                    glass
                                    className="cursor-pointer group hover:border-primary transition-all flex flex-col items-center gap-3 py-6 relative border-white/5 bg-white/[0.02]"
                                    onClick={() => setSelectedPlayerForLogin(player)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`¿Eliminar a ${player.name}?`)) {
                                                deletePlayer(player.id);
                                            }
                                        }}
                                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    {player.pin && (
                                        <div className="absolute top-2 left-2 p-1 rounded-full bg-primary/10 text-primary">
                                            <Lock className="w-3 h-3" />
                                        </div>
                                    )}

                                    {player.photoURL ? (
                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30 group-hover:border-primary transition-colors">
                                            <img src={player.photoURL} alt={player.name} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="text-5xl drop-shadow-[0_0_10px_rgba(var(--color-primary),0.3)]">
                                            {player.avatar}
                                        </div>
                                    )}
                                    <span className="font-heading text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
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
                                <span className="font-heading font-bold text-xs uppercase tracking-widest">Nuevo Perfil</span>
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
                        <Card className="space-y-6 p-8 border-accent/20">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold font-heading italic bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent uppercase tracking-tighter">
                                    Nuevo Perfil
                                </h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Configura tu seguridad</p>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-6">
                                <div className="flex flex-col items-center gap-3">
                                    <div
                                        className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 hover:border-primary transition-colors cursor-pointer group shadow-xl"
                                        onClick={() => setShowPhotoCapture(true)}
                                    >
                                        {photoURL ? (
                                            <img src={photoURL} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-white/5 flex items-center justify-center text-4xl">
                                                {selectedAvatar}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Camera className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPhotoCapture(true)}
                                        className="text-[10px] text-primary hover:text-primary/80 transition-colors uppercase font-bold tracking-widest"
                                    >
                                        {photoURL ? 'Cambiar foto' : 'Subir foto'}
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Nickname</label>
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-center font-heading text-xl font-bold placeholder-white/5"
                                            placeholder="Tu nombre aquí"
                                            autoFocus
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">PIN de Seguridad (Requerido)</label>
                                        <input
                                            type="password"
                                            inputMode="numeric"
                                            maxLength={6}
                                            value={newPin}
                                            onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors text-center font-mono text-2xl tracking-[0.5em] placeholder-white/5"
                                            placeholder="****"
                                            required
                                        />
                                        <p className="text-[9px] text-gray-500 text-center italic">Mínimo 4 dígitos para proteger tu perfil.</p>
                                    </div>
                                </div>

                                {!photoURL && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Avatar</label>
                                        <div className="w-full">
                                            <AvatarSelector
                                                selectedAvatar={selectedAvatar}
                                                onSelect={setSelectedAvatar}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsCreating(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" glow className="flex-1" disabled={!newName.trim() || newPin.length < 4}>
                                        CREAR
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {showPhotoCapture && (
                <PhotoCapture
                    onPhotoSelected={handlePhotoSelected}
                    onCancel={() => setShowPhotoCapture(false)}
                    currentPhoto={photoURL}
                />
            )}
        </div>
    );
}
