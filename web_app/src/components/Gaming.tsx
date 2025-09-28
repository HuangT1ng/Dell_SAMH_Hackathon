import React from 'react';
import { Gamepad2 } from 'lucide-react';

interface GamingProps {
  darkMode: boolean;
  onNavigate: (view: string) => void;
}

const Gaming: React.FC<GamingProps> = ({ darkMode, onNavigate }) => {

  const PALETTE = {
    blue: "#4a6cf7",
    pink: "#ec4899", 
    orange: "#fb923c",
    yellow: "#facc15",
    green: "#34d399",
    slate: "#64748b",
  };

  return (
    <div className={`min-h-screen ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-pink-50'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Header */}
        <div className="relative mb-12 sm:mb-16">
          {/* Background decorative elements */}
          <div className="absolute -top-4 sm:-top-8 -left-4 sm:-left-8 w-24 h-24 sm:w-32 sm:h-32 rounded-full opacity-10" style={{ backgroundColor: PALETTE.blue }}></div>
          <div className="absolute -bottom-2 sm:-bottom-4 -right-2 sm:-right-4 w-16 h-16 sm:w-24 sm:h-24 rounded-full opacity-10" style={{ backgroundColor: PALETTE.pink }}></div>
          <div className="absolute top-1/2 -right-4 sm:-right-8 w-12 h-12 sm:w-16 sm:h-16 rounded-full opacity-10" style={{ backgroundColor: PALETTE.orange }}></div>
          
          <div className={`relative backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border ${
            darkMode 
              ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50' 
              : 'bg-gradient-to-br from-white/90 to-white/70 border-white/50'
          }`}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: PALETTE.blue }}>
                  <Gamepad2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-2 leading-tight ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Gaming Hub 🎮
                </h1>
                <p className={`text-base sm:text-lg md:text-xl leading-relaxed ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Level up your mental health skills through interactive games and challenges. 
                  Turn stress into strength, one game at a time!
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* Featured Game - Resilience Quest */}
        <div className="mb-8">
          <div
            onClick={() => onNavigate('pixel-harmony-game')}
            className={`group relative rounded-3xl p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer ${
              darkMode 
                ? 'bg-gradient-to-br from-purple-800/80 to-blue-900/80 border border-purple-700/50' 
                : 'bg-gradient-to-br from-purple-100/90 to-blue-100/70 border border-purple-200/50 shadow-xl'
            } ring-2 ring-purple-500/50`}
          >
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 rounded-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br from-purple-500 to-blue-500"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-purple-500 to-blue-500 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <Gamepad2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h3 className={`text-xl sm:text-2xl font-bold leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      🎮 Resilience Quest
                    </h3>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-semibold w-fit">
                      <Gamepad2 className="w-4 h-4" />
                      <span>Featured Game</span>
                    </div>
                  </div>
                  <p className={`text-base sm:text-lg leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Embark on a mental health journey through interactive storytelling and mini-games. 
                    Learn coping strategies while exploring a beautiful pixel art world.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">🎯</span>
                  </div>
                  <span className={`text-sm font-medium leading-tight ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Interactive Storytelling
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">🧠</span>
                  </div>
                  <span className={`text-sm font-medium leading-tight ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Mental Health Focus
                  </span>
                </div>
                <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-1">
                  <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">🎨</span>
                  </div>
                  <span className={`text-sm font-medium leading-tight ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Beautiful Pixel Art
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-purple-500 text-sm font-medium">
              </div>
            </div>
          </div>
        </div>



      </div>
    </div>
  );
};

export default Gaming;
