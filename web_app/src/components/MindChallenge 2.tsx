import React, { useState } from 'react';
import { Target, Brain, Clock, Trophy, ArrowLeft } from 'lucide-react';

interface MindChallengeProps {
  darkMode: boolean;
  onBack: () => void;
}

const MindChallenge: React.FC<MindChallengeProps> = ({ darkMode, onBack }) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'completed'>('menu');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentLevel, setCurrentLevel] = useState(1);

  const handleStartGame = () => {
    setGameState('playing');
    // Game logic will be implemented here
  };

  const handleBackToMenu = () => {
    setGameState('menu');
    setScore(0);
    setTimeLeft(60);
    setCurrentLevel(1);
  };

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className={`p-4 rounded-xl ${
        darkMode 
          ? 'bg-[#40414F]' 
          : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <div className="flex items-center gap-4 mb-0">
          <button
            onClick={onBack}
            className={`p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-blue-900'
            }`}>
              Mind Challenge
            </h2>
            <p className={`${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Test your cognitive abilities with engaging puzzles
            </p>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className={`p-4 rounded-xl ${
        darkMode 
          ? 'bg-[#40414F]' 
          : 'bg-white/90 backdrop-blur-sm'
      }`}>
        {gameState === 'menu' && (
          <div className="text-center space-y-0">
            <div className={`p-8 rounded-xl ${
              darkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <Brain className={`w-16 h-16 mx-auto mb-4 ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`} />
              <h3 className={`text-xl font-bold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Ready to Challenge Your Mind?
              </h3>
              <p className={`mb-6 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Complete puzzles and brain teasers to improve your focus, memory, and cognitive abilities.
              </p>
              <button
                onClick={handleStartGame}
                className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
                  darkMode
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
                }`}
              >
                Start Challenge
              </button>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="space-y-6">
            {/* Game Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg text-center ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <Target className={`w-6 h-6 mx-auto mb-2 ${
                  darkMode ? 'text-green-400' : 'text-green-600'
                }`} />
                <p className={`text-sm font-medium ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Score
                </p>
                <p className={`text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {score}
                </p>
              </div>
              <div className={`p-4 rounded-lg text-center ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <Clock className={`w-6 h-6 mx-auto mb-2 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <p className={`text-sm font-medium ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Time
                </p>
                <p className={`text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {timeLeft}s
                </p>
              </div>
              <div className={`p-4 rounded-lg text-center ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <Trophy className={`w-6 h-6 mx-auto mb-2 ${
                  darkMode ? 'text-yellow-400' : 'text-yellow-600'
                }`} />
                <p className={`text-sm font-medium ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Level
                </p>
                <p className={`text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {currentLevel}
                </p>
              </div>
            </div>

            {/* Game Area */}
            <div className={`p-8 rounded-xl text-center ${
              darkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <p className={`text-lg ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Game implementation will go here
              </p>
              <p className={`text-sm mt-2 ${
                darkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                This is where the actual puzzle/game logic will be implemented
              </p>
            </div>

            {/* Game Controls */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleBackToMenu}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Back to Menu
              </button>
            </div>
          </div>
        )}

        {gameState === 'completed' && (
          <div className="text-center space-y-6">
            <div className={`p-8 rounded-xl ${
              darkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <Trophy className={`w-16 h-16 mx-auto mb-4 ${
                darkMode ? 'text-yellow-400' : 'text-yellow-600'
              }`} />
              <h3 className={`text-xl font-bold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Challenge Completed!
              </h3>
              <p className={`text-lg mb-4 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Final Score: {score}
              </p>
              <p className={`mb-6 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Great job! You've improved your cognitive abilities.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleBackToMenu}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Play Again
                </button>
                <button
                  onClick={onBack}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    darkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Back to Gaming Hub
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MindChallenge;
