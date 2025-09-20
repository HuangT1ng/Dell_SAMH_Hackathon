import { useState, useEffect } from 'react';
import { Home, Heart, Brain, Gamepad2, MessageCircle, LogOut, BarChart3, Calendar, User, Menu } from 'lucide-react';
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
  const [isMobile, setIsMobile] = useState(false);
  const [showNav, setShowNav] = useState(true);

  // Detect screen size for responsive navigation
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:opacity-80"
                style={{ backgroundColor: '#4a6cf7' }}
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                <Brain className="w-5 h-5 text-white" />
              </button>
              <div className="flex flex-col">
                <span className={`text-lg font-bold ${
                  darkMode ? 'text-white' : 'text-slate-800'
                }`}>
                  SAMH
                </span>
                <span className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-slate-500'
                }`}>
                  {user?.username} ({user?.accountType})
                </span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            {!isMobile && showNav && (
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
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </nav>
            )}
            
            {/* Right side buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNav(!showNav)}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  showNav
                    ? darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-slate-600'
                    : darkMode
                      ? 'hover:bg-gray-700 text-white'
                      : 'hover:bg-gray-100 text-slate-600'
                }`}
                title={showNav ? "Hide Navigation" : "Show Navigation"}
              >
                <Menu className="w-4 h-4" />
              </button>
              
              <button
                onClick={logout}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-red-400' 
                    : 'bg-white hover:bg-gray-100 text-red-600'
                }`}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Tabs */}
        {isMobile && showNav && (
          <nav className={`px-2 py-2 ${
            darkMode 
              ? 'bg-[#40414F]' 
              : 'bg-white'
          }`}>
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {navigation.map(({ id, label, icon: Icon, description }) => (
                <button
                  key={id}
                  onClick={() => setCurrentView(id as any)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 flex-shrink-0 min-w-[80px] ${
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
                  <Icon size={20} />
                  <span className="text-xs whitespace-nowrap">{label}</span>
                </button>
              ))}
            </div>
          </nav>
        )}
      </header>

      <div className={`px-2 py-4 ${isMobile ? 'pb-20' : 'pb-8'}`}>
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