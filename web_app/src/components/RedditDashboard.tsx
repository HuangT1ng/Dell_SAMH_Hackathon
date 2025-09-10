import React, { useState, useMemo } from 'react';
import { Search, Filter, Users, Star, MessageCircle } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  level: 'L1' | 'L2' | 'L3' | 'L4';
  verified: boolean;
}

interface RedditDashboardProps {
  users: UserProfile[];
  darkMode: boolean;
}

const RedditDashboard: React.FC<RedditDashboardProps> = ({ users, darkMode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = selectedLevel === 'all' || user.level === selectedLevel;
      return matchesSearch && matchesLevel;
    });
  }, [searchQuery, selectedLevel, users]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'L4': return 'from-teal-500 to-cyan-500';
      case 'L3': return 'from-blue-500 to-teal-500';
      case 'L2': return 'from-blue-400 to-blue-500';
      case 'L1': return 'from-blue-300 to-blue-400';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getLevelBorderColor = (level: string) => {
    switch (level) {
      case 'L4': return 'border-teal-400';
      case 'L3': return 'border-blue-400';
      case 'L2': return 'border-blue-300';
      case 'L1': return 'border-blue-200';
      default: return 'border-gray-300';
    }
  };

  const stats = {
    totalUsers: users.length,
    l4Users: users.filter(u => u.level === 'L4').length,
    l3Users: users.filter(u => u.level === 'L3').length,
    l2Users: users.filter(u => u.level === 'L2').length,
    l1Users: users.filter(u => u.level === 'L1').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className={`p-4 rounded-xl transition-all duration-300 ${
          darkMode 
            ? 'bg-[#40414F] border border-gray-700' 
            : 'bg-white/90 backdrop-blur-sm border border-blue-100'
        }`}>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Total</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.totalUsers}</p>
        </div>
        
        {(['L4', 'L3', 'L2', 'L1'] as const).map(level => (
          <div key={level} className={`p-4 rounded-xl transition-all duration-300 ${
            darkMode 
              ? 'bg-[#40414F] border border-gray-700' 
              : 'bg-white/90 backdrop-blur-sm border border-blue-100'
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getLevelColor(level)}`}></div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{level}</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {level === 'L4' ? stats.l4Users : 
               level === 'L3' ? stats.l3Users : 
               level === 'L2' ? stats.l2Users : stats.l1Users}
            </p>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className={`p-6 rounded-xl mb-8 transition-all duration-300 ${
        darkMode 
          ? 'bg-[#40414F] border border-gray-700' 
          : 'bg-white/90 backdrop-blur-sm border border-blue-100'
      }`}>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                  : 'bg-white/90 border-blue-100 text-blue-900 focus:ring-blue-500 focus:border-blue-300'
              }`}
            />
          </div>

          {/* Level Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className={`pl-9 pr-8 py-2 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                  : 'bg-white/90 border-blue-100 text-blue-900 focus:ring-blue-500'
              }`}
            >
              <option value="all">All Levels</option>
              <option value="L4">Level 4</option>
              <option value="L3">Level 3</option>
              <option value="L2">Level 2</option>
              <option value="L1">Level 1</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Profiles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className={`group p-6 rounded-xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
              darkMode 
                ? 'bg-[#40414F] border-gray-700 hover:shadow-blue-500/20' 
                : 'bg-white/90 backdrop-blur-sm border-blue-100 hover:shadow-blue-500/30'
            } ${getLevelBorderColor(user.level)}`}
          >
            {/* User Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getLevelColor(user.level)} flex items-center justify-center text-white font-bold text-lg`}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{user.username}</h3>
                    {user.verified && <Star className="w-4 h-4 text-yellow-500" />}
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getLevelColor(user.level)} text-white text-sm font-semibold`}>
                {user.level}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button className={`flex-1 p-2 rounded-lg transition-all duration-300 ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
              }`}>
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className={`text-center py-12 rounded-xl ${
          darkMode ? 'bg-[#40414F]' : 'bg-white/90'
        }`}>
          <Users className={`w-16 h-16 mx-auto mb-4 ${
            darkMode ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className="text-lg font-semibold mb-2">No users found</h3>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default RedditDashboard;
