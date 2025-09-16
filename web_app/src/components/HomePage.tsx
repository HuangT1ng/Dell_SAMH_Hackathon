import React from 'react';
import { Brain, ArrowRight, Star, Mail, Phone, MapPin } from 'lucide-react';

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
    } rounded-2xl p-8 shadow-lg border ${
      darkMode ? 'border-slate-700' : 'border-gray-200'
    }`}>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Hero Image */}
          <div className="relative">
            <div className={`w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl ${
              darkMode 
                ? 'bg-gradient-to-br from-slate-700 to-slate-600' 
                : 'bg-gradient-to-br from-gray-100 to-gray-200'
            }`}>
              {/* Professional Image Placeholder */}
              <div className="w-full h-full flex items-center justify-center">
                <div className={`w-48 h-48 rounded-full flex items-center justify-center shadow-xl ${
                  darkMode 
                    ? 'bg-gradient-to-br from-slate-600 to-slate-700' 
                    : ''
                }`} style={{ backgroundColor: darkMode ? undefined : '#4a6cf7' }}>
                  <Brain className="w-24 h-24 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-8">
            <div>
              <h1 className={`text-5xl lg:text-7xl font-light mb-4 ${
                darkMode ? 'text-white' : 'text-slate-800'
              }`}>
                SAMH
              </h1>
              <h2 className={`text-5xl lg:text-7xl font-light mb-8 ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Platform
              </h2>
              <div className={`w-24 h-px ${
                darkMode ? 'bg-slate-400' : 'bg-slate-500'
              } mb-8`}></div>
              <p className={`text-xl font-light ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Ph.D. Clinical Mental Health Specialist
              </p>
            </div>

            <div className="space-y-6">
              <p className={`text-lg leading-relaxed ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                I'm a dedicated mental health professional committed to helping you navigate life's challenges. 
                With years of experience in clinical psychology and a passion for holistic wellness, 
                I provide personalized care that honors your unique journey.
              </p>
              <p className={`text-lg leading-relaxed ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                My approach combines evidence-based therapeutic techniques with compassionate understanding, 
                creating a safe space where healing and growth can flourish. Together, we'll work towards 
                your mental wellness goals with dignity and respect.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button className="text-white px-8 py-4 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2" style={{ backgroundColor: '#4a6cf7' }}>
                Schedule Consultation
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className={`px-8 py-4 rounded-xl font-medium border-2 transition-all duration-300 ${
                darkMode 
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-800' 
                  : 'border-gray-300 text-slate-700 hover:bg-gray-50'
              }`}>
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="mt-24">
          <h2 className={`text-4xl font-light text-center mb-16 ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div key={index} className={`p-8 rounded-2xl transition-all duration-300 hover:shadow-xl ${
                darkMode 
                  ? 'bg-slate-800/50 border border-slate-700 hover:bg-slate-800' 
                  : 'bg-gray-50 border border-gray-200 hover:bg-white'
              }`}>
                <h3 className={`text-2xl font-medium mb-4 ${
                  darkMode ? 'text-white' : 'text-slate-800'
                }`}>
                  {service.title}
                </h3>
                <p className={`leading-relaxed ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Areas of Expertise */}
        <div className="mt-24">
          <h2 className={`text-4xl font-light text-center mb-16 ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            Areas of Expertise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expertise.map((area, index) => (
              <div key={index} className={`p-6 rounded-xl text-center transition-all duration-300 ${
                darkMode 
                  ? 'bg-slate-800/30 border border-slate-700 hover:bg-slate-800/50' 
                  : 'bg-gray-50 border border-gray-200 hover:bg-white'
              }`}>
                <p className={`text-lg font-medium ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {area}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className={`mt-24 p-12 rounded-3xl text-center ${
          darkMode 
            ? 'bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-700' 
            : 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200'
        }`}>
          <h2 className={`text-4xl font-light mb-8 ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            Ready to Begin Your Journey?
          </h2>
          <p className={`text-xl mb-12 max-w-3xl mx-auto ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Take the first step towards better mental health. I'm here to support you with 
            compassionate, professional care tailored to your unique needs.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <button className="text-white px-10 py-4 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-3" style={{ backgroundColor: '#4a6cf7' }}>
              <Star className="w-5 h-5" />
              Start Your Journey
            </button>
            <button className={`px-10 py-4 rounded-xl font-medium border-2 transition-all duration-300 ${
              darkMode 
                ? 'border-slate-600 text-slate-300 hover:bg-slate-800' 
                : 'border-gray-300 text-slate-700 hover:bg-gray-50'
            }`}>
              View Resources
            </button>
          </div>
          
          {/* Contact Info */}
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-3">
              <Mail className={`w-5 h-5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`} />
              <span className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                contact@samhplatform.com
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className={`w-5 h-5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`} />
              <span className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                (555) 123-4567
              </span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className={`w-5 h-5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`} />
              <span className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Virtual & In-Person Sessions
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;



