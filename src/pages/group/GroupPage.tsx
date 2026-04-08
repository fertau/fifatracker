import { useParams, Navigate } from 'react-router-dom';
import { Users, Trophy, LogOut, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useGroupRankings } from '../../hooks/useGroups';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import type { Player } from '../../types';

interface GroupPageProps {
    currentUser: Player;
}

export function GroupPage({ currentUser }: GroupPageProps) {
    const { id } = useParams<{ id: string }>();
    const { groups, updateGroup, deleteGroup, getPlayer } = useData();

    const group = groups.find(g => g.id === id);
    const rankings = useGroupRankings(group);

    if (!group) {
        return <Navigate to="/groups" replace />;
    }

    const isCreator = group.createdBy === currentUser.id;

    const handleLeave = async () => {
        if (!confirm('¿Salir del grupo?')) return;
        await updateGroup(group.id, {
            members: group.members.filter(id => id !== currentUser.id)
        });
    };

    const handleDelete = async () => {
        if (!confirm('¿Eliminar el grupo? Esta acción no se puede deshacer.')) return;
        await deleteGroup(group.id);
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 inline-block">
                    <Users className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold font-heading">{group.name}</h2>
                <p className="text-gray-400 text-sm">{group.members.length} miembros</p>
            </div>

            {/* Members */}
            <Card glass className="p-4">
                <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Miembros</h3>
                <div className="flex flex-wrap gap-2">
                    {group.members.map(memberId => {
                        const p = getPlayer(memberId);
                        return (
                            <div key={memberId} className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5">
                                <span className="text-lg">{p?.avatar || '👤'}</span>
                                <span className="text-sm">{p?.name || 'Jugador'}</span>
                                {memberId === currentUser.id && (
                                    <span className="text-[8px] text-primary font-bold">TÚ</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Group Rankings */}
            <Card glass className="overflow-hidden">
                <div className="p-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-bold uppercase tracking-widest text-sm">Ranking del Grupo</h3>
                </div>
                {rankings.length > 0 ? (
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-white/5 text-gray-400 uppercase tracking-wider font-bold">
                                <th className="p-3 text-center">#</th>
                                <th className="p-3">Jugador</th>
                                <th className="p-3 text-center">PJ</th>
                                <th className="p-3 text-center">W</th>
                                <th className="p-3 text-center">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {rankings.map((p, idx) => (
                                <tr key={p.id} className={p.id === currentUser.id ? 'bg-primary/10' : 'hover:bg-white/5'}>
                                    <td className="p-3 text-center font-mono font-bold text-gray-500">{idx + 1}</td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{p.avatar}</span>
                                            <span className="font-bold">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-center text-gray-400 font-mono">{p.matchesPlayed}</td>
                                    <td className="p-3 text-center text-green-500 font-mono font-bold">{p.wins}</td>
                                    <td className="p-3 text-center font-black font-mono text-primary">{p.score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-6 text-center text-gray-400 text-sm">
                        Sin partidos entre miembros del grupo todavía
                    </div>
                )}
            </Card>

            {/* Actions */}
            <div className="space-y-2">
                {!isCreator && (
                    <Button variant="ghost" className="w-full text-red-400" onClick={handleLeave}>
                        <LogOut className="w-4 h-4 mr-2" /> Salir del grupo
                    </Button>
                )}
                {isCreator && (
                    <Button variant="ghost" className="w-full text-red-400" onClick={handleDelete}>
                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar grupo
                    </Button>
                )}
            </div>
        </div>
    );
}
