import React, { useState } from 'react';
import { Users, Heart, MessageCircle, ArrowLeft, Star, Award } from 'lucide-react';

interface SocialQuestProps {
  darkMode: boolean;
  onBack: () => void;
}

interface SocialScenario {
  id: string;
  title: string;
  description: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

const SocialQuest: React.FC<SocialQuestProps> = ({ darkMode, onBack }) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'completed'>('menu');
  const [currentScenario, setCurrentScenario] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Sample scenarios - these will be expanded with real content
  const scenarios: SocialScenario[] = [
    {
      id: '1',
      title: 'Meeting a New Colleague',
      description: 'You\'re at work and a new colleague approaches you during lunch break. They seem friendly but a bit nervous.',
      options: [
        'Ignore them and continue eating',
        'Smile and introduce yourself',
        'Wait for them to speak first',
        'Quickly finish your lunch and leave'
      ],
      correctAnswer: 1,
      points: 10
    },
    {
      id: '2',
      title: 'Group Project Conflict',
      description: 'Your team member hasn\'t completed their part of the project and the deadline is tomorrow.',
      options: [
        'Complain to the professor immediately',
        'Offer to help them finish their part',
        'Do their work for them without saying anything',
        'Ignore the situation and hope for the best'
      ],
      correctAnswer: 1,
      points: 15
    }
  ];

  const handleStartGame = () => {
    setGameState('playing');
    setCurrentScenario(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    if (answerIndex === scenarios[currentScenario].correctAnswer) {
      setScore(prev => prev + scenarios[currentScenario].points);
    }
  };

  const handleNextScenario = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setGameState('completed');
    }
  };

  const handleBackToMenu = () => {
    setGameState('menu');
    setCurrentScenario(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
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
              Social Quest
            </h2>
            <p className={`${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Build connections and practice social skills
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
          <div className="text-center space-y-6">
            <div className={`p-8 rounded-xl ${
              darkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <Users className={`w-16 h-16 mx-auto mb-4 ${
                darkMode ? 'text-green-400' : 'text-green-600'
              }`} />
              <h3 className={`text-xl font-bold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Ready for Your Social Quest?
              </h3>
              <p className={`mb-6 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Practice social skills through interactive scenarios and learn how to build meaningful connections.
              </p>
              <button
                onClick={handleStartGame}
                className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
                  darkMode
                    ? 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white'
                    : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white'
                }`}
              >
                Start Quest
              </button>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="space-y-6">
            {/* Progress */}
            <div className="flex items-center justify-between px-8 mb-6">
              <div className={`p-3 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-2">
                  <Star className={`w-5 h-5 ${
                    darkMode ? 'text-yellow-400' : 'text-yellow-600'
                  }`} />
                  <span className={`font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Score: {score}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <span className={`font-medium ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Scenario {currentScenario + 1} of {scenarios.length}
                </span>
              </div>
            </div>

            {/* Current Scenario */}
            <div className={`p-6 rounded-xl ${
              darkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <h3 className={`text-lg font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {scenarios[currentScenario].title}
              </h3>
              <p className={`mb-6 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {scenarios[currentScenario].description}
              </p>

              {/* Answer Options */}
              <div className="space-y-3">
                {scenarios[currentScenario].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !showResult && handleAnswerSelect(index)}
                    disabled={showResult}
                    className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                      showResult
                        ? index === scenarios[currentScenario].correctAnswer
                          ? 'bg-green-100 border-2 border-green-500 text-green-800'
                          : selectedAnswer === index
                          ? 'bg-red-100 border-2 border-red-500 text-red-800'
                          : 'bg-gray-100 text-gray-500'
                        : selectedAnswer === index
                        ? darkMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-800'
                        : darkMode
                        ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        showResult
                          ? index === scenarios[currentScenario].correctAnswer
                            ? 'border-green-500 bg-green-500'
                            : selectedAnswer === index
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-300'
                          : selectedAnswer === index
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {showResult && index === scenarios[currentScenario].correctAnswer && (
                          <span className="text-white text-xs">✓</span>
                        )}
                        {showResult && selectedAnswer === index && index !== scenarios[currentScenario].correctAnswer && (
                          <span className="text-white text-xs">✗</span>
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Result and Next Button */}
              {showResult && (
                <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p className={`text-sm ${
                    selectedAnswer === scenarios[currentScenario].correctAnswer
                      ? 'text-green-700'
                      : 'text-red-700'
                  }`}>
                    {selectedAnswer === scenarios[currentScenario].correctAnswer
                      ? `Correct! You earned ${scenarios[currentScenario].points} points.`
                      : `Not quite right. The best approach would be: "${scenarios[currentScenario].options[scenarios[currentScenario].correctAnswer]}"`
                    }
                  </p>
                  <button
                    onClick={handleNextScenario}
                    className={`mt-3 px-4 py-2 rounded-lg font-medium transition-colors ${
                      darkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {currentScenario < scenarios.length - 1 ? 'Next Scenario' : 'Complete Quest'}
                  </button>
                </div>
              )}
            </div>

            {/* Game Controls */}
            <div className="flex justify-center">
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
              <Award className={`w-16 h-16 mx-auto mb-4 ${
                darkMode ? 'text-yellow-400' : 'text-yellow-600'
              }`} />
              <h3 className={`text-xl font-bold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Quest Completed!
              </h3>
              <p className={`text-lg mb-4 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Final Score: {score}
              </p>
              <p className={`mb-6 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Great job! You've improved your social skills and learned valuable communication strategies.
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
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
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

export default SocialQuest;
