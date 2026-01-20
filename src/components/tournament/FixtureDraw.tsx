import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Check, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { Player } from '../../types';

interface FixtureDrawProps {
    participants: Player[];
    onConfirm: (fixtures: { team1: string[], team2: string[] }[]) => void;
    onCancel: () => void;
    generateFixtures: (players: string[]) => { team1: string[], team2: string[] }[];
}

export function FixtureDraw({ participants, onConfirm, onCancel, generateFixtures }: FixtureDrawProps) {
    const [step, setStep] = useState<'shuffling' | 'drawing' | 'review'>('shuffling');
    const [shuffledParticipants, setShuffledParticipants] = useState<Player[]>([]);
    const [generatedFixtures, setGeneratedFixtures] = useState<{ team1: string[], team2: string[] }[]>([]);
    const [revealedCount, setRevealedCount] = useState(0);

    const validFixtures = generatedFixtures.filter(f => f.team1.length > 0 && f.team2.length > 0);

    // Initial Shuffle Animation
    useEffect(() => {
        if (step === 'shuffling') {
            const interval = setInterval(() => {
                setShuffledParticipants([...participants].sort(() => Math.random() - 0.5));
            }, 100);

            const timer = setTimeout(() => {
                clearInterval(interval);
                setStep('drawing');
                const finalShuffle = [...participants].sort(() => Math.random() - 0.5);
                setShuffledParticipants(finalShuffle);

                // Generate fixtures based on this shuffle
                const fixtures = generateFixtures(finalShuffle.map(p => p.id));
                setGeneratedFixtures(fixtures);
            }, 2000);

            return () => {
                clearInterval(interval);
                clearTimeout(timer);
            };
        }
    }, [step, participants, generateFixtures]);

    // Reveal Matches Animation


    useEffect(() => {
        if (step === 'drawing' && revealedCount < validFixtures.length) {
            const timer = setTimeout(() => {
                setRevealedCount(prev => prev + 1);
            }, 500); // Reveal one every 500ms
            return () => clearTimeout(timer);
        } else if (step === 'drawing' && revealedCount >= validFixtures.length) {
            setTimeout(() => setStep('review'), 1000);
        }
    }, [step, revealedCount, validFixtures.length]);

    const getPlayerName = (id: string) => {
        if (id === 'BYE') return 'BYE';
        return participants.find(p => p.id === id)?.name || 'TBD';
    };
    const getPlayerAvatar = (id: string) => {
        if (id === 'BYE') return '👋';
        return participants.find(p => p.id === id)?.avatar || '❓';
    };



    return (
        <Card className="p-6 space-y-6 text-center">
            <h2 className="text-2xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent uppercase italic">
                {step === 'shuffling' ? 'Mezclando Equipos...' : step === 'drawing' ? 'Generando Fixture...' : 'Sorteo Finalizado'}
            </h2>

            {step === 'shuffling' && (
                <div className="grid grid-cols-4 gap-4 animate-pulse">
                    {shuffledParticipants.map(p => (
                        <div key={p.id} className="text-2xl p-4 bg-white/5 rounded-full border border-white/10">
                            {p.avatar}
                        </div>
                    ))}
                </div>
            )}

            {(step === 'drawing' || step === 'review') && (
                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    <AnimatePresence>
                        {validFixtures.slice(0, revealedCount).map((fixture, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{getPlayerAvatar(fixture.team1[0])}</span>
                                    <span className="font-bold text-sm">{getPlayerName(fixture.team1[0])}</span>
                                </div>
                                <span className="text-xs font-black text-gray-500">VS</span>
                                <div className="flex items-center gap-2 flex-row-reverse">
                                    <span className="text-xl">{getPlayerAvatar(fixture.team2[0])}</span>
                                    <span className="font-bold text-sm">{getPlayerName(fixture.team2[0])}</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {step === 'review' && (
                <div className="flex gap-3 pt-4 animate-in fade-in slide-in-from-bottom duration-500">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setStep('shuffling');
                            setRevealedCount(0);
                        }}
                        className="flex-1"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> Repetir Sorteo
                    </Button>
                    <Button
                        glow
                        onClick={() => onConfirm(generatedFixtures)}
                        className="flex-1"
                    >
                        <Check className="w-4 h-4 mr-2" /> Confirmar Fixture
                    </Button>
                </div>
            )}
        </Card>
    );
}
