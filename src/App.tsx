import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SessionProvider, useSession } from './context/SessionContext';
import { Layout } from './components/layout/Layout';
import { ProfileSelection } from './pages/profile/ProfileSelection';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { NewMatch } from './pages/match/NewMatch';
import { NewTournament } from './pages/tournament/NewTournament';
import { SessionManage } from './pages/session/SessionManage';
import { SessionSetup } from './pages/session/SessionSetup';
import { TournamentDetails } from './pages/tournament/TournamentDetails';
import type { Player } from './types';
import { MatchHistory } from './pages/match/MatchHistory';
import { FriendsList } from './pages/social/FriendsList';
import { Trophy, Play, Users, History } from 'lucide-react';

function HomePage({ player }: { player: Player }) {
  const { isSessionActive, session, endSession } = useSession();

  return (
    <div className="space-y-6">
      <Card className="text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <h2 className="text-3xl font-bold mb-2">Hola, {player.name}</h2>

        {!isSessionActive ? (
          <div className="space-y-4">
            <p className="text-gray-400 mb-2">¿Estás con amigos?</p>
            <Link to="/session/new">
              <Button size="lg" glow className="w-full animate-pulse">
                <Play className="w-5 h-5 fill-current" /> INICIAR SESIÓN
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary font-bold bg-primary/10 py-1 rounded-full text-xs uppercase tracking-widest border border-primary/20">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Sesión Activa ({session?.playersPresent.length} jugadores)
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link to="/match/new">
                <Button size="md" glow className="w-full">
                  PARTIDO RÁPIDO
                </Button>
              </Link>
              <Link to="/tournament/new">
                <Button size="md" variant="secondary" className="w-full">
                  <Trophy className="w-4 h-4" /> NUEVO TORNEO
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link to="/history">
                <Button variant="ghost" className="w-full border border-white/10 hover:bg-white/5 text-xs">
                  <History className="w-4 h-4 mr-2" /> HISTORIAL
                </Button>
              </Link>
              <Link to="/friends">
                <Button variant="ghost" className="w-full border border-white/10 hover:bg-white/5 text-xs">
                  <Users className="w-4 h-4 mr-2" /> MIS AMIGOS
                </Button>
              </Link>
            </div>

            <div className="flex justify-between items-center px-2">
              <Link to="/session/manage" className="text-xs text-primary hover:text-primary/80 underline decoration-primary/50">
                Gestionar Jugadores
              </Link>
              <button onClick={endSession} className="text-xs text-red-400 hover:text-red-300 underline decoration-red-400/50">
                Finalizar Sesión
              </button>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card glass className="p-4 flex flex-col items-center justify-center gap-2 relative">
          <Link to="/friends" className="absolute top-2 right-2 text-primary hover:text-white">
            <Users className="w-4 h-4" />
          </Link>
          <span className="text-4xl font-bold text-primary">{player.stats.matchesPlayed}</span>
          <span className="text-xs text-gray-400 uppercase">Partidos</span>
        </Card>
        <Card glass className="p-4 flex flex-col items-center justify-center gap-2">
          <span className="text-4xl font-bold text-secondary">{player.stats.wins}</span>
          <span className="text-xs text-gray-400 uppercase">Victorias</span>
        </Card>
      </div>
    </div>
  );
}

function MainApp() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  if (!currentPlayer) {
    return <ProfileSelection onSelect={setCurrentPlayer} />;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage player={currentPlayer} />} />
          <Route path="/profile" element={
            <div className="text-center mt-10 space-y-4">
              <div className="text-6xl mb-4">{currentPlayer.avatar}</div>
              <h2 className="text-3xl font-bold">{currentPlayer.name}</h2>
              <Button variant="outline" onClick={() => setCurrentPlayer(null)}>
                Cambiar Perfil
              </Button>
            </div>
          } />
          <Route path="/session/new" element={<SessionSetup currentUser={currentPlayer} />} />
          <Route path="/session/manage" element={<SessionManage currentUser={currentPlayer} />} />
          <Route path="/history" element={<MatchHistory />} />
          <Route path="/friends" element={<FriendsList currentUser={currentPlayer} />} />
          <Route path="/match/new" element={<NewMatch />} />
          <Route path="/tournament/new" element={<NewTournament />} />
          <Route path="/tournament/:id" element={<TournamentDetails />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

import { DataProvider } from './context/DataContext';

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <SessionProvider>
          <MainApp />
        </SessionProvider>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
