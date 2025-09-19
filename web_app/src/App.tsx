import { useState, useEffect } from 'react';
import { Home, Heart, Moon, Sun, Brain, Gamepad2, MessageCircle, LogOut, BarChart3, Calendar, User } from 'lucide-react';
import HomePage from './components/HomePage';
import MoodBar from './components/MoodBar';
import Gaming from './components/Gaming';
import Chat from './components/Chat';
import RedditDashboard from './components/RedditDashboard';
import CommunityEvent from './components/CommunityEvent';
import MyJourney from './components/MyJourney';
import UserJourneyModal from './components/UserJourneyModal';
import Login from './components/Login';
import { sharedDatabase, type MoodEntry } from './utils/sharedDatabase';
import { SessionProvider, useSession } from './utils/sessionContext';

function AppContent() {
  const { user, logout, isLoggedIn } = useSession();
  const [currentView, setCurrentView] = useState<'home' | 'mood' | 'gaming' | 'chat' | 'community' | 'dashboard' | 'journey'>('home');
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [chatInitialization, setChatInitialization] = useState<{samhUsername: string} | null>(null);
  const [userJourneyModal, setUserJourneyModal] = useState<{isOpen: boolean, targetUsername: string}>({
    isOpen: false,
    targetUsername: ''
  });

  useEffect(() => {
    const loadMoodEntries = async () => {
      try {
        // Try to load from shared database first
        await sharedDatabase.initialize();
        const dbEntries = await sharedDatabase.getAllMoodEntries();
        setEntries(dbEntries);
        console.log('✅ Loaded mood entries from shared database');
      } catch (error) {
        console.warn('⚠️ Shared database not available, falling back to localStorage');
        // Fallback to localStorage if shared database is not available
        const savedEntries = localStorage.getItem('moodEntries');
        if (savedEntries) {
          setEntries(JSON.parse(savedEntries));
        }
      }
    };

    loadMoodEntries();
  }, []);

  const saveEntry = async (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => {
    const newEntry: MoodEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    try {
      // Try to save to shared database first
      await sharedDatabase.addMoodEntry(newEntry);
      console.log('✅ Saved mood entry to shared database');
      
      // Update local state
      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
    } catch (error) {
      console.warn('⚠️ Shared database not available, saving to localStorage');
      // Fallback to localStorage
      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
      localStorage.setItem('moodEntries', JSON.stringify(updatedEntries));
    }

    setCurrentView('mood');
  };

  const handleNavigateToChat = (samhUsername: string) => {
    console.log('Navigating to chat with SAMH username:', samhUsername);
    setChatInitialization({ samhUsername });
    setCurrentView('chat');
  };

  const handleNavigateToUserJourney = (samhUsername: string) => {
    console.log('Opening user journey modal for SAMH username:', samhUsername);
    setUserJourneyModal({
      isOpen: true,
      targetUsername: samhUsername
    });
  };

  const closeUserJourneyModal = () => {
    setUserJourneyModal({
      isOpen: false,
      targetUsername: ''
    });
  };

  const clearChatInitialization = () => {
    setChatInitialization(null);
  };

  const navigation = [
    { id: 'home', label: 'Home', icon: Home, description: 'Platform Overview' },
    ...(user?.accountType === 'user' ? [{ id: 'journey', label: 'My Journey', icon: User, description: 'Personal Journey & Progress' }] : []),
    { id: 'mood', label: 'Mood Bar', icon: Heart, description: 'Mood Tracking & Analytics' },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2, description: 'Gaming Hub & Sessions' },
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
        ? 'bg-[#343541] text-white' 
        : 'text-slate-800'
    }`} style={{ backgroundColor: darkMode ? undefined : '#f1efef' }}>
      {/* Header */}
      <header className={`border-b transition-colors duration-300 ${
        darkMode 
          ? 'bg-[#40414F] border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#4a6cf7' }}>
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className={`text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-slate-800'
                }`}>
                  SAMH Platform
                </span>
                <span className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-slate-500'
                }`}>
                  Welcome, {user?.username} ({user?.accountType}) • Tab Session
                </span>
              </div>
            </div>
            
            {/* Main Navigation */}
            <nav className="flex items-center gap-1">
              {navigation.map(({ id, label, icon: Icon, description }) => (
                <button
                  key={id}
                  onClick={() => setCurrentView(id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentView === id
                      ? 'text-white shadow-lg'
                      : darkMode 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                        : 'text-slate-600 hover:bg-white hover:text-slate-800'
                  }`}
                  style={{
                    backgroundColor: currentView === id ? '#4a6cf7' : undefined
                  }}
                  title={description}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline text-sm">{label}</span>
                </button>
              ))}
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`ml-4 p-2 rounded-lg transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                    : 'bg-white hover:bg-gray-100 text-slate-600'
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button
                onClick={logout}
                className={`ml-2 p-2 rounded-lg transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-red-400' 
                    : 'bg-white hover:bg-gray-100 text-red-600'
                }`}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content */}
        <main>
          {currentView === 'home' && <HomePage darkMode={darkMode} />}
          {currentView === 'journey' && <MyJourney darkMode={darkMode} />}
          {currentView === 'mood' && (
            <MoodBar 
              entries={entries} 
              onAddEntry={saveEntry} 
              darkMode={darkMode} 
            />
          )}
          {currentView === 'gaming' && <Gaming darkMode={darkMode} />}
          {currentView === 'chat' && <Chat darkMode={darkMode} initializationData={chatInitialization || undefined} onInitializationComplete={clearChatInitialization} />}
          {currentView === 'community' && <CommunityEvent darkMode={darkMode} />}
          {currentView === 'dashboard' && <RedditDashboard darkMode={darkMode} onNavigateToChat={handleNavigateToChat} onNavigateToUserJourney={handleNavigateToUserJourney} />}
        </main>
      </div>

      {/* User Journey Modal */}
      <UserJourneyModal
        isOpen={userJourneyModal.isOpen}
        onClose={closeUserJourneyModal}
        targetUsername={userJourneyModal.targetUsername}
        darkMode={darkMode}
      />
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