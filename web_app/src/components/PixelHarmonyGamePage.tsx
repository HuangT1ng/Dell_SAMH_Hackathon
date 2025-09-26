import React, { useState, useEffect } from 'react';
import { ArrowLeft, Gamepad2, Heart, Brain, Users, Star } from 'lucide-react';
import PixelHarmonyGame from './PixelHarmonyGame';

interface PixelHarmonyGamePageProps {
  darkMode: boolean;
  onNavigate: (view: string) => void;
}

const PixelHarmonyGamePage: React.FC<PixelHarmonyGamePageProps> = ({ darkMode, onNavigate }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Handle ESC key to exit full-screen
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showPopup) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener('keydown', handleKeyPress);
      // Prevent body scroll when popup is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [showPopup]);

  const features = [
    {
      icon: Heart,
      title: "Emotional Wellness",
      description: "Learn to identify and manage your emotions through interactive scenarios"
    },
    {
      icon: Brain,
      title: "Coping Strategies",
      description: "Discover healthy ways to deal with stress and difficult situations"
    },
    {
      icon: Users,
      title: "Social Skills",
      description: "Practice communication and relationship-building in a safe environment"
    },
    {
      icon: Star,
      title: "Personal Growth",
      description: "Build confidence and self-awareness through engaging gameplay"
    }
  ];

  if (gameStarted) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Game Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setGameStarted(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                  : 'bg-white hover:bg-gray-50 text-gray-700'
              } shadow-lg`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Gaming Hub
            </button>
            <div className="flex-1">
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                🎮 Pixel Harmony - Mental Health Journey
              </h1>
            </div>
          </div>

          {/* Game Container */}
          <div className="flex justify-center items-center" style={{ height: '700px' }}>
            <div className="w-full max-w-4xl h-full">
              <PixelHarmonyGame 
                width={1000} 
                height={700} 
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50'
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => onNavigate('gaming')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                : 'bg-white hover:bg-gray-50 text-gray-700'
            } shadow-lg`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gaming Hub
          </button>
        </div>

        {/* Hero Section */}
        <div className={`relative backdrop-blur-sm rounded-3xl p-8 shadow-2xl border mb-12 ${
          darkMode 
            ? 'bg-gradient-to-br from-purple-800/80 to-blue-900/80 border-purple-700/50' 
            : 'bg-gradient-to-br from-white/90 to-white/70 border-white/50'
        }`}>
          <div className="flex items-center gap-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg bg-gradient-to-br from-purple-500 to-blue-500">
                <Gamepad2 className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white"></div>
              </div>
            </div>
            <div className="flex-1">
              <h1 className={`text-5xl md:text-6xl font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                🎮 Pixel Harmony
              </h1>
              <p className={`text-xl md:text-2xl mb-6 ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Embark on a transformative mental health journey through interactive storytelling and engaging mini-games. 
                Learn valuable coping strategies while exploring a beautiful pixel art world.
              </p>
              <button
                onClick={() => setShowPopup(true)}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white"
              >
                <Gamepad2 className="w-6 h-6" />
                <span>Start Your Journey</span>
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold text-center mb-8 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            What You'll Experience 🌟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className={`group relative rounded-3xl p-6 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                    darkMode 
                      ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50' 
                      : 'bg-gradient-to-br from-white/90 to-white/70 border border-white/50 shadow-xl'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-purple-500 to-blue-500 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-3 ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm leading-relaxed ${
                        darkMode ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Full-Screen Game Popup (Like Video Player) */}
      {showPopup && (
        <div 
          className="fixed inset-0 bg-black"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            backgroundColor: '#000000'
          }}
        >
          {/* Game Container - True Full Screen */}
          <div 
            className="w-full h-full flex justify-center items-center"
            style={{
              width: '100vw',
              height: '100vh',
              position: 'relative'
            }}
          >
            <div className="w-full h-full">
              <PixelHarmonyGame 
                width="100vw" 
                height="100vh" 
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Close Button - Floating Overlay */}
          <button
            onClick={() => setShowPopup(false)}
            className="absolute top-4 right-4 z-10 p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 text-white transition-all duration-200"
            style={{ 
              zIndex: 10000,
              backdropFilter: 'blur(4px)'
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

        </div>
      )}
    </div>
  );
};

export default PixelHarmonyGamePage;
