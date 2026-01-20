import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import type { Tournament, Match, Player } from '../../types';

interface KnockoutBracketProps {
    tournament: Tournament;
    matches: Match[];
    getPlayer: (id: string) => Player | undefined;
}

interface BracketNode {
    id: number; // Index in fixtures array
    round: number;
    team1: string[];
    team2: string[];
    match?: Match; // The match record if played
    status: 'pending' | 'ready' | 'completed';
    winner?: string | null;
}

export function KnockoutBracket({ tournament, matches, getPlayer }: KnockoutBracketProps) {
    const bracket = useMemo(() => {
        if (!tournament.fixtures) return [];

        const fixtures = [...tournament.fixtures];
        const nodes: BracketNode[] = fixtures.map((f, i) => ({
            id: i,
            round: 0,
            team1: [...f.team1],
            team2: [...f.team2],
            match: undefined,
            status: 'pending',
            winner: null
        }));

        // 1. Process Rounds and Linkage
        // We assume fixtures are generated using the standard adjacent logic
        // N matches.
        const totalMatches = fixtures.length;
        const totalParticipants = totalMatches + 1; // Approx

        let round = 1;
        let roundMatches = (totalParticipants / 2); // Start with R1 count
        if (!Number.isInteger(roundMatches)) roundMatches = Math.ceil(totalParticipants / 2); // Handle odd? Logic assumed power of 2.

        let offset = 0;
        let p = 1;
        while (p < totalParticipants) p *= 2;
        let currentRoundSize = p / 2;

        // Iterate through expected structure to assign rounds
        // This relies on generateKnockoutFixtures order: R1 (0..N/2-1), R2 (N/2..N/2+N/4-1), etc.
        let idx = 0;
        while (idx < fixtures.length) {
            for (let i = 0; i < currentRoundSize; i++) {
                if (nodes[idx]) nodes[idx].round = round;
                idx++;
            }
            currentRoundSize /= 2;
            round++;
        }

        // 2. Map Matches and Propagate Winners
        // Top-down simulation
        // Actually, we need to map existing matches to nodes first
        matches.forEach(m => {
            if (m.tournamentFixtureSlot !== undefined && nodes[m.tournamentFixtureSlot]) {
                nodes[m.tournamentFixtureSlot].match = m;
            }
        });

        // 3. Propagate
        // We must process in order (0,1,2...) so parents get updated
        // Propagation Logic:
        // parentIdx = offset + currentRoundSize + floor(localIdx/2)
        // Re-calculate offsets locally

        let processOffset = 0;
        let processRoundSize = p / 2;

        while (processRoundSize >= 1) {
            for (let k = 0; k < processRoundSize; k++) {
                const currentIdx = processOffset + k;
                const node = nodes[currentIdx];
                if (!node) continue;

                // Determine local status/winner
                if (node.match) {
                    node.status = 'completed';
                    // Derive winner
                    if (node.match.endedBy === 'regular') {
                        if (node.match.score.team1 > node.match.score.team2) node.winner = node.match.players.team1[0];
                        else node.winner = node.match.players.team2[0];
                    } else if (node.match.penaltyWinner) {
                        node.winner = node.match.penaltyWinner === 1 ? node.match.players.team1[0] : node.match.players.team2[0];
                    } else if (node.match.forfeitLoser) {
                        node.winner = node.match.forfeitLoser === 1 ? node.match.players.team2[0] : node.match.players.team1[0];
                    }
                } else {
                    // Check if ready (both parents are filled)
                    // Wait, for R1, it is ready if participants are set (which they are initially)
                    if (node.team1.length > 0 && node.team2.length > 0) {
                        node.status = 'ready';
                        // Handle BYE auto-win
                        if (node.team1[0] === 'BYE') node.winner = node.team2[0];
                        else if (node.team2[0] === 'BYE') node.winner = node.team1[0];

                        if (node.winner) node.status = 'completed'; // Auto complete
                    } else {
                        node.status = 'pending';
                    }
                }

                // Propagate to parent if exists
                if (processRoundSize > 1) {
                    const parentIdx = processOffset + processRoundSize + Math.floor(k / 2);
                    const isTeam1Target = k % 2 === 0;
                    if (nodes[parentIdx] && node.winner) {
                        if (isTeam1Target) nodes[parentIdx].team1 = [node.winner];
                        else nodes[parentIdx].team2 = [node.winner];
                    }
                }
            }
            processOffset += processRoundSize;
            processRoundSize /= 2;
        }

        return nodes;
    }, [tournament.fixtures, matches]);

    // Render columns
    const rounds = useMemo(() => {
        const r: BracketNode[][] = [];
        bracket.forEach(node => {
            if (!r[node.round - 1]) r[node.round - 1] = [];
            r[node.round - 1].push(node);
        });
        return r;
    }, [bracket]);

    return (
        <div className="overflow-x-auto pb-6">
            <div className="flex gap-8 min-w-max px-4">
                {rounds.map((roundNodes, roundIdx) => (
                    <div key={roundIdx} className="flex flex-col justify-around gap-8" style={{ marginTop: roundIdx * 40 }}>
                        <div className="text-center mb-4 uppercase text-xs font-bold text-gray-500 tracking-widest">
                            {roundIdx === rounds.length - 1 ? 'FINAL' : `Ronda ${roundIdx + 1}`}
                        </div>
                        {roundNodes.map(node => {
                            const p1 = node.team1[0] ? getPlayer(node.team1[0]) : null;
                            const p2 = node.team2[0] ? getPlayer(node.team2[0]) : null;
                            const isBye = node.team1[0] === 'BYE' || node.team2[0] === 'BYE';

                            return (
                                <motion.div
                                    key={node.id}
                                    className="relative w-64"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <Card glass className={cn(
                                        "p-3 border-l-4 transition-all hover:scale-105",
                                        node.status === 'completed' ? "border-l-primary opacity-60" :
                                            node.status === 'ready' ? "border-l-yellow-500 bg-yellow-500/5 ring-1 ring-yellow-500/20" :
                                                "border-l-gray-700 opacity-40"
                                    )}>
                                        <div className="space-y-2">
                                            {/* Team 1 */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{p1?.avatar || (node.team1[0] === 'BYE' ? '👋' : '❓')}</span>
                                                    <span className={cn("text-xs font-bold", node.winner === node.team1[0] ? "text-primary" : "text-gray-400")}>
                                                        {p1?.name || (node.team1[0] === 'BYE' ? 'BYE' : 'TBD')}
                                                    </span>
                                                </div>
                                                {node.match && <span className="font-mono font-bold text-white">{node.match.score.team1}</span>}
                                            </div>

                                            {/* VS Divider (Implicit) */}

                                            {/* Team 2 */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{p2?.avatar || (node.team2[0] === 'BYE' ? '👋' : '❓')}</span>
                                                    <span className={cn("text-xs font-bold", node.winner === node.team2[0] ? "text-primary" : "text-gray-400")}>
                                                        {p2?.name || (node.team2[0] === 'BYE' ? 'BYE' : 'TBD')}
                                                    </span>
                                                </div>
                                                {node.match && <span className="font-mono font-bold text-white">{node.match.score.team2}</span>}
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        {node.status === 'ready' && !isBye && (
                                            <div className="mt-3 flex justify-end">
                                                <Link to={`/match/new?tournamentId=${tournament.id}&tournamentFixtureSlot=${node.id}&t1=${node.team1[0]}&t2=${node.team2[0]}`}>
                                                    <Button size="sm" variant="outline" className="text-[10px] h-6 py-0 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500 hover:text-black">
                                                        JUGAR
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </Card>

                                    {/* Connector Lines (Simple) */}
                                    {roundIdx < rounds.length - 1 && (
                                        <div className="absolute top-1/2 -right-8 w-8 h-px bg-gray-700/50" />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
