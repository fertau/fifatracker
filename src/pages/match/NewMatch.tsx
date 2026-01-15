import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Trophy, ArrowRight, Flag, AlertTriangle, Calendar } from 'lucide-react';
import { usePlayers } from '../../hooks/usePlayers';
import { useSession } from '../../context/SessionContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { Match } from '../../types';

export function NewMatch() {
    const navigate = useNavigate();
    const { players, saveMatch } = usePlayers();
    const { session, isSessionActive } = useSession();

    const [gameType, setGameType] = useState<Match['type']>('1v1');
    const [step, setStep] = useState<'setup' | 'score'>('setup');

    // Selection State
    const [team1, setTeam1] = useState<string[]>([]);
    const [team2, setTeam2] = useState<string[]>([]);

    // Score State
    const [score1, setScore1] = useState(0);
    const [score2, setScore2] = useState(0);

    // Match Details
    const [endedBy, setEndedBy] = useState<Match['endedBy']>('regular');
    const [penaltyWinner, setPenaltyWinner] = useState<1 | 2 | undefined>();
    const [forfeitLoser, setForfeitLoser] = useState<1 | 2 | undefined>();
    const [matchDate, setMatchDate] = useState(new Date().toISOString().slice(0, 16));

    // Filter players based on active session
    const availablePlayers = isSessionActive && session
        ? players.filter(p => session.playersPresent.includes(p.id))
        : players;

    const togglePlayer = (playerId: string, team: 1 | 2) => {
        const currentTeam = team === 1 ? team1 : team2;
        const setTeam = team === 1 ? setTeam1 : setTeam2;

        // Dynamic limits based on game type
        let limit = 1;
        if (gameType === '2v2') limit = 2;
        if (gameType === '3v1') limit = team === 1 ? 3 : 1;
        if (gameType === 'custom') limit = 4;

        if (currentTeam.includes(playerId)) {
            setTeam(currentTeam.filter(id => id !== playerId));
        } else {
            if (currentTeam.length < limit) {
                setTeam([...currentTeam, playerId]);
            }
        }
    };

    const isReady = () => {
        // Basic validation: at least 1 player per team
        return team1.length > 0 && team2.length > 0;
    };

    const handleSave = async () => {
        try {
            if (saveMatch) {
                // We'll update saveMatch or just use addMatch if possible, 
                // but usePlayers wraps it. Let's update usePlayers.
                await saveMatch(
                    gameType,
                    team1,
                    team2,
                    score1,
                    score2,
                    endedBy,
                    penaltyWinner,
                    forfeitLoser,
                    new Date(matchDate).getTime()
                );
            }
            navigate('/');
        } catch (error) {
            console.error('Error saving match:', error);
            alert('Error al guardar el partido. Verifica tu conexión e intenta de nuevo.');
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-heading">Nuevo Partido</h2>
                <div className="flex bg-surface rounded-lg p-1 gap-1">
                    {(['1v1', '2v2', '3v1'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => { setGameType(type); setTeam1([]); setTeam2([]); }}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${gameType === type ? 'bg-primary text-black' : 'text-gray-400'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {step === 'setup' ? (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    {/* Date Picker */}
                    <div className="space-y-3">
                        <h3 className="text-gray-400 font-bold flex items-center gap-2 text-sm uppercase">
                            <Calendar className="w-4 h-4" /> Fecha del Partido
                        </h3>
                        <input
                            type="datetime-local"
                            className="w-full bg-surface border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none"
                            value={matchDate}
                            onChange={(e) => setMatchDate(e.target.value)}
                        />
                    </div>

                    {/* Team 1 Selection */}
                    <div className="space-y-3">
                        <h3 className="text-neon-blue font-bold flex items-center gap-2 text-sm uppercase">
                            <Users className="w-4 h-4" /> LOCAL ({team1.length})
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {availablePlayers.map(player => {
                                const isSelected = team1.includes(player.id);
                                const isDisabled = team2.includes(player.id);
                                return (
                                    <Card
                                        key={player.id}
                                        className={`p-3 flex items-center gap-3 cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/10' : ''} ${isDisabled ? 'opacity-30 pointer-events-none' : ''}`}
                                        onClick={() => togglePlayer(player.id, 1)}
                                        glass={false}
                                    >
                                        <span className="text-2xl">{player.avatar}</span>
                                        <span className="font-bold text-sm truncate">{player.name}</span>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    {/* Team 2 Selection */}
                    <div className="space-y-3">
                        <h3 className="text-neon-purple font-bold flex items-center gap-2 text-accent text-sm uppercase">
                            <Users className="w-4 h-4" /> VISITANTE ({team2.length})
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {availablePlayers.map(player => {
                                const isSelected = team2.includes(player.id);
                                const isDisabled = team1.includes(player.id);
                                return (
                                    <Card
                                        key={player.id}
                                        className={`p-3 flex items-center gap-3 cursor-pointer transition-all ${isSelected ? 'border-accent bg-accent/10' : ''} ${isDisabled ? 'opacity-30 pointer-events-none' : ''}`}
                                        onClick={() => togglePlayer(player.id, 2)}
                                        glass={false}
                                    >
                                        <span className="text-2xl">{player.avatar}</span>
                                        <span className="font-bold text-sm truncate">{player.name}</span>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    <Button
                        className="w-full mt-8"
                        size="lg"
                        glow
                        disabled={!isReady()}
                        variant={isReady() ? 'primary' : 'ghost'}
                        onClick={() => setStep('score')}
                    >
                        CONTINUAR <ArrowRight className="w-5 h-5" />
                    </Button>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                >
                    <Card glass className="py-6 space-y-6">
                        <div className="flex items-center justify-center gap-8">
                            {/* Score Team 1 */}
                            <div className="space-y-4 text-center">
                                <span className="block text-neon-blue font-bold text-lg">LOCAL</span>
                                <div className="flex flex-col gap-2 items-center">
                                    <button onClick={() => setScore1(s => s + 1)} className="w-16 h-12 bg-white/10 rounded-t-xl hover:bg-white/20 flex items-center justify-center">▲</button>
                                    <div className="text-6xl font-heading font-bold bg-black/30 rounded-lg p-4 w-24 border border-white/10 text-center">
                                        {score1}
                                    </div>
                                    <button onClick={() => setScore1(s => Math.max(0, s - 1))} className="w-16 h-12 bg-white/10 rounded-b-xl hover:bg-white/20 flex items-center justify-center">▼</button>
                                </div>
                            </div>

                            <div className="text-4xl font-bold text-gray-600">-</div>

                            {/* Score Team 2 */}
                            <div className="space-y-4 text-center">
                                <span className="block text-accent font-bold text-lg">VISITANTE</span>
                                <div className="flex flex-col gap-2 items-center">
                                    <button onClick={() => setScore2(s => s + 1)} className="w-16 h-12 bg-white/10 rounded-t-xl hover:bg-white/20 flex items-center justify-center">▲</button>
                                    <div className="text-6xl font-heading font-bold bg-black/30 rounded-lg p-4 w-24 border border-white/10 text-center">
                                        {score2}
                                    </div>
                                    <button onClick={() => setScore2(s => Math.max(0, s - 1))} className="w-16 h-12 bg-white/10 rounded-b-xl hover:bg-white/20 flex items-center justify-center">▼</button>
                                </div>
                            </div>
                        </div>

                        {/* Match Ending Details */}
                        <div className="border-t border-white/10 pt-4 px-4 space-y-3">
                            <div className="flex gap-2 justify-center text-xs font-bold uppercase text-gray-400 pb-2">
                                <button
                                    onClick={() => setEndedBy('regular')}
                                    className={`px-3 py-1 rounded-full ${endedBy === 'regular' ? 'bg-white text-black' : 'bg-black/20'}`}
                                >
                                    Tiempo Regular
                                </button>
                                <button
                                    onClick={() => setEndedBy('penalties')}
                                    className={`px-3 py-1 rounded-full ${endedBy === 'penalties' ? 'bg-yellow-500 text-black' : 'bg-black/20'}`}
                                >
                                    Penales
                                </button>
                                <button
                                    onClick={() => setEndedBy('forfeit')}
                                    className={`px-3 py-1 rounded-full ${endedBy === 'forfeit' ? 'bg-red-500 text-black' : 'bg-black/20'}`}
                                >
                                    Abandono
                                </button>
                            </div>

                            {endedBy === 'penalties' && (
                                <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg text-center animate-in fade-in slide-in-from-top-2">
                                    <p className="text-yellow-500 text-sm font-bold mb-2 flex items-center justify-center gap-2">
                                        <Flag className="w-4 h-4" /> ¿Quién ganó los penales?
                                    </p>
                                    <div className="flex gap-4 justify-center">
                                        <button
                                            onClick={() => setPenaltyWinner(1)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold ${penaltyWinner === 1 ? 'bg-neon-blue text-black' : 'bg-black/40 text-gray-400'}`}
                                        >
                                            Local
                                        </button>
                                        <button
                                            onClick={() => setPenaltyWinner(2)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold ${penaltyWinner === 2 ? 'bg-accent text-black' : 'bg-black/40 text-gray-400'}`}
                                        >
                                            Visitante
                                        </button>
                                    </div>
                                </div>
                            )}

                            {endedBy === 'forfeit' && (
                                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-center animate-in fade-in slide-in-from-top-2">
                                    <p className="text-red-400 text-sm font-bold mb-2 flex items-center justify-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> ¿Quién abandonó? (Perdedor)
                                    </p>
                                    <div className="flex gap-4 justify-center">
                                        <button
                                            onClick={() => setForfeitLoser(1)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold ${forfeitLoser === 1 ? 'bg-neon-blue text-black' : 'bg-black/40 text-gray-400'}`}
                                        >
                                            Local
                                        </button>
                                        <button
                                            onClick={() => setForfeitLoser(2)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold ${forfeitLoser === 2 ? 'bg-accent text-black' : 'bg-black/40 text-gray-400'}`}
                                        >
                                            Visitante
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    <div className="flex gap-4">
                        <Button variant="ghost" className="flex-1" onClick={() => setStep('setup')}>Back</Button>
                        <Button className="flex-[2]" glow size="lg" onClick={handleSave}>
                            <Trophy className="w-5 h-5" /> FINALIZAR PARTIDO
                        </Button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
