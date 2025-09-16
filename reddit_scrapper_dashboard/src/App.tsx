import React, { useState } from 'react';
import { Moon, Sun, Search } from 'lucide-react';
import ScrapperOutput from './components/ScrapperOutput';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700' 
        : ''
    }`} style={{ backgroundColor: darkMode ? undefined : '#f1efef' }}>
      {/* Beautiful Header */}
      <header className={`transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600' 
          : 'bg-gradient-to-r from-white to-gray-50 border-b border-gray-200'
      } shadow-lg`}>
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#4a6cf7' }}>
                <Search className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-slate-800'
                }`}>
                  Reddit Mental Health Scraper
                </h1>
                <p className={`text-sm ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Advanced Social Media Mental Health Analysis Dashboard
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-xl transition-all duration-300 shadow-md ${
                darkMode 
                  ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400 border border-slate-600' 
                  : 'bg-white hover:bg-gray-100 text-slate-600 border border-gray-200'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Beautiful Dashboard */}
      <div>
        <ScrapperOutput darkMode={darkMode} />
      </div>
    </div>
  );
}

export default App;