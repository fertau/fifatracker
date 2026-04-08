import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, RefreshCw, Sparkles, Trophy } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Player } from '../../types';

interface CinematicDrawProps {
    participants: Player[];
    tournamentName: string;
    tournamentType: 'league' | 'knockout';
    generateFixtures: (players: string[]) => { team1: string[]; team2: string[] }[];
    onConfirm: (fixtures: { team1: string[]; team2: string[] }[]) => void;
    onCancel: () => void;
}

type Phase = 'intro' | 'shuffling' | 'drawing' | 'review';

export function CinematicDraw({
    participants,
    tournamentName,
    tournamentType,
    generateFixtures,
    onConfirm,
    onCancel,
}: CinematicDrawProps) {
    const [phase, setPhase] = useState<Phase>('intro');
    const [shuffledParticipants, setShuffledParticipants] = useState<Player[]>([]);
    const [fixtures, setFixtures] = useState<{ team1: string[]; team2: string[] }[]>([]);
    const [revealedCount, setRevealedCount] = useState(0);

    const validFixtures = fixtures.filter(f => f.team1.length > 0 && f.team2.length > 0);

    const getPlayerName = (id: string) => {
        if (id === 'BYE') return 'BYE';
        return participants.find(p => p.id === id)?.name || 'TBD';
    };
    const getPlayerAvatar = (id: string) => {
        if (id === 'BYE') return '👋';
        return participants.find(p => p.id === id)?.avatar || '❓';
    };

    // Phase: Intro (2s dramatic pause)
    useEffect(() => {
        if (phase === 'intro') {
            const timer = setTimeout(() => setPhase('shuffling'), 2000);
            return () => clearTimeout(timer);
        }
    }, [phase]);

    // Phase: Shuffling (3s of visual chaos)
    useEffect(() => {
        if (phase === 'shuffling') {
            const interval = setInterval(() => {
                setShuffledParticipants([...participants].sort(() => Math.random() - 0.5));
            }, 80);

            const timer = setTimeout(() => {
                clearInterval(interval);
                const finalShuffle = [...participants].sort(() => Math.random() - 0.5);
                setShuffledParticipants(finalShuffle);
                const generated = generateFixtures(finalShuffle.map(p => p.id));
                setFixtures(generated);
                setPhase('drawing');
            }, 3000);

            return () => {
                clearInterval(interval);
                clearTimeout(timer);
            };
        }
    }, [phase, participants, generateFixtures]);

    // Phase: Drawing (1.5s per fixture reveal)
    useEffect(() => {
        if (phase === 'drawing' && revealedCount < validFixtures.length) {
            const timer = setTimeout(() => {
                setRevealedCount(prev => prev + 1);
            }, 1500);
            return () => clearTimeout(timer);
        } else if (phase === 'drawing' && validFixtures.length > 0 && revealedCount >= validFixtures.length) {
            const timer = setTimeout(() => setPhase('review'), 1500);
            return () => clearTimeout(timer);
        }
    }, [phase, revealedCount, validFixtures.length]);

    const restart = useCallback(() => {
        setPhase('intro');
        setRevealedCount(0);
        setFixtures([]);
        setShuffledParticipants([]);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 overflow-y-auto"
        >
            {/* Tournament badge */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="mb-6"
            >
                <div className="p-4 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/40">
                    <Trophy className="w-8 h-8 text-primary" />
                </div>
            </motion.div>

            {/* Title */}
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-black font-heading uppercase italic text-center bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-accent mb-1"
            >
                {tournamentName}
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xs text-gray-500 uppercase tracking-[0.3em] mb-8"
            >
                {tournamentType === 'league' ? 'Liga' : 'Copa'} · {participants.length} jugadores · Sorteo
            </motion.p>

            {/* INTRO */}
            {phase === 'intro' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="flex flex-wrap justify-center gap-3">
                        {participants.map((p, i) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.15 }}
                                className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl"
                            >
                                {p.avatar}
                            </motion.div>
                        ))}
                    </div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="flex items-center gap-2 text-primary"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm uppercase tracking-widest font-bold">Preparando sorteo...</span>
                    </motion.div>
                </motion.div>
            )}

            {/* SHUFFLING */}
            {phase === 'shuffling' && (
                <div className="flex flex-col items-center gap-6">
                    <div className="grid grid-cols-4 gap-3">
                        {shuffledParticipants.map(p => (
                            <motion.div
                                key={p.id}
                                layout
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl"
                            >
                                {p.avatar}
                            </motion.div>
                        ))}
                    </div>
                    <motion.p
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="text-sm text-gray-400 uppercase tracking-widest font-bold"
                    >
                        Mezclando...
                    </motion.p>
                </div>
            )}

            {/* DRAWING */}
            {(phase === 'drawing' || phase === 'review') && (
                <div className="w-full max-w-md space-y-3 max-h-[50vh] overflow-y-auto px-2">
                    <AnimatePresence>
                        {validFixtures.slice(0, revealedCount).map((fixture, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 200,
                                    damping: 20,
                                }}
                                className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/10 backdrop-blur-sm"
                            >
                                {/* Match number */}
                                <span className="text-[10px] text-gray-600 font-mono font-bold w-6">{idx + 1}</span>

                                {/* Player A */}
                                <div className="flex items-center gap-2 flex-1">
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.1, type: 'spring' }}
                                        className="text-2xl"
                                    >
                                        {getPlayerAvatar(fixture.team1[0])}
                                    </motion.span>
                                    <span className="font-bold text-sm truncate">{getPlayerName(fixture.team1[0])}</span>
                                </div>

                                {/* VS */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -90 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.2, type: 'spring' }}
                                    className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20"
                                >
                                    <span className="text-[10px] font-black text-primary tracking-widest">VS</span>
                                </motion.div>

                                {/* Player B */}
                                <div className="flex items-center gap-2 flex-1 flex-row-reverse">
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.3, type: 'spring' }}
                                        className="text-2xl"
                                    >
                                        {getPlayerAvatar(fixture.team2[0])}
                                    </motion.span>
                                    <span className="font-bold text-sm truncate text-right">{getPlayerName(fixture.team2[0])}</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {phase === 'drawing' && revealedCount < validFixtures.length && (
                        <motion.div
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="text-center py-4"
                        >
                            <span className="text-xs text-gray-500 uppercase tracking-widest">
                                Revelando partido {revealedCount + 1} de {validFixtures.length}...
                            </span>
                        </motion.div>
                    )}
                </div>
            )}

            {/* REVIEW ACTIONS */}
            {phase === 'review' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex gap-3 mt-6 w-full max-w-md"
                >
                    <Button variant="ghost" onClick={onCancel} className="flex-1">
                        Cancelar
                    </Button>
                    <Button variant="ghost" onClick={restart} className="flex-1">
                        <RefreshCw className="w-4 h-4 mr-2" /> Repetir
                    </Button>
                    <Button glow onClick={() => onConfirm(fixtures)} className="flex-1">
                        <Check className="w-4 h-4 mr-2" /> Confirmar
                    </Button>
                </motion.div>
            )}
        </motion.div>
    );
}
