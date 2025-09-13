import { useState, useEffect } from 'react';
import { Home, Heart, Search, Moon, Sun, Brain, Gamepad2, MessageCircle } from 'lucide-react';
import HomePage from './components/HomePage';
import MoodBar from './components/MoodBar';
import ScrapperOutput from './components/ScrapperOutput';
import Gaming from './components/Gaming';
import Chat from './components/Chat';

export interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  moodLabel: string;
  triggers: string[];
  activities: string[];
  notes: string;
  timestamp: number;
}



function App() {
  const [currentView, setCurrentView] = useState<'home' | 'mood' | 'scrapper' | 'gaming' | 'chat'>('home');
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedEntries = localStorage.getItem('moodEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  const saveEntry = (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => {
    const newEntry: MoodEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem('moodEntries', JSON.stringify(updatedEntries));
    setCurrentView('mood');
  };

  const navigation = [
    { id: 'home', label: 'Home', icon: Home, description: 'Platform Overview' },
    { id: 'mood', label: 'Mood Bar', icon: Heart, description: 'Mood Tracking & Analytics' },
    { id: 'scrapper', label: 'Scrapper', icon: Search, description: 'Reddit Data & Output' },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2, description: 'Gaming Hub & Sessions' },
    { id: 'chat', label: 'Chat', icon: MessageCircle, description: 'Chat Support' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-[#343541] text-white' 
        : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50 text-blue-900'
    }`}>
      {/* Header */}
      <header className={`border-b transition-colors duration-300 ${
        darkMode 
          ? 'bg-[#40414F] border-gray-700' 
          : 'bg-white/90 backdrop-blur-sm border-blue-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                SAMH Platform
              </h1>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-all duration-300 ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className={`mb-8 rounded-2xl p-2 shadow-lg border transition-all duration-300 ${
          darkMode 
            ? 'bg-[#40414F] border-gray-700' 
            : 'bg-white/90 backdrop-blur-sm border-blue-100'
        }`}>
          <div className="flex flex-wrap justify-center gap-1">
            {navigation.map(({ id, label, icon: Icon, description }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  currentView === id
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                    : darkMode 
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                      : 'text-blue-700 hover:bg-blue-50 hover:text-blue-800'
                }`}
                title={description}
              >
                <Icon size={20} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main>
          {currentView === 'home' && <HomePage darkMode={darkMode} />}
          {currentView === 'mood' && (
            <MoodBar 
              entries={entries} 
              onAddEntry={saveEntry} 
              darkMode={darkMode} 
            />
          )}
          {currentView === 'scrapper' && <ScrapperOutput darkMode={darkMode} />}
          {currentView === 'gaming' && <Gaming darkMode={darkMode} />}
          {currentView === 'chat' && <Chat darkMode={darkMode} />}
        </main>
      </div>
    </div>
  );
}

export default App;