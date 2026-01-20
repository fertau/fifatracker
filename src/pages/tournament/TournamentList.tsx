import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, Users, ChevronRight, Plus, Crown, ArrowLeft } from 'lucide-react';
import { useTournaments } from '../../hooks/useTournaments';

import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface TournamentListProps {
    currentUser: import('../../types').Player | null;
}

export function TournamentList({ currentUser }: TournamentListProps) {
    const navigate = useNavigate();
    const { tournaments, getTournamentMatches } = useTournaments();

    const activeTournaments = tournaments.filter(t => t.status === 'active' || t.status === 'draft').sort((a, b) => b.createdAt - a.createdAt);
    const finishedTournaments = tournaments.filter(t => t.status === 'completed').sort((a, b) => b.createdAt - a.createdAt);

    return (
        <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="p-2" onClick={() => navigate('/')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold font-heading uppercase tracking-tight">Torneos</h2>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Compite y gana</p>
                    </div>
                </div>
                <Button glow size="sm" onClick={() => navigate('/tournament/new')}>
                    <Plus className="w-4 h-4 mr-1" /> Nuevo
                </Button>
            </div>

            {/* Active Tournaments */}
            <section className="space-y-4">
                <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <Trophy className="w-3 h-3" /> En Curso
                </h3>

                {activeTournaments.length === 0 ? (
                    <div className="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <Trophy className="w-10 h-10 mx-auto text-gray-700 mb-2" />
                        <p className="text-gray-500 text-sm">No hay torneos activos.</p>
                        <Button variant="ghost" className="text-primary mt-2" onClick={() => navigate('/tournament/new')}>
                            Crear uno ahora
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeTournaments.map(t => {
                            // Calculate basic stats for display
                            const matches = getTournamentMatches(t.id);
                            const playedMatches = matches.length;

                            return (
                                <Card
                                    key={t.id}
                                    glass
                                    className="p-4 group hover:bg-white/5 cursor-pointer transition-all border-l-4 border-l-primary"
                                    onClick={() => navigate(`/tournament/${t.id}`)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-lg">{t.name}</h4>
                                                {t.status === 'draft' && (
                                                    <span className="text-[9px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded uppercase font-black tracking-widest">Draft</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 font-bold uppercase tracking-wide">
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" /> {t.participants.length}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    {t.type === 'league' ? 'Liga' : 'Knockout'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {new Date(t.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
                                    </div>

                                    {/* Mini Progress Bar if Active */}
                                    {t.status === 'active' && t.fixtures && (
                                        <div className="mt-4 space-y-1">
                                            <div className="flex justify-between text-[9px] uppercase font-black tracking-widest text-gray-500">
                                                <span>Progreso</span>
                                                <span>{playedMatches} / {t.fixtures.length} Partidos</span>
                                            </div>
                                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all duration-500"
                                                    style={{ width: `${Math.min(100, (playedMatches / t.fixtures.length) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Finished Tournaments */}
            {finishedTournaments.length > 0 && (
                <section className="space-y-4 pt-4 border-t border-white/5">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Crown className="w-3 h-3" /> Finalizados
                    </h3>
                    <div className="space-y-3">
                        {finishedTournaments.map(t => {
                            // Determine winner (Placeholder logic, relies on manual finish or auto-detect)
                            // For now just list them
                            return (
                                <Card
                                    key={t.id}
                                    className="p-4 opacity-70 hover:opacity-100 transition-opacity bg-black/20 border-white/5 cursor-pointer"
                                    onClick={() => navigate(`/tournament/${t.id}`)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="font-bold text-gray-300">{t.name}</h4>
                                            <p className="text-xs text-gray-500 uppercase font-bold">
                                                {new Date(t.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="px-3 py-1 bg-white/5 rounded border border-white/5">
                                            <span className="text-xs font-bold text-gray-400">Finalizado</span>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
}
