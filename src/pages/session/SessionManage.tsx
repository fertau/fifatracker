import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';
import { usePlayers } from '../../hooks/usePlayers';
import { useSession } from '../../context/SessionContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { Player } from '../../types';

export function SessionManage({ currentUser }: { currentUser: Player }) {
    const navigate = useNavigate();
    const { getFriendsOf } = usePlayers();
    const { session, updateSessionPlayers } = useSession();
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

    // Only show friends!
    const myFriends = getFriendsOf(currentUser.id);

    useEffect(() => {
        if (session) {
            setSelectedPlayers(session.playersPresent);
        }
    }, [session]);

    const togglePlayer = (id: string) => {
        if (selectedPlayers.includes(id)) {
            setSelectedPlayers(prev => prev.filter(pId => pId !== id));
        } else {
            setSelectedPlayers(prev => [...prev, id]);
        }
    };

    const handleUpdate = () => {
        if (selectedPlayers.length < 1) return;
        updateSessionPlayers(selectedPlayers);
        navigate('/');
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        Gestionar Sesión
                    </h2>
                    <p className="text-sm text-gray-400">Agrega o quita amigos</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {myFriends.length > 0 ? myFriends.map(player => {
                    const isSelected = selectedPlayers.includes(player.id);
                    return (
                        <Card
                            key={player.id}
                            className={`p-3 flex items-center gap-3 cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/20' : 'opacity-60 grayscale'}`}
                            onClick={() => togglePlayer(player.id)}
                            glass={false}
                        >
                            <div className="relative">
                                <span className="text-3xl">{player.avatar}</span>
                                {isSelected && (
                                    <div className="absolute -top-1 -right-1 bg-primary text-black rounded-full p-0.5">
                                        <Check className="w-3 h-3" />
                                    </div>
                                )}
                            </div>
                            <span className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                {player.name}
                            </span>
                        </Card>
                    );
                }) : (
                    <div className="col-span-2 text-center py-8 text-gray-500 border border-dashed border-white/10 rounded-xl">
                        <p>No tienes amigos agregados aún para invitar.</p>
                        <Button variant="ghost" className="mt-2 text-primary" onClick={() => navigate('/friends')}>
                            Ir a Mis Amigos
                        </Button>
                    </div>
                )}
            </div>

            <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
                <Button
                    size="lg"
                    glow
                    className="w-full shadow-xl"
                    disabled={selectedPlayers.length < 1}
                    onClick={handleUpdate}
                >
                    <Check className="w-5 h-5" /> ACTUALIZAR JUGADORES ({selectedPlayers.length})
                </Button>
            </div>
        </div>
    );
}
