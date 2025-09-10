import React, { useState } from 'react';
import { PlusCircle, Calendar, TrendingUp, BookOpen, Activity, Plus } from 'lucide-react';
import Dashboard from './Dashboard';
import AddEntry from './AddEntry';
import EntryHistory from './EntryHistory';
import type { MoodEntry } from '../App';

interface MoodBarProps {
  entries: MoodEntry[];
  onAddEntry: (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => void;
  darkMode: boolean;
}

const MoodBar: React.FC<MoodBarProps> = ({ entries, onAddEntry, darkMode }) => {
  const [currentMoodView, setCurrentMoodView] = useState<'dashboard' | 'add' | 'history'>('dashboard');

  const moodNavigation = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, description: 'Mood Overview' },
    { id: 'add', label: 'Add Entry', icon: PlusCircle, description: 'New Journal Entry' },
    { id: 'history', label: 'History', icon: BookOpen, description: 'Entry History' },
  ];

  return (
    <div className="space-y-6">
      {/* Mood Bar Header */}
      <div className={`p-6 rounded-xl ${
        darkMode 
          ? 'bg-[#40414F] border border-gray-700' 
          : 'bg-white/90 backdrop-blur-sm border border-blue-100'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-blue-900'
            }`}>
              Mood Bar
            </h2>
            <p className={`${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Track your mental health journey and mood patterns
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg ${
              darkMode ? 'bg-gray-700' : 'bg-blue-50'
            }`}>
              <span className={`text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-blue-700'
              }`}>
                {entries.length} entries
              </span>
            </div>
            <button
              onClick={() => setCurrentMoodView('add')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Entry
            </button>
          </div>
        </div>
      </div>

      {/* Mood Navigation */}
      <nav className={`rounded-xl p-2 shadow-lg border transition-all duration-300 ${
        darkMode 
          ? 'bg-[#40414F] border-gray-700' 
          : 'bg-white/90 backdrop-blur-sm border-blue-100'
      }`}>
        <div className="flex justify-center gap-1">
          {moodNavigation.map(({ id, label, icon: Icon, description }) => (
            <button
              key={id}
              onClick={() => setCurrentMoodView(id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                currentMoodView === id
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

      {/* Mood Content */}
      <div>
        {currentMoodView === 'dashboard' && (
          <Dashboard 
            entries={entries} 
            onAddEntry={() => setCurrentMoodView('add')} 
            darkMode={darkMode} 
          />
        )}
        {currentMoodView === 'add' && (
          <AddEntry 
            onSave={onAddEntry} 
            onCancel={() => setCurrentMoodView('dashboard')} 
            darkMode={darkMode} 
          />
        )}
        {currentMoodView === 'history' && (
          <EntryHistory 
            entries={entries} 
            darkMode={darkMode} 
          />
        )}
      </div>
    </div>
  );
};

export default MoodBar;
