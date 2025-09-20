import React from 'react';
import { Calendar, TrendingUp, Activity, Plus } from 'lucide-react';
import type { MoodEntry } from '../utils/sharedDatabase';
import MoodChart from './MoodChart';

interface DashboardProps {
  entries: MoodEntry[];
  onAddEntry: () => void;
  darkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ entries, onAddEntry, darkMode }) => {
  const recentEntries = entries.slice(0, 3);
  const todayEntry = entries.find(entry => {
    const today = new Date().toDateString();
    const entryDate = new Date(entry.date).toDateString();
    return today === entryDate;
  });

  const averageMood = entries.length > 0 
    ? entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length 
    : 0;

  const getMoodEmoji = (mood: number) => {
    const emojis = ['😢', '😟', '😐', '🙂', '😊'];
    return emojis[mood - 1] || '😐';
  };

  const getMoodColor = (mood: number) => {
    const colors = [
      'text-red-500',
      'text-orange-500', 
      'text-yellow-500',
      'text-blue-500',
      'text-green-500'
    ];
    return colors[mood - 1] || 'text-gray-500';
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4">
        {/* Today's Entry */}
        <div className={`backdrop-blur-sm rounded-xl p-4 shadow-lg border transition-all duration-300 ${
          darkMode 
            ? 'bg-[#40414F] border-gray-700' 
            : 'bg-white/90 border-blue-100'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="text-blue-600" size={20} />
            <h3 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-blue-900'}`}>Today's Mood</h3>
          </div>
          {todayEntry ? (
            <div className="text-center">
              <div className="text-3xl mb-2">{getMoodEmoji(todayEntry.mood)}</div>
              <p className={`text-lg font-medium ${getMoodColor(todayEntry.mood)}`}>
                {todayEntry.moodLabel}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-3xl mb-2">📝</div>
              <p className={`mb-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>No entry yet</p>
              <button
                onClick={onAddEntry}
                className="text-sm bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
              >
                Add Entry
              </button>
            </div>
          )}
        </div>

        {/* Average Mood */}
        <div className={`backdrop-blur-sm rounded-xl p-4 shadow-lg border transition-all duration-300 ${
          darkMode 
            ? 'bg-[#40414F] border-gray-700' 
            : 'bg-white/90 border-blue-100'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="text-cyan-600" size={20} />
            <h3 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-blue-900'}`}>Average Mood</h3>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-600 mb-1">
              {averageMood.toFixed(1)}/5
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Last {entries.length} entries</p>
          </div>
        </div>

        {/* Total Entries */}
        <div className={`backdrop-blur-sm rounded-xl p-4 shadow-lg border transition-all duration-300 ${
          darkMode 
            ? 'bg-[#40414F] border-gray-700' 
            : 'bg-white/90 border-blue-100'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="text-teal-600" size={20} />
            <h3 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-blue-900'}`}>Total Entries</h3>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-600 mb-1">{entries.length}</div>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Journal entries</p>
          </div>
        </div>
      </div>

      {/* Mood Chart */}
      {entries.length > 0 && (
        <div className={`backdrop-blur-sm rounded-xl p-4 shadow-lg border ${
          darkMode 
            ? 'bg-[#40414F] border-gray-700' 
            : 'bg-white/90 border-blue-100'
        }`}>
          <h3 className={`text-base font-semibold mb-3 ${darkMode ? 'text-white' : 'text-blue-900'}`}>Mood Trend</h3>
          <MoodChart entries={entries.slice(0, 7).reverse()} />
        </div>
      )}

      {/* Recent Entries */}
        <div className={`backdrop-blur-sm rounded-xl p-4 shadow-lg border ${
          darkMode 
            ? 'bg-[#40414F] border-gray-700' 
            : 'bg-white/90 border-blue-100'
        }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-blue-900'}`}>Recent Entries</h3>
          <button
            onClick={onAddEntry}
            className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 text-sm"
          >
            <Plus size={14} />
            New
          </button>
        </div>

        {recentEntries.length > 0 ? (
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className={`border rounded-lg p-3 transition-colors duration-200 ${
                  darkMode 
                    ? 'border-gray-700 hover:bg-gray-700/50' 
                    : 'border-blue-100 hover:bg-blue-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getMoodEmoji(entry.mood)}</span>
                    <span className={`font-medium text-sm ${getMoodColor(entry.mood)}`}>
                      {entry.moodLabel}
                    </span>
                  </div>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>
                {entry.triggers.length > 0 && (
                  <div className="mb-1">
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Triggers: </span>
                    <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{entry.triggers.join(', ')}</span>
                  </div>
                )}
                {entry.activities.length > 0 && (
                  <div className="mb-1">
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Activities: </span>
                    <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{entry.activities.join(', ')}</span>
                  </div>
                )}
                {entry.notes && (
                  <p className={`text-xs italic ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{entry.notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-3xl mb-3">📔</div>
            <p className={`mb-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>No entries yet. Start your journey!</p>
            <button
              onClick={onAddEntry}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 text-sm"
            >
              Create Your First Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;