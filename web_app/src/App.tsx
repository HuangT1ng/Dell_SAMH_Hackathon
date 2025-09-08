import React, { useState, useEffect } from 'react';
import { PlusCircle, Calendar, TrendingUp, BookOpen } from 'lucide-react';
import Dashboard from './components/Dashboard';
import AddEntry from './components/AddEntry';
import EntryHistory from './components/EntryHistory';

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
  const [currentView, setCurrentView] = useState<'dashboard' | 'add' | 'history'>('dashboard');
  const [entries, setEntries] = useState<MoodEntry[]>([]);

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
    setCurrentView('dashboard');
  };

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'add', label: 'Add Entry', icon: PlusCircle },
    { id: 'history', label: 'History', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent mb-2">
              MindFlow
            </h1>
            <p className="text-gray-600 text-lg">Your personal mood & stress companion</p>
          </div>

          {/* Navigation */}
          <nav className="bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-blue-100">
            <div className="flex justify-center space-x-1">
              {navigation.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setCurrentView(id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    currentView === id
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-blue-700 hover:bg-blue-50 hover:text-blue-800'
                  }`}
                >
                  <Icon size={20} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main>
          {currentView === 'dashboard' && (
            <Dashboard entries={entries} onAddEntry={() => setCurrentView('add')} />
          )}
          {currentView === 'add' && (
            <AddEntry onSave={saveEntry} onCancel={() => setCurrentView('dashboard')} />
          )}
          {currentView === 'history' && <EntryHistory entries={entries} />}
        </main>
      </div>
    </div>
  );
}

export default App;