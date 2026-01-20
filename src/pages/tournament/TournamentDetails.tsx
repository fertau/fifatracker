import { useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Users, ArrowLeft, Shuffle, Sparkles, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTournaments } from '../../hooks/useTournaments';
import { usePlayers } from '../../hooks/usePlayers';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FixtureDraw } from '../../components/tournament/FixtureDraw';
import { KnockoutBracket } from '../../components/tournament/KnockoutBracket';
import type { Tournament, Player } from '../../types';

interface TournamentDetailsProps {
    currentUser: Player | null;
}

export function TournamentDetails({ currentUser }: TournamentDetailsProps) {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const { tournaments, calculateLeagueStandings, generateLeagueFixtures, generateKnockoutFixtures, getTournamentMatches } = useTournaments();
    const navigate = useNavigate();

    const { updateTournament, deleteTournament } = useData();
    const { players } = usePlayers();

    const [showDraw, setShowDraw] = useState(false);

    // Get tournament from navigation state (if just created) or from tournaments array
    const tournamentFromState = location.state?.tournament as Tournament | undefined;
    const tournamentFromFirebase = tournaments.find(t => t.id === id);
    const tournament = tournamentFromState || tournamentFromFirebase;

    const standings = id ? calculateLeagueStandings(id) : [];
    const tournamentMatches = id ? getTournamentMatches(id) : [];

    // Persisted fixtures OR generate default if not yet saved (but we only generate default if we want to show 'preview', 
    // actually requirement is NOT to show preview. But we need empty array if null.)
    const fixtures = tournament?.fixtures || [];

    if (!tournament) {
        return (
            <div className="text-center p-10 space-y-4">
                <p className="text-gray-500">Torneo no encontrado</p>
                <Link to="/">
                    <Button variant="ghost">Volver al inicio</Button>
                </Link>
            </div>
        );
    }

    // Helper to get player details
    const getPlayer = (id: string) => players.find(p => p.id === id);

    const handleDrawConfirm = async (generatedFixtures: { team1: string[], team2: string[] }[]) => {
        if (!tournament) return;
        try {
            await updateTournament(tournament.id, {
                fixtures: generatedFixtures,
                status: 'active'
            });
            setShowDraw(false);
        } catch (error) {
            console.error('Error saving fixtures:', error);
            alert('Error al guardar el sorteo.');
        }
    };

    const handleDelete = async () => {
        if (confirm('¿Seguro que quieres eliminar este torneo?')) {
            try {
                await deleteTournament(tournament.id);
                // Redirect logic handled by router usually, but here we might be sticking on 404
                // We should navigate away. But I don't have navigate hook here.
                // Actually I should allow user to go back manually or use <Navigate> if not found.
                // Since I use window.location or navigate in component, I'll add useNavigate.
                navigate('/');
            } catch (error) {
                console.error('Error deleting:', error);
            }
        }
    };

    const isAdmin = currentUser && tournament && currentUser.id === tournament.createdBy;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link to="/">
                    <Button variant="ghost" size="sm" className="p-2"><ArrowLeft /></Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        {tournament.name}
                    </h2>
                    <div className="flex gap-3 text-xs text-gray-400 uppercase font-bold">
                        <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> {tournament.type === 'league' ? 'LIGA' : 'ELIMINATORIA'}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {tournament.participants.length} JUGADORES</span>
                    </div>
                </div>
            </div>

            {tournament.type === 'league' ? (
                <Card className="overflow-hidden p-0">
                    <div className="bg-white/5 p-3 text-center font-bold text-sm tracking-widest text-primary border-b border-white/5">
                        TABLA DE POSICIONES
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 border-b border-white/5">
                                <th className="p-3 text-left">Jugador</th>
                                <th className="p-3">PJ</th>
                                <th className="p-3 text-primary font-bold">PTS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {standings.map((row, index) => {
                                const player = getPlayer(row.playerId);
                                if (!player) return null;

                                return (
                                    <tr key={row.playerId} className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 flex items-center gap-2">
                                            <span className="text-gray-500 font-mono w-4">{index + 1}</span>
                                            <span>{player.avatar} {player.name}</span>
                                        </td>
                                        <td className="p-3 text-center text-gray-400">{row.played}</td>
                                        <td className="p-3 text-center font-bold text-lg text-neon-blue">{row.points}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Card>
            ) : (
                <div className="space-y-4">
                    {tournament.fixtures ? (
                        <KnockoutBracket tournament={tournament} matches={tournamentMatches} getPlayer={getPlayer} />
                    ) : (
                        <Card className="p-6 text-center space-y-4 opacity-50">
                            <Trophy className="w-12 h-12 text-gray-600 mx-auto" />
                            <p className="text-gray-400">El cuadro se generará tras el sorteo.</p>
                        </Card>
                    )}
                </div>
            )}

            {/* Draw Section */}
            {!tournament.fixtures && (
                <div className="space-y-4">
                    {!showDraw ? (
                        <>
                            {isAdmin ? (
                                <Button
                                    size="lg"
                                    glow
                                    className="w-full bg-gradient-to-r from-primary to-accent text-black font-black uppercase tracking-wider relative overflow-hidden group"
                                    onClick={() => setShowDraw(true)}
                                >
                                    <Shuffle className="w-5 h-5 mr-2 animate-pulse" />
                                    REALIZAR SORTEO
                                    <Sparkles className="w-5 h-5 ml-2 animate-pulse" />
                                </Button>
                            ) : (
                                <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                                    <Shuffle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Esperando Sorteo del Administrador</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <FixtureDraw
                            participants={tournament.participants.map(id => getPlayer(id)).filter(Boolean) as Player[]}
                            generateFixtures={tournament.type === 'league' ? generateLeagueFixtures : generateKnockoutFixtures}
                            onConfirm={handleDrawConfirm}
                            onCancel={() => setShowDraw(false)}
                        />
                    )}
                </div>
            )}

            {/* Admin Controls */}
            {isAdmin && (
                <div className="pt-6 border-t border-white/5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Panel de Administrador</p>
                    <div className="flex gap-2 justify-center">
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={handleDelete}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar Torneo
                        </Button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="uppercase text-xs font-bold text-gray-500 tracking-widest">Partidos / Fixture</h3>
                    {tournament.fixtures && (
                        <span className="text-[10px] text-green-500 font-bold uppercase flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Fixture Activo
                        </span>
                    )}
                </div>
                <div className="space-y-3">
                    {tournament.type === 'league' && fixtures.map((fixture, idx) => {
                        const p1 = getPlayer(fixture.team1[0]);
                        const p2 = getPlayer(fixture.team2[0]);

                        // Find if this match was already played
                        const match = tournamentMatches.find(m =>
                            (m.players.team1.includes(fixture.team1[0]) && m.players.team2.includes(fixture.team2[0])) ||
                            (m.players.team2.includes(fixture.team1[0]) && m.players.team1.includes(fixture.team2[0]))
                        );

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card glass className={`p-4 ${match ? 'opacity-60' : ''}`}>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 text-right font-bold text-sm">
                                            {p1?.name} {p1?.avatar}
                                        </div>
                                        <div className="bg-black/40 px-3 py-1 rounded-lg font-heading font-bold text-xl min-w-[3rem] text-center border border-white/5">
                                            {match ? `${match.score.team1} - ${match.score.team2}` : 'vs'}
                                        </div>
                                        <div className="flex-1 text-left font-bold text-sm">
                                            {p2?.avatar} {p2?.name}
                                        </div>
                                    </div>
                                    {!match && (
                                        <div className="mt-4 flex justify-center">
                                            <Link to={`/match/new?tournamentId=${tournament.id}&t1=${fixture.team1[0]}&t2=${fixture.team2[0]}`}>
                                                <Button size="sm" variant="outline" className="text-[10px] h-8">REGISTRAR RESULTADO</Button>
                                            </Link>
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        );
                    })}
                    {tournament.type === 'league' && fixtures.length === 0 && (
                        <div className="text-center p-8 bg-white/5 rounded-2xl border border-dashed border-white/10">
                            <Shuffle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">Fixture no generado aún.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
