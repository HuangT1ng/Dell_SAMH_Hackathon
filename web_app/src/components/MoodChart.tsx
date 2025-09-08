import React from 'react';
import type { MoodEntry } from '../App';

interface MoodChartProps {
  entries: MoodEntry[];
}

const MoodChart: React.FC<MoodChartProps> = ({ entries }) => {
  if (entries.length === 0) return null;

  const maxMood = 5;
  const chartHeight = 200;
  const chartWidth = 100;

  const getMoodColor = (mood: number) => {
    const colors = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#10b981'];
    return colors[mood - 1] || '#6b7280';
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-end justify-center gap-4 min-w-max px-4" style={{ height: chartHeight + 60 }}>
        {entries.map((entry, index) => {
          const height = (entry.mood / maxMood) * chartHeight;
          const date = new Date(entry.date);
          
          return (
            <div key={entry.id} className="flex flex-col items-center">
              <div 
                className="w-8 rounded-t-lg transition-all duration-300 hover:opacity-80 relative group"
                style={{ 
                  height: `${height}px`,
                  backgroundColor: getMoodColor(entry.mood),
                  minHeight: '20px'
                }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-gray-800 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
                    {entry.moodLabel} ({entry.mood}/5)
                  </div>
                </div>
              </div>
              
              <div className="mt-2 text-center">
                <div className="text-lg mb-1">
                  {['😢', '😟', '😐', '🙂', '😊'][entry.mood - 1]}
                </div>
                <div className="text-xs text-gray-600 whitespace-nowrap">
                  {date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MoodChart;