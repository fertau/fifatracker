import { Link } from 'react-router-dom';
import { Play, Trophy, Users, UserPlus, History } from 'lucide-react';
import { usePlayers } from '../hooks/usePlayers';
import { useSession } from '../context/SessionContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import type { Player } from '../types';

interface HomePageProps {
    player: Player;
}

export function HomePage({ player }: HomePageProps) {
    const { isSessionActive, session, endSession } = useSession();
    const { getFriendsOf } = usePlayers();

    const myFriends = getFriendsOf(player.id);
    const recentFriends = myFriends.slice(0, 4); // Show top 4 friends

    return (
        <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-center gap-3 mb-2">
                    {player.photoURL ? (
                        <img src={player.photoURL} alt={player.name} className="w-12 h-12 rounded-full border-2 border-primary/50" />
                    ) : (
                        <span className="text-4xl">{player.avatar}</span>
                    )}
                    <h2 className="text-3xl font-bold">Hola, {player.name}</h2>
                </div>

                {!isSessionActive ? (
                    <div className="space-y-4">
                        <p className="text-gray-400 mb-2">¿Estás con amigos?</p>
                        <Link to="/session/new">
                            <Button size="lg" glow className="w-full animate-pulse">
                                <Play className="w-5 h-5 fill-current" /> INICIAR SESIÓN
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2 text-primary font-bold bg-primary/10 py-1 rounded-full text-xs uppercase tracking-widest border border-primary/20">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Sesión Activa ({session?.playersPresent.length} jugadores)
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Link to="/match/new">
                                <Button size="md" glow className="w-full">
                                    PARTIDO RÁPIDO
                                </Button>
                            </Link>
                            <Link to="/tournament/new">
                                <Button size="md" variant="secondary" className="w-full">
                                    <Trophy className="w-4 h-4" /> NUEVO TORNEO
                                </Button>
                            </Link>
                        </div>

                        <div className="flex justify-between items-center px-2">
                            <Link to="/session/manage" className="text-xs text-primary hover:text-primary/80 underline decoration-primary/50">
                                Gestionar Jugadores
                            </Link>
                            <button onClick={endSession} className="text-xs text-red-400 hover:text-red-300 underline decoration-red-400/50">
                                Finalizar Sesión
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Friends Section - HIGHLIGHTED */}
            <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-lg">Mis Amigos</h3>
                    </div>
                    <Link to="/friends" className="text-xs text-primary hover:text-primary/80">
                        Ver todos ({myFriends.length})
                    </Link>
                </div>

                {recentFriends.length > 0 ? (
                    <div className="grid grid-cols-4 gap-3 mb-4">
                        {recentFriends.map(friend => (
                            <div key={friend.id} className="flex flex-col items-center gap-1">
                                {friend.photoURL ? (
                                    <img src={friend.photoURL} alt={friend.name} className="w-12 h-12 rounded-full border-2 border-white/10" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl border-2 border-white/10">
                                        {friend.avatar}
                                    </div>
                                )}
                                <span className="text-[10px] text-gray-400 truncate w-full text-center">{friend.name}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-gray-500">
                        <p className="text-sm mb-3">Aún no tienes amigos agregados</p>
                    </div>
                )}

                <Link to="/friends">
                    <Button variant="ghost" className="w-full border border-white/10 hover:bg-white/5">
                        <UserPlus className="w-4 h-4 mr-2" /> INVITAR AMIGOS
                    </Button>
                </Link>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
                <Link to="/history">
                    <Button variant="ghost" className="w-full border border-white/10 hover:bg-white/5">
                        <History className="w-4 h-4 mr-2" /> HISTORIAL
                    </Button>
                </Link>
                <Link to="/friends">
                    <Button variant="ghost" className="w-full border border-white/10 hover:bg-white/5">
                        <Users className="w-4 h-4 mr-2" /> AMIGOS
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <Card glass className="p-4 flex flex-col items-center justify-center gap-2">
                    <span className="text-4xl font-bold text-primary">{player.stats.matchesPlayed}</span>
                    <span className="text-xs text-gray-400 uppercase">Partidos</span>
                </Card>
                <Card glass className="p-4 flex flex-col items-center justify-center gap-2">
                    <span className="text-4xl font-bold text-accent">{player.stats.wins}</span>
                    <span className="text-xs text-gray-400 uppercase">Victorias</span>
                </Card>
                <Card glass className="p-4 flex flex-col items-center justify-center gap-2">
                    <span className="text-4xl font-bold text-neon-blue">{player.stats.goalsScored}</span>
                    <span className="text-xs text-gray-400 uppercase">Goles</span>
                </Card>
                <Card glass className="p-4 flex flex-col items-center justify-center gap-2">
                    <span className="text-4xl font-bold text-white">
                        {player.stats.matchesPlayed > 0 ? Math.round((player.stats.wins / player.stats.matchesPlayed) * 100) : 0}%
                    </span>
                    <span className="text-xs text-gray-400 uppercase">Efectividad</span>
                </Card>
            </div>
        </div>
    );
}
