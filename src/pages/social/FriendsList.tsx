import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, Trash2, ArrowLeft } from 'lucide-react';
import { usePlayers } from '../../hooks/usePlayers';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { Player } from '../../types';

interface FriendsListProps {
    currentUser: Player;
}

export function FriendsList({ currentUser }: FriendsListProps) {
    const navigate = useNavigate();
    const { players, addFriend, removeFriend } = usePlayers();
    const [view, setView] = useState<'list' | 'add'>('list');

    // Logic to derive lists
    const myFriends = players.filter(p => currentUser.friends.includes(p.id));
    const suggestedFriends = players.filter(p =>
        p.id !== currentUser.id && !currentUser.friends.includes(p.id)
    );

    const [loading, setLoading] = useState<string | null>(null);

    const handleAddFriend = async (friendId: string) => {
        try {
            setLoading(friendId);
            await addFriend(currentUser.id, friendId);
        } catch (error) {
            console.error('❌ Error al agregar:', error);
        } finally {
            setLoading(null);
        }
    };

    const handleRemoveFriend = async (friendId: string) => {
        if (!confirm('¿Seguro que quieres eliminar a este amigo?')) return;
        try {
            setLoading(friendId);
            await removeFriend(currentUser.id, friendId);
        } catch (error) {
            console.error('❌ Error al eliminar:', error);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
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
                                className="p-4 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 border-white/5 bg-white/[0.02]"
                                glass={false}
                            >
                                <div className="flex items-center gap-4">
                                    {friend.photoURL ? (
                                        <img src={friend.photoURL} alt="" className="w-12 h-12 rounded-full object-cover border border-white/10" />
                                    ) : (
                                        <span className="text-3xl">{friend.avatar}</span>
                                    )}
                                    <div>
                                        <span className="font-bold text-lg block">{friend.name}</span>
                                        <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Amigo</span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-xl"
                                    onClick={() => handleRemoveFriend(friend.id)}
                                    disabled={loading === friend.id}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </Card>
                        )) : (
                            <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                                <Users className="w-12 h-12 mb-2 opacity-20" />
                                <p className="font-bold uppercase tracking-widest text-xs">No tienes amigos añadidos</p>
                            </div>
                        )}
                    </div>

                    <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto z-40">
                        <Button
                            size="lg"
                            glow
                            className="w-full shadow-2xl"
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
                                className="p-3 flex items-center justify-between gap-4 animate-in fade-in border-white/5 bg-white/[0.02]"
                                glass={false}
                            >
                                <div className="flex items-center gap-3">
                                    {player.photoURL ? (
                                        <img src={player.photoURL} alt="" className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <span className="text-2xl">{player.avatar}</span>
                                    )}
                                    <span className="font-bold text-lg">{player.name}</span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="rounded-xl"
                                    onClick={() => handleAddFriend(player.id)}
                                    disabled={loading === player.id}
                                >
                                    {loading === player.id ? '...' : (
                                        <><UserPlus className="w-4 h-4 mr-2" /> Agregar</>
                                    )}
                                </Button>
                            </Card>
                        )) : (
                            <div className="text-center py-20 text-gray-500">
                                <p className="font-bold uppercase tracking-widest text-xs">No hay más jugadores para agregar</p>
                                <p className="text-[10px] mt-2 text-gray-600">¡Diles que se creen un perfil!</p>
                            </div>
                        )}
                    </div>

                    <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto z-40">
                        <Button
                            variant="ghost"
                            className="w-full text-gray-400 hover:text-white"
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
