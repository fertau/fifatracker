import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, LogOut, ArrowLeft, Camera, User } from 'lucide-react';
import { usePlayers } from '../../hooks/usePlayers';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PhotoCapture } from '../../components/PhotoCapture';
import type { Player } from '../../types';

interface ProfilePageProps {
    player: Player;
    onLogout: () => void;
}

export function ProfilePage({ player, onLogout }: ProfilePageProps) {
    const { deletePlayer, updatePlayer } = usePlayers();
    const navigate = useNavigate();
    const [showPhotoCapture, setShowPhotoCapture] = useState(false);

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
