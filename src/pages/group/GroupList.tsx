import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Plus, ChevronRight } from 'lucide-react';
import { useGroups } from '../../hooks/useGroups';
import { usePlayers } from '../../hooks/usePlayers';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Player } from '../../types';

interface GroupListProps {
    currentUser: Player;
}

export function GroupList({ currentUser }: GroupListProps) {
    const navigate = useNavigate();
    const { groups, createGroup } = useGroups(currentUser.id);
    const { players } = usePlayers();

    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([currentUser.id]);

    const handleCreate = async () => {
        if (!newName.trim() || selectedMembers.length < 2) return;
        const group = await createGroup(newName.trim(), selectedMembers);
        setShowCreate(false);
        setNewName('');
        setSelectedMembers([currentUser.id]);
        navigate(`/group/${group.id}`);
    };

    const toggleMember = (id: string) => {
        if (id === currentUser.id) return; // Can't remove yourself
        setSelectedMembers(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    Mis Grupos
                </h2>
                <p className="text-gray-400 text-sm">Organiza tus rivalidades por grupo</p>
            </div>

            <Button onClick={() => setShowCreate(!showCreate)} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Crear Grupo
            </Button>

            {showCreate && (
                <Card glass className="p-4 space-y-4">
                    <input
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="Nombre del grupo..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    />

                    <div>
                        <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest">Miembros</p>
                        <div className="grid grid-cols-2 gap-2">
                            {players.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => toggleMember(p.id)}
                                    aria-label={`${selectedMembers.includes(p.id) ? 'Quitar' : 'Agregar'} ${p.name}`}
                                    aria-pressed={selectedMembers.includes(p.id)}
                                    className={`flex items-center gap-2 p-2 rounded-xl text-sm transition-all ${
                                        selectedMembers.includes(p.id)
                                            ? 'bg-primary/20 border border-primary/30'
                                            : 'bg-white/5 border border-white/5'
                                    } ${p.id === currentUser.id ? 'opacity-60' : ''}`}
                                >
                                    <span className="text-lg">{p.avatar}</span>
                                    <span className="truncate">{p.name}</span>
                                    {p.id === currentUser.id && <span className="text-[10px] text-primary font-bold">TÚ</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={handleCreate}
                        disabled={!newName.trim() || selectedMembers.length < 2}
                        className="w-full"
                    >
                        Crear ({selectedMembers.length} miembros)
                    </Button>
                </Card>
            )}

            {groups.length === 0 && !showCreate && (
                <EmptyState
                    icon={<Users className="w-8 h-8" />}
                    title="Sin grupos"
                    description="Creá un grupo para ver rankings entre amigos"
                />
            )}

            <div className="space-y-2">
                {groups.map(group => (
                    <Link key={group.id} to={`/group/${group.id}`}>
                        <Card glass className="p-4 group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-primary/10">
                                        <Users className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">{group.name}</h3>
                                        <p className="text-xs text-gray-400">{group.members.length} miembros</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
