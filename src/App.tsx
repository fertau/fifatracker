import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import { SessionProvider } from './context/SessionContext';
import { Layout } from './components/layout/Layout';
import { ProfileSelection } from './pages/profile/ProfileSelection';
import { NewMatch } from './pages/match/NewMatch';
import { NewTournament } from './pages/tournament/NewTournament';
import { SessionManage } from './pages/session/SessionManage';
import { SessionSetup } from './pages/session/SessionSetup';
import { TournamentDetails } from './pages/tournament/TournamentDetails';
import { TournamentList } from './pages/tournament/TournamentList';
import { MatchHistory } from './pages/match/MatchHistory';
import { FriendsList } from './pages/social/FriendsList';
import { HomePage } from './pages/HomePage';
import { StatsPage } from './pages/StatsPage';
import { PlayMenu } from './pages/PlayMenu';
import { ProfilePage } from './pages/profile/ProfilePage';
import { AdminDashboard } from './pages/profile/AdminDashboard';
import { SplashScreen } from './components/layout/SplashScreen';
import { AnimatePresence } from 'framer-motion';
import type { Player } from './types';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { useRememberedAccounts } from './hooks/useRememberedAccounts';

function MainApp() {
  const { players, loading } = useData();
  const { rememberAccount } = useRememberedAccounts();
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  // Splash Screen timer (2 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Load from persistence
  useEffect(() => {
    if (!currentPlayer && !loading) {
      const savedId = localStorage.getItem('fifa_tracker_current_player_id');
      if (savedId) {
        const p = players.find(p => p.id === savedId);
        if (p && p.pin) {
          setCurrentPlayer(p);
        } else {
          // If player exists but has no PIN, force re-login/setup
          localStorage.removeItem('fifa_tracker_current_player_id');
        }
      }
    }
  }, [players, loading, currentPlayer]);

  // Save to persistence and remember account on this device
  useEffect(() => {
    if (loading) return;
    if (currentPlayer) {
      localStorage.setItem('fifa_tracker_current_player_id', currentPlayer.id);
      // Remember this account on this device for quick login
      rememberAccount(currentPlayer.id);
      if (currentPlayer.name.toLowerCase() === 'fertau') {
        localStorage.setItem('is_fertau_admin', 'true');
      }
    } else {
      localStorage.removeItem('fifa_tracker_current_player_id');
    }
  }, [currentPlayer, loading, rememberAccount]);

  // Keep current player synced with DB
  useEffect(() => {
    if (currentPlayer) {
      const updatedPlayer = players.find(p => p.id === currentPlayer.id);
      if (updatedPlayer && JSON.stringify(updatedPlayer) !== JSON.stringify(currentPlayer)) {
        setCurrentPlayer(updatedPlayer);
      }
    }
  }, [players]);

  const handleLogout = () => {
    localStorage.removeItem('fifa_tracker_current_player_id');
    setCurrentPlayer(null);
    navigate('/', { replace: true });
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>

      {!showSplash && (
        <>
          {loading && !currentPlayer ? (
            <div className="h-screen flex items-center justify-center bg-background text-primary animate-pulse uppercase font-bold tracking-widest">
              Sincronizando...
            </div>
          ) : !currentPlayer ? (
            <ProfileSelection onSelect={setCurrentPlayer} />
          ) : (
            <Layout player={currentPlayer}>
              <Routes>
                <Route path="/" element={<HomePage player={currentPlayer} />} />
                <Route path="/play" element={<PlayMenu />} />
                <Route path="/profile" element={
                  <ProfilePage player={currentPlayer} onLogout={handleLogout} />
                } />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/session/new" element={<SessionSetup currentUser={currentPlayer} />} />
                <Route path="/session/manage" element={<SessionManage currentUser={currentPlayer} />} />
                <Route path="/stats" element={<StatsPage player={currentPlayer} />} />
                <Route path="/history" element={<MatchHistory currentUser={currentPlayer} />} />
                <Route path="/friends" element={<FriendsList currentUser={currentPlayer} />} />
                <Route path="/match/new" element={<NewMatch />} />
                <Route path="/tournaments" element={<TournamentList />} />
                <Route path="/tournament/new" element={<NewTournament currentUser={currentPlayer} />} />
                <Route path="/tournament/:id" element={<TournamentDetails currentUser={currentPlayer} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          )}
        </>
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <SessionProvider>
            <MainApp />
          </SessionProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
