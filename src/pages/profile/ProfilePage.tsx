import { useNavigate } from 'react-router-dom';
import { Trash2, LogOut, ArrowLeft } from 'lucide-react';
import { usePlayers } from '../../hooks/usePlayers';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import type { Player } from '../../types';

interface ProfilePageProps {
    player: Player;
    onLogout: () => void;
}

export function ProfilePage({ player, onLogout }: ProfilePageProps) {
    const { deletePlayer } = usePlayers();
    const navigate = useNavigate();

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

    return (
        <div className="space-y-6 max-w-md mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                </Button>
            </div>

            <Card glass className="text-center p-8 space-y-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />

                <div className="relative">
                    {player.photoURL ? (
                        <img
                            src={player.photoURL}
                            alt={player.name}
                            className="w-32 h-32 rounded-full mx-auto border-4 border-primary/50 shadow-[0_0_20px_rgba(var(--color-primary),0.3)]"
                        />
                    ) : (
                        <div className="text-8xl mb-4 drop-shadow-glow">
                            {player.avatar}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">{player.name}</h2>
                    <p className="text-gray-400 text-sm uppercase tracking-widest">Perfil de Jugador</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="text-2xl font-bold text-primary">{player.stats.matchesPlayed}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Partidos</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="text-2xl font-bold text-accent">{player.stats.wins}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Victorias</div>
                    </div>
                </div>

                <div className="space-y-3 pt-6">
                    <Button
                        variant="secondary"
                        className="w-full"
                        onClick={onLogout}
                    >
                        <LogOut className="w-4 h-4 mr-2" /> Cambiar de Perfil
                    </Button>

                    <Button
                        variant="ghost"
                        className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
                        onClick={handleDelete}
                    >
                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar Cuenta Permanente
                    </Button>
                </div>
            </Card>
        </div>
    );
}
