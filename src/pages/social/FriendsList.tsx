import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Users } from 'lucide-react';
import { usePlayers } from '../../hooks/usePlayers';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { Player } from '../../types';

interface FriendsListProps {
    currentUser: Player;
}

export function FriendsList({ currentUser }: FriendsListProps) {
    const navigate = useNavigate();
    const { players, addFriend } = usePlayers();
    const [view, setView] = useState<'list' | 'add'>('list');

    // Logic to derive lists
    const myFriends = players.filter(p => currentUser.friends.includes(p.id));
    const suggestedFriends = players.filter(p =>
        p.id !== currentUser.id && !currentUser.friends.includes(p.id)
    );

    const handleAddFriend = (friendId: string) => {
        addFriend(currentUser.id, friendId);
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        {view === 'list' ? 'Mis Amigos' : 'Agregar Amigos'}
                    </h2>
                    <p className="text-sm text-gray-400">
                        {view === 'list' ? `Tienes ${myFriends.length} amigos` : 'Busca jugadores para invitar'}
                    </p>
                </div>
            </div>

            {view === 'list' ? (
                <>
                    <div className="grid grid-cols-1 gap-3">
                        {myFriends.length > 0 ? myFriends.map(friend => (
                            <Card
                                key={friend.id}
                                className="p-4 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2"
                                glass={false}
                            >
                                <span className="text-3xl">{friend.avatar}</span>
                                <div>
                                    <span className="font-bold text-lg block">{friend.name}</span>
                                    <span className="text-xs text-gray-500 uppercase">Amigo</span>
                                </div>
                            </Card>
                        )) : (
                            <div className="text-center py-10 text-gray-500">
                                <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>Aún no tienes amigos agregados.</p>
                            </div>
                        )}
                    </div>

                    <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
                        <Button
                            size="lg"
                            glow
                            className="w-full shadow-xl"
                            onClick={() => setView('add')}
                        >
                            <UserPlus className="w-5 h-5" /> AGREGAR AMIGOS
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-3">
                        {suggestedFriends.length > 0 ? suggestedFriends.map(player => (
                            <Card
                                key={player.id}
                                className="p-3 flex items-center justify-between gap-4 animate-in fade-in"
                                glass={false}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{player.avatar}</span>
                                    <span className="font-bold text-lg">{player.name}</span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleAddFriend(player.id)}
                                >
                                    <UserPlus className="w-4 h-4" /> Agregar
                                </Button>
                            </Card>
                        )) : (
                            <div className="text-center py-10 text-gray-500">
                                <p>No hay más jugadores para agregar.</p>
                                <p className="text-xs mt-2">¡Diles que se creen un perfil!</p>
                            </div>
                        )}
                    </div>

                    <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
                        <Button
                            variant="ghost"
                            className="w-full text-gray-400"
                            onClick={() => setView('list')}
                        >
                            Volver a mi lista
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
