import React, { useState } from 'react';
import { Gamepad2, Trophy, Target, Clock, TrendingUp, Users, Star, Award } from 'lucide-react';
import MindChallenge from './MindChallenge';
import SocialQuest from './SocialQuest';

interface GamingProps {
  darkMode: boolean;
}

interface GameSession {
  id: string;
  game: string;
  duration: number; // in minutes
  score?: number;
  achievements: string[];
  date: string;
  timestamp: number;
}

const Gaming: React.FC<GamingProps> = ({ darkMode }) => {
  const [currentGamingView, setCurrentGamingView] = useState<'career' | 'sessions' | 'achievements'>('career');
  const [activeGame, setActiveGame] = useState<'mindChallenge' | 'socialQuest' | null>(null);
  const [sessions, setSessions] = useState<GameSession[]>([
    {
      id: '1',
      game: 'Puzzle Quest',
      duration: 45,
      score: 1250,
      achievements: ['First Victory', 'Speed Runner'],
      date: '2024-01-15',
      timestamp: Date.now() - 86400000
    },
    {
      id: '2',
      game: 'Mind Maze',
      duration: 30,
      score: 980,
      achievements: ['Problem Solver'],
      date: '2024-01-14',
      timestamp: Date.now() - 172800000
    }
  ]);

  const gamingNavigation = [
    { id: 'career', label: 'Career', icon: TrendingUp, description: 'Gaming Overview' },
    { id: 'sessions', label: 'History', icon: Clock, description: 'Game Sessions' },
    { id: 'achievements', label: 'Achievements', icon: Trophy, description: 'Your Achievements' },
  ];

  const totalPlayTime = sessions.reduce((total, session) => total + session.duration, 0);
  const totalSessions = sessions.length;
  const totalAchievements = sessions.reduce((total, session) => total + session.achievements.length, 0);
  const averageScore = sessions.reduce((total, session) => total + (session.score || 0), 0) / sessions.length;

  return (
    <div className="space-y-6">
      {/* Gaming Header */}
      <div className={`p-6 rounded-xl ${
        darkMode 
          ? 'bg-[#40414F] border border-gray-700' 
          : 'bg-white/90 backdrop-blur-sm border border-blue-100'
      }`}>
        <div className="mb-6">
          <h2 className={`text-2xl font-bold ${
            darkMode ? 'text-white' : 'text-blue-900'
          }`}>
            Gaming Hub
          </h2>
          <p className={`${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Track your mental wellness through play and games
          </p>
        </div>

        {/* Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            className={`p-6 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              darkMode 
                ? 'bg-gradient-to-br from-purple-600 to-blue-600 border border-purple-500' 
                : 'bg-gradient-to-br from-purple-500 to-blue-500 border border-purple-300'
            }`}
            onClick={() => setActiveGame('mindChallenge')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                darkMode ? 'bg-white/20' : 'bg-white/30'
              }`}>
                <Target className={`w-8 h-8 ${
                  darkMode ? 'text-white' : 'text-white'
                }`} />
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                darkMode ? 'bg-white/20 text-white' : 'bg-white/30 text-white'
              }`}>
                Coming Soon
              </div>
            </div>
            <h3 className={`text-xl font-bold mb-2 ${
              darkMode ? 'text-white' : 'text-white'
            }`}>
              Mind Challenge
            </h3>
            <p className={`text-sm ${
              darkMode ? 'text-white/80' : 'text-white/90'
            }`}>
              Test your cognitive abilities with engaging puzzles and brain teasers designed to improve focus and memory.
            </p>
          </div>

          <div 
            className={`p-6 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              darkMode 
                ? 'bg-gradient-to-br from-green-600 to-teal-600 border border-green-500' 
                : 'bg-gradient-to-br from-green-500 to-teal-500 border border-green-300'
            }`}
            onClick={() => setActiveGame('socialQuest')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                darkMode ? 'bg-white/20' : 'bg-white/30'
              }`}>
                <Users className={`w-8 h-8 ${
                  darkMode ? 'text-white' : 'text-white'
                }`} />
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                darkMode ? 'bg-white/20 text-white' : 'bg-white/30 text-white'
              }`}>
                Coming Soon
              </div>
            </div>
            <h3 className={`text-xl font-bold mb-2 ${
              darkMode ? 'text-white' : 'text-white'
            }`}>
              Social Quest
            </h3>
            <p className={`text-sm ${
              darkMode ? 'text-white/80' : 'text-white/90'
            }`}>
              Build connections and practice social skills through interactive scenarios and collaborative challenges.
            </p>
          </div>
        </div>
      </div>

      {/* Gaming Navigation */}
      <nav className={`rounded-xl p-2 shadow-lg border transition-all duration-300 ${
        darkMode 
          ? 'bg-[#40414F] border-gray-700' 
          : 'bg-white/90 backdrop-blur-sm border-blue-100'
      }`}>
        <div className="flex justify-center gap-1">
          {gamingNavigation.map(({ id, label, icon: Icon, description }) => (
            <button
              key={id}
              onClick={() => setCurrentGamingView(id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                currentGamingView === id
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

      {/* Gaming Content */}
      <div>
        {currentGamingView === 'career' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`p-6 rounded-xl ${
                darkMode 
                  ? 'bg-[#40414F] border border-gray-700' 
                  : 'bg-white/90 backdrop-blur-sm border border-blue-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Total Play Time
                    </p>
                    <p className={`text-2xl font-bold ${
                      darkMode ? 'text-white' : 'text-blue-900'
                    }`}>
                      {Math.floor(totalPlayTime / 60)}h {totalPlayTime % 60}m
                    </p>
                  </div>
                  <Clock className={`w-8 h-8 ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
              </div>

              <div className={`p-6 rounded-xl ${
                darkMode 
                  ? 'bg-[#40414F] border border-gray-700' 
                  : 'bg-white/90 backdrop-blur-sm border border-blue-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Sessions Played
                    </p>
                    <p className={`text-2xl font-bold ${
                      darkMode ? 'text-white' : 'text-blue-900'
                    }`}>
                      {totalSessions}
                    </p>
                  </div>
                  <Gamepad2 className={`w-8 h-8 ${
                    darkMode ? 'text-green-400' : 'text-green-600'
                  }`} />
                </div>
              </div>

              <div className={`p-6 rounded-xl ${
                darkMode 
                  ? 'bg-[#40414F] border border-gray-700' 
                  : 'bg-white/90 backdrop-blur-sm border border-blue-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Achievements
                    </p>
                    <p className={`text-2xl font-bold ${
                      darkMode ? 'text-white' : 'text-blue-900'
                    }`}>
                      {totalAchievements}
                    </p>
                  </div>
                  <Trophy className={`w-8 h-8 ${
                    darkMode ? 'text-yellow-400' : 'text-yellow-600'
                  }`} />
                </div>
              </div>

              <div className={`p-6 rounded-xl ${
                darkMode 
                  ? 'bg-[#40414F] border border-gray-700' 
                  : 'bg-white/90 backdrop-blur-sm border border-blue-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Avg Score
                    </p>
                    <p className={`text-2xl font-bold ${
                      darkMode ? 'text-white' : 'text-blue-900'
                    }`}>
                      {Math.round(averageScore)}
                    </p>
                  </div>
                  <Target className={`w-8 h-8 ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className={`p-6 rounded-xl ${
              darkMode 
                ? 'bg-[#40414F] border border-gray-700' 
                : 'bg-white/90 backdrop-blur-sm border border-blue-100'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                darkMode ? 'text-white' : 'text-blue-900'
              }`}>
                Recent Gaming Sessions
              </h3>
              <div className="space-y-3">
                {sessions.slice(0, 3).map((session) => (
                  <div key={session.id} className={`p-2 rounded-lg ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Gamepad2 className={`w-5 h-5 ${
                          darkMode ? 'text-purple-400' : 'text-purple-600'
                        }`} />
                        <div>
                          <p className={`font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {session.game}
                          </p>
                          <p className={`text-sm ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {session.duration} minutes • {session.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.score && (
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {session.score} pts
                          </span>
                        )}
                        <div className="flex gap-1">
                          {session.achievements.slice(0, 2).map((achievement, index) => (
                            <Award key={index} className={`w-4 h-4 ${
                              darkMode ? 'text-yellow-400' : 'text-yellow-600'
                            }`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentGamingView === 'sessions' && (
          <div className={`p-6 rounded-xl ${
            darkMode 
              ? 'bg-[#40414F] border border-gray-700' 
              : 'bg-white/90 backdrop-blur-sm border border-blue-100'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              darkMode ? 'text-white' : 'text-blue-900'
            }`}>
              All Gaming Sessions
            </h3>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className={`p-4 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Gamepad2 className={`w-5 h-5 ${
                        darkMode ? 'text-purple-400' : 'text-purple-600'
                      }`} />
                      <div>
                        <p className={`font-medium ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {session.game}
                        </p>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {session.duration} minutes • {session.date}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {session.achievements.map((achievement, index) => (
                            <span key={index} className={`px-2 py-1 rounded text-xs ${
                              darkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {achievement}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {session.score && (
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {session.score} pts
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentGamingView === 'achievements' && (
          <div className={`p-6 rounded-xl ${
            darkMode 
              ? 'bg-[#40414F] border border-gray-700' 
              : 'bg-white/90 backdrop-blur-sm border border-blue-100'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              darkMode ? 'text-white' : 'text-blue-900'
            }`}>
              Your Achievements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from(new Set(sessions.flatMap(s => s.achievements))).map((achievement, index) => (
                <div key={index} className={`p-4 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <Trophy className={`w-6 h-6 ${
                      darkMode ? 'text-yellow-400' : 'text-yellow-600'
                    }`} />
                    <div>
                      <p className={`font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {achievement}
                      </p>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Unlocked
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Game Modal */}
      {activeGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setActiveGame(null)}
          />
          
          {/* Modal Content */}
          <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl ${
            darkMode 
              ? 'bg-[#40414F] border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}>
            {activeGame === 'mindChallenge' && (
              <MindChallenge 
                darkMode={darkMode} 
                onBack={() => setActiveGame(null)} 
              />
            )}
            {activeGame === 'socialQuest' && (
              <SocialQuest 
                darkMode={darkMode} 
                onBack={() => setActiveGame(null)} 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gaming;
