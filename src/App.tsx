import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SessionProvider } from './context/SessionContext';
import { Layout } from './components/layout/Layout';
import { ProfileSelection } from './pages/profile/ProfileSelection';
import { Button } from './components/ui/Button';
import { NewMatch } from './pages/match/NewMatch';
import { NewTournament } from './pages/tournament/NewTournament';
import { SessionManage } from './pages/session/SessionManage';
import { SessionSetup } from './pages/session/SessionSetup';
import { TournamentDetails } from './pages/tournament/TournamentDetails';
import { MatchHistory } from './pages/match/MatchHistory';
import { FriendsList } from './pages/social/FriendsList';
import { HomePage } from './pages/HomePage';
import { StatsPage } from './pages/StatsPage';
import type { Player } from './types';

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
              {currentPlayer.photoURL ? (
                <img src={currentPlayer.photoURL} alt={currentPlayer.name} className="w-24 h-24 rounded-full mx-auto border-4 border-primary/50" />
              ) : (
                <div className="text-6xl mb-4">{currentPlayer.avatar}</div>
              )}
              <h2 className="text-3xl font-bold">{currentPlayer.name}</h2>
              <Button variant="outline" onClick={() => setCurrentPlayer(null)}>
                Cambiar Perfil
              </Button>
            </div>
          } />
          <Route path="/session/new" element={<SessionSetup currentUser={currentPlayer} />} />
          <Route path="/session/manage" element={<SessionManage currentUser={currentPlayer} />} />
          <Route path="/stats" element={<StatsPage player={currentPlayer} />} />
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
