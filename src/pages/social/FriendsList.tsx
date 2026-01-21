import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, Trash2, ArrowLeft, Search, Check, X, Clock, QrCode } from 'lucide-react';
import { usePlayers } from '../../hooks/usePlayers';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { QRManager } from '../../components/social/QRManager';
import type { Player } from '../../types';

interface FriendsListProps {
    currentUser: Player;
}

export function FriendsList({ currentUser }: FriendsListProps) {
    const navigate = useNavigate();
    const {
        players,
        removeFriend,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        updatePlayer
    } = usePlayers();

    const [view, setView] = useState<'list' | 'add'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [showQR, setShowQR] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);

    // Filter Logic with reliability safety
    const myFriends = players.filter(p => (currentUser.friends || []).includes(p.id));

    const pendingRequests = players.filter(p =>
        (currentUser.friendRequests || []).includes(p.id)
    );

    const sentRequests = players.filter(p =>
        (currentUser.sentRequests || []).includes(p.id)
    );

    const suggestedFriends = players.filter(p =>
        p.id !== currentUser.id &&
        !(currentUser.friends || []).includes(p.id) &&
        !(currentUser.friendRequests || []).includes(p.id) &&
        !(currentUser.sentRequests || []).includes(p.id) &&
        (searchQuery.trim() === '' ? p.visibility !== 'private' : p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleSendRequest = async (toId: string) => {
        try {
            setLoading(toId);
            await sendFriendRequest(currentUser.id, toId);
        } catch (error) {
            console.error('❌ Error sending request:', error);
        } finally {
            setLoading(null);
        }
    };

    const handleAcceptRequest = async (requesterId: string) => {
        try {
            setLoading(requesterId);
            await acceptFriendRequest(currentUser.id, requesterId);
        } catch (error) {
            console.error('❌ Error accepting request:', error);
        } finally {
            setLoading(null);
        }
    };

    const handleDeclineRequest = async (requesterId: string) => {
        try {
            setLoading(requesterId);
            await declineFriendRequest(currentUser.id, requesterId);
        } catch (error) {
            console.error('❌ Error declining request:', error);
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
            console.error('❌ Error removing friend:', error);
        } finally {
            setLoading(null);
        }
    };

    const handleScan = async (scannedId: string) => {
        const friend = players.find(p => p.id === scannedId);
        if (!friend) {
            alert('Código inválido o jugador no encontrado');
            return;
        }

        if (friend.id === currentUser.id) {
            alert('¡Ese eres tú!');
            return;
        }

        if (currentUser.friends.includes(friend.id)) {
            alert('Ya son amigos');
            return;
        }

        try {
            await handleSendRequest(friend.id);
            alert(`¡Solicitud enviada a ${friend.name}!`);
            setShowQR(false);
        } catch (error) {
            alert('Error al enviar la solicitud');
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        {view === 'list' ? 'Mis Amigos' : 'Agregar Amigos'}
                    </h2>
                    <p className="text-sm text-gray-400">
                        {view === 'list' ? `Tienes ${myFriends.length} amigos` : 'Busca jugadores para invitar'}
                    </p>
                </div>
                <Button
                    variant="secondary"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-2xl border-white/10"
                    onClick={() => setShowQR(true)}
                >
                    <QrCode className="w-5 h-5 text-primary" />
                </Button>
            </div>

            {view === 'list' ? (
                <div className="space-y-8">
                    {/* Pending Requests Section */}
                    {pendingRequests.length > 0 && (
                        <Card glass className="p-4 border-accent/20 bg-accent/5">
                            <h3 className="text-xs font-bold text-accent uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Clock className="w-3 h-3" /> Solicitudes Pendientes
                            </h3>
                            <div className="space-y-3">
                                {pendingRequests.map(req => (
                                    <div key={req.id} className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{req.avatar}</span>
                                            <span className="font-bold">{req.name}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="h-8 w-8 p-0 rounded-full"
                                                onClick={() => handleAcceptRequest(req.id)}
                                                disabled={loading === req.id}
                                            >
                                                <Check className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 rounded-full text-red-500"
                                                onClick={() => handleDeclineRequest(req.id)}
                                                disabled={loading === req.id}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Friends Section */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Amigos ({myFriends.length})</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {myFriends.length > 0 ? myFriends.map(friend => (
                                <Card
                                    key={friend.id}
                                    className="p-4 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 border-white/5 bg-white/[0.02]"
                                    glass={false}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center border border-white/10 bg-white/5">
                                            <span className="text-3xl">{friend.avatar}</span>
                                        </div>
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
                                <div className="text-center py-10 text-gray-500 flex flex-col items-center">
                                    <Users className="w-10 h-10 mb-2 opacity-20" />
                                    <p className="font-bold uppercase tracking-widest text-[10px]">No tienes amigos añadidos</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Privacy Settings Section */}
                    <Card glass className="p-4 border-white/5 bg-white/[0.01] mt-8">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-500">Visibilidad del Perfil</h4>
                                <p className="text-[9px] text-gray-600 uppercase font-black">Controla quién puede encontrarte</p>
                            </div>
                            <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex gap-1">
                                <button
                                    onClick={() => updatePlayer(currentUser.id, { visibility: 'public' })}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                        currentUser.visibility === 'public' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-500 hover:text-gray-300"
                                    )}
                                >
                                    Público
                                </button>
                                <button
                                    onClick={() => updatePlayer(currentUser.id, { visibility: 'private' })}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                        currentUser.visibility === 'private' ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-gray-500 hover:text-gray-300"
                                    )}
                                >
                                    Privado
                                </button>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 italic">
                            {currentUser.visibility === 'public'
                                ? 'Cualquier jugador puede encontrarte en la lista global.'
                                : 'Solo jugadores que te busquen por tu nombre exacto podrán encontrarte.'}
                        </p>
                    </Card>

                    <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto z-40">
                        <Button
                            size="lg"
                            glow
                            className="w-full shadow-2xl"
                            onClick={() => setView('add')}
                        >
                            <UserPlus className="w-5 h-5 mr-2" /> BUSCAR JUGADORES
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="BUSCAR NICKNAME..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-sm focus:outline-none focus:border-primary transition-all font-bold uppercase tracking-widest"
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {suggestedFriends.length > 0 ? suggestedFriends.map(player => (
                            <Card
                                key={player.id}
                                className="p-3 flex items-center justify-between gap-4 animate-in fade-in border-white/5 bg-white/[0.02]"
                                glass={false}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center border border-white/10 bg-white/5">
                                        <span className="text-xl">{player.avatar}</span>
                                    </div>
                                    <span className="font-bold text-lg">{player.name}</span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="rounded-xl"
                                    onClick={() => handleSendRequest(player.id)}
                                    disabled={loading === player.id}
                                >
                                    {loading === player.id ? '...' : (
                                        <><UserPlus className="w-4 h-4 mr-2" /> Invitar</>
                                    )}
                                </Button>
                            </Card>
                        )) : searchQuery.trim() !== '' ? (
                            <div className="text-center py-20 text-gray-500">
                                <Search className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p className="font-bold uppercase tracking-widest text-xs">No se encontró al jugador</p>
                                <p className="text-[10px] mt-1">Asegúrate de escribir el nombre exacto</p>
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-500">
                                <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p className="font-bold uppercase tracking-widest text-xs">Busca jugadores por su nombre</p>
                            </div>
                        )}
                    </div>

                    {/* Sent Requests Info */}
                    {sentRequests.length > 0 && (
                        <div className="pt-6 border-t border-white/5 space-y-3">
                            <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-600 px-1">Invitaciones Enviadas</h4>
                            <div className="space-y-2">
                                {sentRequests.map(req => (
                                    <div key={req.id} className="flex items-center justify-between opacity-50 px-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">{req.avatar}</span>
                                            <span className="text-xs font-bold uppercase tracking-widest">{req.name}</span>
                                        </div>
                                        <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase font-black">Pendiente</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto z-40">
                        <Button
                            variant="ghost"
                            className="w-full text-gray-400 hover:text-white"
                            onClick={() => {
                                setView('list');
                                setSearchQuery('');
                            }}
                        >
                            VOLVER A MIS AMIGOS
                        </Button>
                    </div>
                </div>
            )}

            {showQR && (
                <QRManager
                    playerId={currentUser.id}
                    onScan={handleScan}
                    onClose={() => setShowQR(false)}
                />
            )}
        </div>
    );
}
