import React, { useState } from 'react';
import { Calendar, Search, Filter } from 'lucide-react';
import type { MoodEntry } from '../App';

interface EntryHistoryProps {
  entries: MoodEntry[];
  darkMode: boolean;
}

const EntryHistory: React.FC<EntryHistoryProps> = ({ entries, darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'mood-high' | 'mood-low'>('date-desc');

  const getMoodEmoji = (mood: number) => {
    const emojis = ['😢', '😟', '😐', '🙂', '😊'];
    return emojis[mood - 1] || '😐';
  };

  const getMoodColor = (mood: number) => {
    const colors = [
      'text-red-500 bg-red-50 border-red-200',
      'text-orange-500 bg-orange-50 border-orange-200',
      'text-yellow-500 bg-yellow-50 border-yellow-200',
      'text-blue-500 bg-blue-50 border-blue-200',
      'text-green-500 bg-green-50 border-green-200'
    ];
    return colors[mood - 1] || 'text-gray-500 bg-gray-50 border-gray-200';
  };

  const filteredEntries = entries
    .filter(entry => {
      const matchesSearch = 
        entry.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.triggers.some(trigger => trigger.toLowerCase().includes(searchTerm.toLowerCase())) ||
        entry.activities.some(activity => activity.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesMood = selectedMood ? entry.mood === selectedMood : true;
      
      return matchesSearch && matchesMood;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'mood-high':
          return b.mood - a.mood;
        case 'mood-low':
          return a.mood - b.mood;
        default: // 'date-desc'
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const date = new Date(entry.date).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, MoodEntry[]>);

  return (
    <div className="space-y-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">Entry History</h2>

        {/* Filters */}
        <div className="space-y-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search notes, triggers, or activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/90 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap gap-4">
            {/* Mood filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <select
                value={selectedMood || ''}
                onChange={(e) => setSelectedMood(e.target.value ? parseInt(e.target.value) : null)}
                className="px-3 py-2 bg-white/90 border border-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Moods</option>
                <option value="1">😢 Very Bad</option>
                <option value="2">😟 Bad</option>
                <option value="3">😐 Okay</option>
                <option value="4">🙂 Good</option>
                <option value="5">😊 Excellent</option>
              </select>
            </div>

            {/* Sort by */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-white/90 border border-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="mood-high">Highest Mood</option>
                <option value="mood-low">Lowest Mood</option>
              </select>
            </div>
          </div>

          {/* Active filters indicator */}
          {(searchTerm || selectedMood) && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Active filters:</span>
              {searchTerm && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Search: "{searchTerm}"
                </span>
              )}
              {selectedMood && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Mood: {getMoodEmoji(selectedMood)}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedMood(null);
                }}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Entries count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredEntries.length} of {entries.length} entries
          </p>
        </div>
      </div>

      {/* Entries */}
      {Object.keys(groupedEntries).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedEntries).map(([date, dayEntries]) => (
            <div key={date} className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-blue-600" size={18} />
                <h3 className="text-lg font-semibold text-blue-900">
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
              </div>

              <div className="space-y-4">
                {dayEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="border border-blue-100 rounded-xl p-4 hover:bg-blue-50/50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getMoodColor(entry.mood)}`}>
                            {entry.moodLabel}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {entry.triggers.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">Triggers:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {entry.triggers.map((trigger, index) => (
                            <span
                              key={index}
                              className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs"
                            >
                              {trigger}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.activities.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">Activities:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {entry.activities.map((activity, index) => (
                            <span
                              key={index}
                              className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs"
                            >
                              {activity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.notes && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-sm font-medium text-gray-700">Notes:</span>
                        <p className="text-sm text-gray-700 mt-1">{entry.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-blue-100 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-600 mb-2">No entries found</p>
          <p className="text-sm text-gray-500">
            Try adjusting your search terms or filters to see more results.
          </p>
        </div>
      )}
    </div>
  );
};

export default EntryHistory;