import React from 'react';
import { Calendar, TrendingUp, Activity, Plus } from 'lucide-react';
import type { MoodEntry } from '../App';
import MoodChart from './MoodChart';

interface DashboardProps {
  entries: MoodEntry[];
  onAddEntry: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ entries, onAddEntry }) => {
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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Entry */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold text-blue-900">Today's Mood</h3>
          </div>
          {todayEntry ? (
            <div className="text-center">
              <div className="text-4xl mb-2">{getMoodEmoji(todayEntry.mood)}</div>
              <p className={`text-xl font-medium ${getMoodColor(todayEntry.mood)}`}>
                {todayEntry.moodLabel}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-gray-600 mb-3">No entry yet</p>
              <button
                onClick={onAddEntry}
                className="text-sm bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
              >
                Add Entry
              </button>
            </div>
          )}
        </div>

        {/* Average Mood */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-cyan-600" size={24} />
            <h3 className="text-lg font-semibold text-blue-900">Average Mood</h3>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-600 mb-1">
              {averageMood.toFixed(1)}/5
            </div>
            <p className="text-gray-600">Last {entries.length} entries</p>
          </div>
        </div>

        {/* Total Entries */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="text-teal-600" size={24} />
            <h3 className="text-lg font-semibold text-blue-900">Total Entries</h3>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600 mb-1">{entries.length}</div>
            <p className="text-gray-600">Journal entries</p>
          </div>
        </div>
      </div>

      {/* Mood Chart */}
      {entries.length > 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Mood Trend</h3>
          <MoodChart entries={entries.slice(0, 7).reverse()} />
        </div>
      )}

      {/* Recent Entries */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-blue-900">Recent Entries</h3>
          <button
            onClick={onAddEntry}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
          >
            <Plus size={16} />
            New Entry
          </button>
        </div>

        {recentEntries.length > 0 ? (
          <div className="space-y-4">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="border border-blue-100 rounded-xl p-4 hover:bg-blue-50/50 transition-colors duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                    <span className={`font-medium ${getMoodColor(entry.mood)}`}>
                      {entry.moodLabel}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>
                {entry.triggers.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm text-gray-600">Triggers: </span>
                    <span className="text-sm text-gray-700">{entry.triggers.join(', ')}</span>
                  </div>
                )}
                {entry.activities.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm text-gray-600">Activities: </span>
                    <span className="text-sm text-gray-700">{entry.activities.join(', ')}</span>
                  </div>
                )}
                {entry.notes && (
                  <p className="text-sm text-gray-700 italic">{entry.notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📔</div>
            <p className="text-gray-600 mb-4">No entries yet. Start your journey!</p>
            <button
              onClick={onAddEntry}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
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