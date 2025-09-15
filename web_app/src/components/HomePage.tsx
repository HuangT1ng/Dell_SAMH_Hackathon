import React from 'react';
import { Brain, TrendingUp, Users, Heart, ArrowRight, Star } from 'lucide-react';

interface HomePageProps {
  darkMode: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ darkMode }) => {
  const features = [
    {
      icon: Heart,
      title: 'Mood Tracking',
      description: 'Track your daily mood and mental health journey with our intuitive interface.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Manage user profiles and levels with our comprehensive dashboard system.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: TrendingUp,
      title: 'Analytics',
      description: 'Visualize your mood trends and patterns with beautiful charts and insights.',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const stats = [
    { label: 'Total Users', value: '1,234', icon: Users },
    { label: 'Mood Entries', value: '5,678', icon: Heart },
    { label: 'Active Sessions', value: '89', icon: TrendingUp }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className={`text-center py-12 rounded-2xl ${
        darkMode 
          ? 'bg-[#40414F] border border-gray-700' 
          : 'bg-white/90 backdrop-blur-sm border border-blue-100'
      }`}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${
            darkMode ? 'text-white' : 'text-blue-900'
          }`}>
            Welcome to{' '}
            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
              SAMH Platform
            </span>
          </h1>
          <p className={`text-xl mb-8 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Your comprehensive mental health and user management platform. 
            Track moods, manage users, and gain insights into your wellness journey.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 flex items-center gap-2">
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className={`px-8 py-3 rounded-xl font-semibold border-2 transition-all duration-200 ${
              darkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-blue-200 text-blue-700 hover:bg-blue-50'
            }`}>
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`p-6 rounded-xl transition-all duration-300 ${
            darkMode 
              ? 'bg-[#40414F] border border-gray-700' 
              : 'bg-white/90 backdrop-blur-sm border border-blue-100'
          }`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-blue-900'
                }`}>
                  {stat.value}
                </p>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div className={`p-8 rounded-2xl ${
        darkMode 
          ? 'bg-[#40414F] border border-gray-700' 
          : 'bg-white/90 backdrop-blur-sm border border-blue-100'
      }`}>
        <h2 className={`text-3xl font-bold text-center mb-8 ${
          darkMode ? 'text-white' : 'text-blue-900'
        }`}>
          Platform Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${
                darkMode ? 'text-white' : 'text-blue-900'
              }`}>
                {feature.title}
              </h3>
              <p className={`${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className={`p-8 rounded-2xl text-center ${
        darkMode 
          ? 'bg-gradient-to-r from-blue-900/50 to-cyan-900/50 border border-gray-700' 
          : 'bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100'
      }`}>
        <h2 className={`text-2xl font-bold mb-4 ${
          darkMode ? 'text-white' : 'text-blue-900'
        }`}>
          Ready to Start Your Journey?
        </h2>
        <p className={`mb-6 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Join thousands of users who are already tracking their mental health and managing their wellness journey.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Start Tracking
          </button>
          <button className={`px-6 py-3 rounded-xl font-semibold border-2 transition-all duration-200 ${
            darkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-blue-200 text-blue-700 hover:bg-blue-50'
          }`}>
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;



