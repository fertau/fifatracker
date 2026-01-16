import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, LogOut, ArrowLeft, Camera, User, Palette, CheckCircle2 } from 'lucide-react';
import { usePlayers } from '../../hooks/usePlayers';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PhotoCapture } from '../../components/PhotoCapture';
import { cn } from '../../lib/utils';
import type { Player } from '../../types';

interface ProfilePageProps {
    player: Player;
    onLogout: () => void;
}

export function ProfilePage({ player, onLogout }: ProfilePageProps) {
    const { deletePlayer, updatePlayer } = usePlayers();
    const { theme: currentTheme, setTheme } = useTheme();
    const navigate = useNavigate();
    const [showPhotoCapture, setShowPhotoCapture] = useState(false);

    const themes = [
        { id: 'default', name: 'Ultimate Neon', colors: ['#00f3ff', '#b026ff'], description: 'El estilo clásico de FIFA.', badge: 'Original' },
        { id: 'carbon', name: 'Carbon Elite', colors: ['#ffffff', '#969696'], description: 'Elegancia y sigilo minimalista.', badge: 'Premium' },
        { id: 'volcanic', name: 'Volcanic Victory', colors: ['#ff3c00', '#ffa500'], description: 'Energía pura y fuego en el campo.', badge: 'Intenso' }
    ];

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

                    <div className="mt-4 text-xs text-primary font-bold uppercase tracking-widest animate-pulse">
                        Toca para cambiar foto
                    </div>
                </div>

                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tighter font-heading italic uppercase">{player.name}</h1>
                </div>

                {/* Theme Selector Section */}
                <div className="pt-6 border-t border-white/5 space-y-4 text-left">
                    <div className="flex items-center gap-2 px-1">
                        <Palette className="w-4 h-4 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Apariencia</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        {themes.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id as any)}
                                className={cn(
                                    "p-3 rounded-2xl border-2 transition-all flex items-center justify-between group",
                                    currentTheme === t.id ? "border-primary bg-primary/5" : "border-white/5 bg-white/[0.01] hover:border-white/20"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-1">
                                        {t.colors.map((c, i) => (
                                            <div key={i} className="w-4 h-4 rounded-full border border-background shadow-sm" style={{ backgroundColor: c }} />
                                        ))}
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <div className="flex items-center gap-2">
                                            <span className={cn("text-xs font-black uppercase tracking-tight", currentTheme === t.id ? "text-primary" : "text-gray-300")}>
                                                {t.name}
                                            </span>
                                            <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded border border-white/5 text-gray-500 font-black tracking-widest uppercase">{t.badge}</span>
                                        </div>
                                        <p className="text-[9px] text-gray-600 font-medium leading-none mt-1">{t.description}</p>
                                    </div>
                                </div>
                                {currentTheme === t.id && (
                                    <CheckCircle2 className="w-4 h-4 text-primary animate-in zoom-in duration-300" />
                                )}
                            </button>
                        ))}
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
        </div>
    );
}
