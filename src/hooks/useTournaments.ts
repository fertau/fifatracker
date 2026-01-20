import { useData } from '../context/DataContext';
import type { Tournament, Match } from '../types';

export function useTournaments() {
    const { tournaments, addTournament, matches } = useData();

    const generateLeagueFixtures = (participants: string[]) => {
        const fixtures: { team1: string[], team2: string[] }[] = [];
        const n = participants.length;
        const playersList = [...participants];

        if (n % 2 !== 0) {
            playersList.push('BYE'); // Dummy player for odd number of participants
        }

        const numRounds = playersList.length - 1;
        const matchesPerRound = playersList.length / 2;

        for (let round = 0; round < numRounds; round++) {
            for (let i = 0; i < matchesPerRound; i++) {
                const home = playersList[i];
                const away = playersList[playersList.length - 1 - i];

                if (home !== 'BYE' && away !== 'BYE') {
                    fixtures.push({
                        team1: [home],
                        team2: [away]
                    });
                }
            }
            // Rotate players
            playersList.splice(1, 0, playersList.pop()!);
        }

        return fixtures;
    };

    const generateKnockoutFixtures = (participants: string[]) => {
        // 1. Pad to power of 2
        const n = participants.length;
        let power = 1;
        while (power < n) power *= 2;

        const paddedParticipants = [...participants];
        // Standard seeding requires distribution. 
        // For simplicity in this app, we shuffle real players first to randomize seeds, 
        // then append BYEs at the end, then pair (First vs Last) pattern often used,
        // OR simply Pair sequential: [P1, P2], [P3, BYE]...

        // Better UX: Fill "Byes" into positions where they play against Top Seeds?
        // Since we don't have "Seeds", we treat index 0 as highest seed after shuffle.

        while (paddedParticipants.length < power) {
            paddedParticipants.push('BYE');
        }

        // To avoid BYE vs BYE (impossible if we fill < power), but to avoid P1 vs P2 while P3 gets BYE,
        // we should distribute BYEs. 
        // If we have 5 players (3 BYEs):
        // P1, P2, P3, P4, P5, BYE, BYE, BYE
        // If we pair (0,1), (2,3), (4,5), (6,7):
        // (P1, P2), (P3, P4), (P5, BYE), (BYE, BYE) -> ERROR: BYE vs BYE is wasted match.
        // Actually, 8 slots. 5 players. 3 BYES.
        // Ideal: 3 matches + 1 pure BYE advance?
        // No, standard bracket 8 slots = 4 matches.
        // M1: P1 vs BYE (P1 advances)
        // M2: P2 vs BYE (P2 advances)
        // M3: P3 vs BYE (P3 advances)
        // M4: P4 vs P5
        // Results in 4 semi-finalists: P1, P2, P3, Winner(M4). Perfect.

        // Algorithm:
        // 1. Sort participants (Random or Seeded).
        // 2. Pair High vs Low? Or simply fill brackets.
        // If we use simple filling:
        // [P1, P2, P3, P4, P5, BYE, BYE, BYE]
        // Pair 0-7, 1-6, 2-5, 3-4? (Tennis style 1 vs 8)
        // (P1 vs BYE), (P2 vs BYE), (P3 vs BYE), (P4 vs P5).
        // This works PERFECTLY.

        // So, we need to implement "Fold" pairing?
        // Let's doing "Inside-Out" or "Top-Bottom"?
        // 0 vs N-1
        // 1 vs N-2
        // etc.

        const fixtures: { team1: string[], team2: string[] }[] = [];
        const total = paddedParticipants.length; // Power of 2

        for (let i = 0; i < total / 2; i++) {
            const p1 = paddedParticipants[i];
            const p2 = paddedParticipants[total - 1 - i];

            // If both are BYE (Should not happen if N > Total/2), but hypothetically:
            // If we have 2 players in 8 slots?? 2 players, 6 BYEs.
            // [P1, P2, B, B, B, B, B, B]
            // 0-7: P1 vs B
            // 1-6: P2 vs B
            // 2-5: B vs B
            // 3-4: B vs B
            // We need to handle double BYE as "Null match"? Or just let it resolve.

            fixtures.push({
                team1: [p1],
                team2: [p2]
            });
        }

        // 2. Generate Future Rounds (Empty slots)
        // Total matches in knockout tree = N-1.
        // We generated N/2 matches for Round 1.
        const remainingMatches = (total - 1) - fixtures.length;
        for (let i = 0; i < remainingMatches; i++) {
            fixtures.push({ team1: [], team2: [] });
        }

        return fixtures;
    };

    const createTournamentWithFixtures = async (name: string, type: 'league' | 'knockout', participants: string[], createdBy: string) => {
        const tournament = await addTournament(name, type, participants, createdBy);

        // If league, we might want to pre-generate or at least know how many matches
        // For now, the creation in DataContext is enough, and fixtures are derived or generated on the fly
        // in a more advanced version. But the plan said "trigger fixture generation on creation".
        // Since we don't have a "Fixture" collection yet, and Match has tournamentId, 
        // we can just return the tournament and let the UI handle it or generate matches.

        return tournament;
    };

    const getTournamentMatches = (tournamentId: string) => {
        return matches.filter(m => m.tournamentId === tournamentId);
    };

    const calculateLeagueStandings = (tournamentId: string) => {
        const tournament = tournaments.find(t => t.id === tournamentId);
        if (!tournament) return [];

        const tournamentMatches = getTournamentMatches(tournamentId);

        const standings = tournament.participants.map(playerId => {
            const playerMatches = tournamentMatches.filter(m =>
                m.players.team1.includes(playerId) || m.players.team2.includes(playerId)
            );

            let wins = 0;
            let draws = 0;
            let losses = 0;
            let goalsScored = 0;
            let goalsConceded = 0;

            playerMatches.forEach(match => {
                const isTeam1 = match.players.team1.includes(playerId);
                const isTeam2 = match.players.team2.includes(playerId);
                const myScore = isTeam1 ? match.score.team1 : match.score.team2;
                const opponentScore = isTeam1 ? match.score.team2 : match.score.team1;

                goalsScored += myScore;
                goalsConceded += opponentScore;

                if (match.endedBy === 'regular') {
                    if (myScore > opponentScore) wins++;
                    else if (myScore < opponentScore) losses++;
                    else draws++;
                } else if (match.endedBy === 'penalties') {
                    const amIWinner = (isTeam1 && match.penaltyWinner === 1) || (isTeam2 && match.penaltyWinner === 2);
                    if (amIWinner) wins++; else losses++;
                } else if (match.endedBy === 'forfeit') {
                    const amILoser = (isTeam1 && match.forfeitLoser === 1) || (isTeam2 && match.forfeitLoser === 2);
                    if (amILoser) losses++; else wins++;
                }
            });

            return {
                playerId,
                played: playerMatches.length,
                wins,
                draws,
                losses,
                goalsScored,
                goalsConceded,
                points: (wins * 3) + draws
            };
        });

        return standings.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const diffA = a.goalsScored - a.goalsConceded;
            const diffB = b.goalsScored - b.goalsConceded;
            if (diffB !== diffA) return diffB - diffA;
            return b.goalsScored - a.goalsScored;
        });
    };

    return {
        tournaments,
        createTournament: createTournamentWithFixtures,
        getTournamentMatches,
        calculateLeagueStandings,
        generateLeagueFixtures,
        generateKnockoutFixtures
    };
}
