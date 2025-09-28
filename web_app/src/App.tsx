import { useState } from 'react';
import { Home, Gamepad2, MessageCircle, BarChart3, Calendar } from 'lucide-react';
import HomePage from './components/HomePage';
import Gaming from './components/Gaming';
import AcademicStressGamePage from './components/AcademicStressGamePage';
import PixelHarmonyGamePage from './components/PixelHarmonyGamePage';
import Chat from './components/Chat';
import RedditDashboard from './components/RedditDashboard';
import CommunityEvent from './components/CommunityEvent';
import Login from './components/Login';
import BottomNav from './components/BottomNav';
import { SessionProvider, useSession } from './utils/sessionContext';

function AppContent() {
  const { user, isLoggedIn } = useSession();
  const [currentView, setCurrentView] = useState<'home' | 'gaming' | 'academic-stress-game' | 'pixel-harmony-game' | 'chat' | 'community' | 'dashboard'>('home');
  const [darkMode] = useState(false);
  const [chatInitialization, setChatInitialization] = useState<{samhUsername: string} | null>(null);





  const handleNavigate = (view: string) => {
    setCurrentView(view as any);
  };

  const handleNavigateToChat = (samhUsername: string) => {
    console.log('Navigating to chat with SAMH username:', samhUsername);
    setChatInitialization({ samhUsername });
    setCurrentView('chat');
  };


  const clearChatInitialization = () => {
    setChatInitialization(null);
  };

  const navigation = [
    { id: 'home', label: 'Home', icon: Home, description: 'Platform Overview' },
    ...(user?.accountType === 'user' ? [{ id: 'gaming', label: 'Gaming', icon: Gamepad2, description: 'Gaming Hub & Sessions' }] : []),
    { id: 'chat', label: 'Chat', icon: MessageCircle, description: 'Chat Support' },
    ...(user?.accountType === 'user' ? [{ id: 'community', label: 'Community Event', icon: Calendar, description: 'Community Events & Activities' }] : []),
    ...(user?.accountType === 'admin' ? [{ id: 'dashboard', label: 'Dashboard', icon: BarChart3, description: 'Reddit Data Dashboard' }] : []),
  ];

  // Show login screen if not logged in (after all hooks)
  if (!isLoggedIn) {
    return <Login darkMode={darkMode} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white' 
        : 'bg-gradient-to-br from-blue-50 via-white to-pink-50 text-slate-800'
    }`}>
        

      <div className="pb-20">
        {/* Main Content */}
        <main>
          {currentView === 'home' && <HomePage darkMode={darkMode} />}
          {currentView === 'gaming' && user?.accountType === 'user' && <Gaming darkMode={darkMode} onNavigate={handleNavigate} />}
          {currentView === 'academic-stress-game' && user?.accountType === 'user' && (
            <AcademicStressGamePage onBack={() => setCurrentView('gaming')} />
          )}
          {currentView === 'pixel-harmony-game' && user?.accountType === 'user' && (
            <PixelHarmonyGamePage darkMode={darkMode} onNavigate={handleNavigate} />
          )}
          {currentView === 'chat' && <Chat darkMode={darkMode} initializationData={chatInitialization || undefined} onInitializationComplete={clearChatInitialization} onNavigate={handleNavigate} navigation={navigation} />}
          {currentView === 'community' && <CommunityEvent darkMode={darkMode} />}
          {currentView === 'dashboard' && <RedditDashboard darkMode={darkMode} onNavigateToChat={handleNavigateToChat} />}
        </main>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentView={currentView} onNavigate={handleNavigate} />

    </div>
  );
}

function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}

export default App;