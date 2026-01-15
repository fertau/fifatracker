import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SessionProvider } from './context/SessionContext';
import { Layout } from './components/layout/Layout';
import { ProfileSelection } from './pages/profile/ProfileSelection';
import { NewMatch } from './pages/match/NewMatch';
import { NewTournament } from './pages/tournament/NewTournament';
import { SessionManage } from './pages/session/SessionManage';
import { SessionSetup } from './pages/session/SessionSetup';
import { TournamentDetails } from './pages/tournament/TournamentDetails';
import { MatchHistory } from './pages/match/MatchHistory';
import { FriendsList } from './pages/social/FriendsList';
import { HomePage } from './pages/HomePage';
import { StatsPage } from './pages/StatsPage';
import { PlayMenu } from './pages/PlayMenu';
import { ProfilePage } from './pages/profile/ProfilePage';
import type { Player } from './types';

function MainApp() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  if (!currentPlayer) {
    return <ProfileSelection onSelect={setCurrentPlayer} />;
  }

  return (
    <BrowserRouter>
      <Layout player={currentPlayer}>
        <Routes>
          <Route path="/" element={<HomePage player={currentPlayer} />} />
          <Route path="/play" element={<PlayMenu />} />
          <Route path="/profile" element={
            <ProfilePage player={currentPlayer} onLogout={() => setCurrentPlayer(null)} />
          } />
          <Route path="/session/new" element={<SessionSetup currentUser={currentPlayer} />} />
          <Route path="/session/manage" element={<SessionManage currentUser={currentPlayer} />} />
          <Route path="/stats" element={<StatsPage player={currentPlayer} />} />
          <Route path="/history" element={<MatchHistory currentUser={currentPlayer} />} />
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
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <SessionProvider>
            <MainApp />
          </SessionProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
