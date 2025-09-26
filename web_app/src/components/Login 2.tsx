import React, { useState } from 'react';
import { Brain, User, Shield } from 'lucide-react';
import { useSession } from '../utils/sessionContext';

interface LoginProps {
  darkMode: boolean;
}

const Login: React.FC<LoginProps> = ({ darkMode }) => {
  const { login } = useSession();
  const [username, setUsername] = useState('');
  const [accountType, setAccountType] = useState<'admin' | 'user'>('user');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      login(username.trim(), accountType);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      darkMode 
        ? 'bg-[#343541]' 
        : ''
    }`} style={{ backgroundColor: darkMode ? undefined : '#f1efef' }}>
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-xl transition-colors duration-300 ${
        darkMode 
          ? 'bg-[#40414F] border border-gray-700' 
          : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#4a6cf7' }}>
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            Welcome to SAMH Platform
          </h1>
          <p className={`text-sm ${
            darkMode ? 'text-gray-300' : 'text-slate-600'
          }`}>
            Please enter your details to continue
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-slate-700'
            }`}>
              Username
            </label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                darkMode ? 'text-gray-400' : 'text-slate-400'
              }`} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-[#343541] border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-slate-800 placeholder-slate-400 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                required
              />
            </div>
          </div>

          {/* Account Type Selection */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${
              darkMode ? 'text-gray-300' : 'text-slate-700'
            }`}>
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccountType('user')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                  accountType === 'user'
                    ? 'border-blue-500 bg-blue-500/10'
                    : darkMode
                      ? 'border-gray-600 hover:border-gray-500 bg-[#343541]'
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
              >
                <User className={`w-6 h-6 ${
                  accountType === 'user' 
                    ? 'text-blue-500' 
                    : darkMode ? 'text-gray-400' : 'text-slate-500'
                }`} />
                <span className={`text-sm font-medium ${
                  accountType === 'user' 
                    ? 'text-blue-500' 
                    : darkMode ? 'text-gray-300' : 'text-slate-700'
                }`}>
                  User
                </span>
              </button>
              
              <button
                type="button"
                onClick={() => setAccountType('admin')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                  accountType === 'admin'
                    ? 'border-blue-500 bg-blue-500/10'
                    : darkMode
                      ? 'border-gray-600 hover:border-gray-500 bg-[#343541]'
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
              >
                <Shield className={`w-6 h-6 ${
                  accountType === 'admin' 
                    ? 'text-blue-500' 
                    : darkMode ? 'text-gray-400' : 'text-slate-500'
                }`} />
                <span className={`text-sm font-medium ${
                  accountType === 'admin' 
                    ? 'text-blue-500' 
                    : darkMode ? 'text-gray-300' : 'text-slate-700'
                }`}>
                  Admin
                </span>
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={!username.trim()}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              username.trim()
                ? 'text-white hover:shadow-lg transform hover:scale-[1.02]'
                : darkMode 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            style={{ 
              backgroundColor: username.trim() ? '#4a6cf7' : undefined 
            }}
          >
            Continue to Platform
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center">
          <p className={`text-xs ${
            darkMode ? 'text-gray-400 border-gray-700' : 'text-slate-500 border-gray-200'
          }`}>
            No authentication required - session info only
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
