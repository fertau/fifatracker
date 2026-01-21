import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, LogOut, ArrowLeft, Camera, User, Lock, X, TrendingUp } from 'lucide-react';
import { usePlayers } from '../../hooks/usePlayers';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PhotoCapture } from '../../components/PhotoCapture';

import { useData } from '../../context/DataContext';
import { ACHIEVEMENTS, calculateUnlockedAchievements } from '../../lib/achievements';
import { getLanguage, setLanguage } from '../../lib/i18n';
import type { Player } from '../../types';

interface ProfilePageProps {
    player: Player;
    onLogout: () => void;
}

export function ProfilePage({ player, onLogout }: ProfilePageProps) {
    const { deletePlayer, updatePlayer } = usePlayers();
    const navigate = useNavigate();
    const [showPhotoCapture, setShowPhotoCapture] = useState(false);
    const { matches } = useData();
    const unlockedIds = calculateUnlockedAchievements(player, matches);
    const unlockedAchievements = ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id));

    const [showPinChange, setShowPinChange] = useState(false);
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [pinError, setPinError] = useState('');

    const handleDelete = async () => {
        if (confirm(`¿Estás seguro de que quieres eliminar permanentemente a ${player.name}? Esta acción no se puede deshacer.`)) {
            try {
                await deletePlayer(player.id);
                onLogout();
                navigate('/');
            } catch (error) {
                alert('Error al eliminar el jugador.');
            }
        }
    };

    const handlePhotoSelected = async (url: string) => {
        try {
            await updatePlayer(player.id, { photoURL: url });
            setShowPhotoCapture(false);
        } catch (error) {
            console.error('Error updating photo:', error);
            alert('No se pudo actualizar la foto de perfil.');
        }
    };

    const handlePinChange = async () => {
        setPinError('');

        if (currentPin !== player.pin) {
            setPinError('PIN actual incorrecto');
            return;
        }

        if (newPin.length < 4) {
            setPinError('El nuevo PIN debe tener al menos 4 dígitos');
            return;
        }

        if (newPin !== confirmPin) {
            setPinError('Los PINs no coinciden');
            return;
        }

        try {
            await updatePlayer(player.id, { pin: newPin });
            setShowPinChange(false);
            setCurrentPin('');
            setNewPin('');
            setConfirmPin('');
            alert('PIN actualizado correctamente');
        } catch (error) {
            console.error('Error updating PIN:', error);
            setPinError('No se pudo actualizar el PIN');
        }
    };

    return (
        <div className="space-y-6 max-w-md mx-auto pb-20">
            {/* Custom Header with Username */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="p-2">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold font-heading truncate max-w-[150px]">
                            {player.name}
                        </h2>
                    </div>
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                    Perfil
                </span>
            </div>

            <Card glass className="text-center p-8 space-y-6 relative overflow-hidden border-primary/20">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-30" />

                <div className="flex flex-col items-center gap-4">
                    <div className="relative group mx-auto w-32 h-32">
                        <div
                            className="w-full h-full rounded-full overflow-hidden border-4 border-primary/50 shadow-[0_0_30px_rgba(var(--color-primary),0.3)] cursor-pointer hover:border-primary transition-all duration-300"
                            onClick={() => setShowPhotoCapture(true)}
                        >
                            {player.photoURL ? (
                                <img
                                    src={player.photoURL}
                                    alt={player.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-surface flex items-center justify-center text-7xl drop-shadow-glow">
                                    {player.avatar}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowPhotoCapture(true)}
                            className="absolute bottom-0 right-0 p-2 bg-primary rounded-full shadow-lg border-2 border-background text-white hover:scale-110 transition-transform"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="text-[10px] text-primary font-black uppercase tracking-[0.2em] animate-pulse">
                        Toca para cambiar foto
                    </div>
                </div>

                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tighter font-heading italic uppercase">{player.name}</h1>
                </div>

                {/* Achievements Section */}
                {unlockedAchievements.length > 0 && (
                    <div className="pt-6 border-t border-white/5 space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Logros Desbloqueados</h3>
                            <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                {unlockedAchievements.length} / {ACHIEVEMENTS.length}
                            </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {ACHIEVEMENTS.map(achievement => {
                                const isUnlocked = unlockedIds.includes(achievement.id);
                                return (
                                    <div
                                        key={achievement.id}
                                        className={`group relative aspect-square rounded-2xl border flex items-center justify-center text-2xl transition-all duration-300 ${isUnlocked
                                            ? `bg-gradient-to-br ${achievement.color} border-white/20 shadow-lg scale-100`
                                            : 'bg-white/5 border-white/5 opacity-20 grayscale scale-90'
                                            }`}
                                        title={achievement.name}
                                    >
                                        {achievement.icon}
                                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-32 bg-black/90 border border-white/10 p-2 rounded-xl text-[8px] uppercase font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center">
                                            <p className="text-white mb-0.5">{achievement.name}</p>
                                            <p className="text-gray-500 leading-tight">{achievement.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* PIN Section */}
                <div className="pt-6 border-t border-white/5 space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <Lock className="w-4 h-4 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Seguridad</h3>
                    </div>
                    <Button
                        variant="secondary"
                        className="w-full rounded-2xl py-4 font-bold tracking-widest uppercase text-xs"
                        onClick={() => setShowPinChange(true)}
                    >
                        <Lock className="w-4 h-4 mr-2" /> Cambiar PIN
                    </Button>
                </div>

                {/* Language Section */}
                <div className="pt-6 border-t border-white/5 space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Preferencia de Idioma</h3>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={getLanguage() === 'es' ? 'primary' : 'secondary'}
                            className="flex-1 rounded-2xl py-4 font-bold text-xs"
                            onClick={() => setLanguage('es')}
                        >
                            Español
                        </Button>
                        <Button
                            variant={getLanguage() === 'en' ? 'primary' : 'secondary'}
                            className="flex-1 rounded-2xl py-4 font-bold text-xs"
                            onClick={() => setLanguage('en')}
                        >
                            English
                        </Button>
                    </div>
                </div>

                {/* Main Actions */}
                <div className="pt-6 border-t border-white/5 space-y-3">
                    <Button
                        variant="secondary"
                        className="w-full rounded-2xl py-6 font-bold tracking-widest uppercase text-xs"
                        onClick={onLogout}
                    >
                        <LogOut className="w-4 h-4 mr-2" /> Cambiar de Perfil
                    </Button>

                    <Button
                        variant="ghost"
                        className="w-full text-red-500/70 hover:text-red-500 hover:bg-red-500/10 border border-red-500/10 rounded-2xl text-xs font-bold tracking-widest"
                        onClick={handleDelete}
                    >
                        <Trash2 className="w-4 h-4 mr-2" /> ELIMINAR CUENTA
                    </Button>
                </div>
            </Card>

            {showPhotoCapture && (
                <PhotoCapture
                    onPhotoSelected={handlePhotoSelected}
                    onCancel={() => setShowPhotoCapture(false)}
                    currentPhoto={player.photoURL}
                />
            )}

            {showPinChange && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPinChange(false)}>
                    <Card glass className="max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Lock className="w-5 h-5 text-primary" />
                                <h3 className="text-xl font-bold font-heading">Cambiar PIN</h3>
                            </div>
                            <button onClick={() => setShowPinChange(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-2">PIN Actual</label>
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={currentPin}
                                    onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-surface border border-white/10 rounded-lg p-3 text-center text-2xl tracking-[0.5em] font-mono focus:border-primary outline-none"
                                    placeholder="••••"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-2">Nuevo PIN</label>
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={newPin}
                                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-surface border border-white/10 rounded-lg p-3 text-center text-2xl tracking-[0.5em] font-mono focus:border-primary outline-none"
                                    placeholder="••••"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-2">Confirmar PIN</label>
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-surface border border-white/10 rounded-lg p-3 text-center text-2xl tracking-[0.5em] font-mono focus:border-primary outline-none"
                                    placeholder="••••"
                                />
                            </div>

                            {pinError && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm text-center">
                                    {pinError}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button variant="ghost" className="flex-1" onClick={() => setShowPinChange(false)}>
                                Cancelar
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handlePinChange}
                                disabled={!currentPin || !newPin || !confirmPin}
                            >
                                Guardar
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
