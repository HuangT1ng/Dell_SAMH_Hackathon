import React from 'react';
import { Brain, Users, Smartphone, Eye, MessageCircle, Home, Heart as HeartIcon, Search, Shield, Clock, Map, DollarSign, Activity, Globe, Gamepad2 } from 'lucide-react';

interface GamingProps {
  darkMode: boolean;
  onNavigate: (view: string) => void;
}

const Gaming: React.FC<GamingProps> = ({ darkMode, onNavigate }) => {
  const stressors = [
    {
      id: 1,
      title: "Academic Pressure",
      description: "Exams, grades, competition, and expectations to perform well.",
      icon: Brain,
      color: "#facc15",
      game: "academic-stress"
    },
    {
      id: 2,
      title: "Peer Pressure",
      description: "Feeling the need to fit in, conform, or do things against their values to be accepted.",
      icon: Users,
      color: "#ec4899"
    },
    {
      id: 3,
      title: "Social Media Stress",
      description: "Comparisons, FOMO (fear of missing out), online validation, cyberbullying.",
      icon: Smartphone,
      color: "#4a6cf7"
    },
    {
      id: 4,
      title: "Body Image & Self-Esteem",
      description: "Concerns about looks, weight, and unrealistic beauty standards.",
      icon: Eye,
      color: "#ec4899"
    },
    {
      id: 5,
      title: "Friendship Conflicts",
      description: "Misunderstandings, exclusion, betrayal, or fear of losing friends.",
      icon: MessageCircle,
      color: "#34d399"
    },
    {
      id: 6,
      title: "Family Expectations",
      description: "Parents pushing for high achievement, career choices, or cultural obligations.",
      icon: Home,
      color: "#fb923c"
    },
    {
      id: 7,
      title: "Romantic Relationships",
      description: "Crushes, breakups, rejection, or feeling \"left out\" if others are dating.",
      icon: HeartIcon,
      color: "#ec4899"
    },
    {
      id: 8,
      title: "Identity & Self-Discovery",
      description: "Figuring out who they are (values, sexuality, purpose, future direction).",
      icon: Search,
      color: "#4a6cf7"
    },
    {
      id: 9,
      title: "Bullying (offline & online)",
      description: "Harassment, rumors, exclusion, or physical intimidation.",
      icon: Shield,
      color: "#fb923c"
    },
    {
      id: 10,
      title: "Loneliness & Isolation",
      description: "Feeling disconnected, invisible, or not having close friends.",
      icon: Users,
      color: "#4a6cf7"
    },
    {
      id: 11,
      title: "Time Management Stress",
      description: "Balancing school, CCA/ECAs, family, part-time jobs, and personal time.",
      icon: Clock,
      color: "#facc15"
    },
    {
      id: 12,
      title: "Uncertainty About the Future",
      description: "Fear of failure, not knowing what career or path to take.",
      icon: Map,
      color: "#34d399"
    },
    {
      id: 13,
      title: "Financial Struggles",
      description: "Stress around money, comparing lifestyles, or family financial difficulties.",
      icon: DollarSign,
      color: "#34d399"
    },
    {
      id: 14,
      title: "Mental Health Struggles",
      description: "Anxiety, depression, burnout, imposter syndrome.",
      icon: Activity,
      color: "#fb923c"
    },
    {
      id: 15,
      title: "World Events & Bigger Issues",
      description: "Stress from climate change, wars, social injustice, or instability.",
      icon: Globe,
      color: "#4a6cf7"
    }
  ];

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
        <div className="relative mb-16">
          {/* Background decorative elements */}
          <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: PALETTE.blue }}></div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: PALETTE.pink }}></div>
          <div className="absolute top-1/2 -right-8 w-16 h-16 rounded-full opacity-10" style={{ backgroundColor: PALETTE.orange }}></div>
          
          <div className={`relative backdrop-blur-sm rounded-3xl p-8 shadow-2xl border ${
            darkMode 
              ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50' 
              : 'bg-gradient-to-br from-white/90 to-white/70 border-white/50'
          }`}>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: PALETTE.blue }}>
                  <Gamepad2 className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
              </div>
              <div className="flex-1">
                <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Gaming Hub 🎮
                </h1>
                <p className={`text-xl ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Level up your mental health skills through interactive games and challenges. 
                  Turn stress into strength, one game at a time!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Challenge Categories */}
        <div className="mb-8">
          <h2 className={`text-3xl md:text-4xl font-bold text-center mb-4 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Choose Your Challenge 🎯
          </h2>
          <p className={`text-lg text-center max-w-3xl mx-auto ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Explore different areas where teens face challenges. Click on any card to learn more, 
            and look for the game controller icon to play interactive games!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stressors.map((stressor) => {
            const IconComponent = stressor.icon;
            return (
              <div
                key={stressor.id}
                onClick={() => stressor.game && onNavigate('academic-stress-game')}
                className={`group relative rounded-3xl p-6 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer ${
                  darkMode 
                    ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50' 
                    : 'bg-gradient-to-br from-white/90 to-white/70 border border-white/50 shadow-xl'
                } ${stressor.game ? 'ring-2 ring-blue-500/50' : ''}`}
              >
                {/* Decorative gradient overlay */}
                <div 
                  className="absolute inset-0 rounded-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                  style={{ 
                    background: `linear-gradient(135deg, ${stressor.color}20 0%, ${stressor.color}40 100%)`
                  }}
                ></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: stressor.color }}
                    >
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    {stressor.game && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500 text-white text-sm font-semibold">
                        <Gamepad2 className="w-4 h-4" />
                        <span>Play Game</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className={`text-lg font-bold mb-3 leading-tight ${
                    darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {stressor.title}
                  </h3>
                  
                  <p className={`text-sm leading-relaxed ${
                    darkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {stressor.description}
                  </p>
                  
                  {stressor.game && (
                    <div className="mt-4 flex items-center gap-2 text-blue-500 text-sm font-medium">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <span>Interactive Game Available</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Gaming Stats Section */}
        <div className="mt-16">
          <div className={`group relative rounded-3xl p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
            darkMode 
              ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50' 
              : 'bg-gradient-to-br from-white/90 to-white/70 border border-white/50 shadow-xl'
          }`}>
            <div className="absolute inset-0 rounded-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{ 
              background: `linear-gradient(135deg, ${PALETTE.green}20 0%, ${PALETTE.green}40 100%)`
            }}></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: PALETTE.green }}>
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Gaming Progress</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2" style={{ color: PALETTE.blue }}>1</div>
                  <p className={`text-lg font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Games Available</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2" style={{ color: PALETTE.pink }}>15</div>
                  <p className={`text-lg font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Challenge Areas</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2" style={{ color: PALETTE.orange }}>∞</div>
                  <p className={`text-lg font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Skills to Build</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl ${
            darkMode 
              ? 'bg-gradient-to-r from-blue-500 to-pink-500 text-white' 
              : 'bg-gradient-to-r from-blue-500 to-pink-500 text-white'
          }`}>
            <Gamepad2 className="w-6 h-6" />
            <span>Ready to Level Up? Start Playing! 🚀</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gaming;
