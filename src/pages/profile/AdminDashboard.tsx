import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Edit2,
    Trash2,
    Lock,
    Shield,
    Check,
    X,
    Eye,
    EyeOff
} from 'lucide-react';
import { usePlayers } from '../../hooks/usePlayers';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { Player } from '../../types';

export function AdminDashboard() {
    const { players, updatePlayer, deletePlayer } = usePlayers();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
    const [editName, setEditName] = useState('');
    const [editPin, setEditPin] = useState('');

    const filteredPlayers = players.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));

    const handleEdit = (player: Player) => {
        setEditingPlayer(player);
        setEditName(player.name);
        setEditPin(player.pin);
    };

    const handleSave = async () => {
        if (!editingPlayer) return;
        try {
            await updatePlayer(editingPlayer.id, {
                name: editName,
                pin: editPin
            });
            setEditingPlayer(null);
        } catch (error) {
            console.error('Error updating player:', error);
            alert('Error al actualizar el jugador');
        }
    };

    const handleDelete = async (player: Player) => {
        if (player.name.toLowerCase() === 'fertau') {
            alert('No puedes eliminar al administrador principal');
            return;
        }
        if (confirm(`¿Estás seguro de eliminar a ${player.name}? Esta acción es irreversible.`)) {
            try {
                await deletePlayer(player.id);
            } catch (error) {
                console.error('Error deleting player:', error);
            }
        }
    };

    const togglePin = async (player: Player) => {
        try {
            await updatePlayer(player.id, { isPinned: !player.isPinned });
        } catch (error) {
            console.error('Error toggling pin:', error);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-24">
            <header className="flex items-center justify-between">
                <div
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate(-1)}
                >
                    <Shield className="w-8 h-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold font-heading italic uppercase tracking-tighter">
                            Admin Console
                        </h1>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Gestión Global de Usuarios</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black tracking-widest text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20 uppercase">
                        Modo Dios
                    </span>
                </div>
            </header>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                    type="text"
                    placeholder="BUSCAR JUGADOR..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-primary transition-all font-bold uppercase tracking-widest placeholder:text-gray-700"
                />
            </div>

            <div className="grid gap-3">
                {filteredPlayers.map(player => (
                    <Card key={player.id} glass className="p-4 flex items-center justify-between border-white/5 bg-white/[0.02] hover:border-primary/20 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-surface border-2 border-primary/20 flex items-center justify-center text-3xl">
                                {player.avatar}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-heading font-bold uppercase">{player.name}</h3>
                                    {player.isPinned === false && (
                                        <EyeOff className="w-3 h-3 text-gray-600" aria-label="Oculto" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold tracking-widest">
                                    <Lock className="w-3 h-3" />
                                    PIN: {player.pin}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => togglePin(player)}
                                className={`p-2 rounded-xl transition-colors ${player.isPinned === false ? 'bg-gray-500/10 text-gray-500' : 'bg-primary/10 text-primary'}`}
                                aria-label={player.isPinned === false ? "Mostrar en inicio" : "Ocultar de inicio"}
                            >
                                {player.isPinned === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => handleEdit(player)}
                                className="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                                aria-label="Editar Perfil"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(player)}
                                className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                aria-label="Eliminar Perfil"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Edit Modal */}
            {editingPlayer && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-sm p-6 space-y-6 border-primary/30">
                        <div className="text-center">
                            <h2 className="text-xl font-bold font-heading uppercase italic">Editar a {editingPlayer.name}</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">Nickname</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors font-bold uppercase"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest ml-1">PIN de Seguridad</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={editPin}
                                    onChange={(e) => setEditPin(e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors font-mono tracking-widest"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button variant="ghost" className="flex-1" onClick={() => setEditingPlayer(null)}>
                                <X className="w-4 h-4 mr-2" /> CANCELAR
                            </Button>
                            <Button glow className="flex-1" onClick={handleSave}>
                                <Check className="w-4 h-4 mr-2" /> GUARDAR
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
