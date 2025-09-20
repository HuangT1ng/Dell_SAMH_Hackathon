import React from 'react';
import { Brain, ArrowRight, Star, Mail, Phone } from 'lucide-react';

interface HomePageProps {
  darkMode: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ darkMode }) => {
  const services = [
    {
      title: 'Individual Therapy',
      description: 'Personalized one-on-one sessions tailored to your specific needs and goals.',
    },
    {
      title: 'Group Therapy',
      description: 'Connect with others facing similar challenges in a supportive group environment.',
    },
    {
      title: 'Mood Analytics',
      description: 'Track and analyze your emotional patterns with advanced data insights.',
    },
    {
      title: 'Crisis Support',
      description: '24/7 emergency mental health support when you need it most.',
    }
  ];

  const expertise = [
    'Anxiety & Depression',
    'Trauma & PTSD',
    'Relationship Issues',
    'Stress Management',
    'Behavioral Therapy',
    'Mindfulness & Meditation'
  ];

  return (
    <div className={`${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700' 
        : 'bg-white'
    } rounded-xl p-4 shadow-lg border ${
      darkMode ? 'border-slate-700' : 'border-gray-200'
    }`}>
      {/* Main Content */}
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl mx-auto ${
            darkMode 
              ? 'bg-gradient-to-br from-slate-600 to-slate-700' 
              : ''
          }`} style={{ backgroundColor: darkMode ? undefined : '#4a6cf7' }}>
            <Brain className="w-12 h-12 text-white" />
          </div>
          
          <div>
            <h1 className={`text-3xl font-light mb-2 ${
              darkMode ? 'text-white' : 'text-slate-800'
            }`}>
              SAMH Platform
            </h1>
            <div className={`w-16 h-px mx-auto ${
              darkMode ? 'bg-slate-400' : 'bg-slate-500'
            } mb-4`}></div>
            <p className={`text-lg font-light ${
              darkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Mental Health Support
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className={`text-base leading-relaxed ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            A dedicated mental health platform committed to helping you navigate life's challenges. 
            With evidence-based therapeutic techniques and compassionate understanding, 
            we provide personalized care that honors your unique journey.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button className="text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2" style={{ backgroundColor: '#4a6cf7' }}>
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className={`px-6 py-3 rounded-xl font-medium border-2 transition-all duration-300 ${
            darkMode 
              ? 'border-slate-600 text-slate-300 hover:bg-slate-800' 
              : 'border-gray-300 text-slate-700 hover:bg-gray-50'
          }`}>
            Learn More
          </button>
        </div>
      </div>

        {/* Services Section */}
        <div className="mt-8">
          <h2 className={`text-2xl font-light text-center mb-6 ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            Services
          </h2>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className={`p-4 rounded-xl transition-all duration-300 ${
                darkMode 
                  ? 'bg-slate-800/50 border border-slate-700' 
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <h3 className={`text-lg font-medium mb-2 ${
                  darkMode ? 'text-white' : 'text-slate-800'
                }`}>
                  {service.title}
                </h3>
                <p className={`text-sm leading-relaxed ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Areas of Expertise */}
        <div className="mt-8">
          <h2 className={`text-2xl font-light text-center mb-6 ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            Areas of Expertise
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {expertise.map((area, index) => (
              <div key={index} className={`p-3 rounded-lg text-center transition-all duration-300 ${
                darkMode 
                  ? 'bg-slate-800/30 border border-slate-700' 
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <p className={`text-sm font-medium ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {area}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className={`mt-8 p-6 rounded-xl text-center ${
          darkMode 
            ? 'bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-700' 
            : 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200'
        }`}>
          <h2 className={`text-2xl font-light mb-4 ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            Ready to Begin?
          </h2>
          <p className={`text-base mb-6 ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Take the first step towards better mental health with compassionate, professional care.
          </p>
          <div className="flex flex-col gap-3 mb-6">
            <button className="text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2" style={{ backgroundColor: '#4a6cf7' }}>
              <Star className="w-4 h-4" />
              Start Your Journey
            </button>
            <button className={`px-6 py-3 rounded-xl font-medium border-2 transition-all duration-300 ${
              darkMode 
                ? 'border-slate-600 text-slate-300 hover:bg-slate-800' 
                : 'border-gray-300 text-slate-700 hover:bg-gray-50'
            }`}>
              View Resources
            </button>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Mail className={`w-4 h-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`} />
              <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                contact@samhplatform.com
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Phone className={`w-4 h-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`} />
              <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                (555) 123-4567
              </span>
            </div>
          </div>
        </div>
      </div>
  );
};

export default HomePage;



