import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  TrendingUp, 
  Award, 
  Target, 
  Heart, 
  MessageCircle, 
  Gamepad2, 
  BarChart3,
  CheckCircle,
  Activity,
  Users,
  Zap,
  LogOut
} from 'lucide-react';
import { useSession } from '../utils/sessionContext';
import { sharedDatabase, type MoodEntry, type UserJourneyEvent, type UserAchievement } from '../utils/sharedDatabase';

interface MyJourneyProps {
  darkMode: boolean;
}

interface JourneyStats {
  totalDays: number;
  totalMoodEntries: number;
  averageMood: number;
  moodImprovement: number;
  totalChatSessions: number;
  totalGamingSessions: number;
  totalCommunityEvents: number;
  streakDays: number;
  achievements: UserAchievement[];
  recentActivity: UserJourneyEvent[];
}


const MyJourney: React.FC<MyJourneyProps> = ({ darkMode }) => {
  const { user } = useSession();
  const [journeyStats, setJourneyStats] = useState<JourneyStats | null>(null);
  const [, setMoodEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJourneyData();
  }, [user]);

  const loadJourneyData = async () => {
    try {
      setLoading(true);
      
      if (!user) return;
      
      // Load mood entries
      await sharedDatabase.initialize();
      const entries = await sharedDatabase.getAllMoodEntries();
      setMoodEntries(entries);

      // Load journey events and achievements
      const [journeyEvents, achievements] = await Promise.all([
        sharedDatabase.getJourneyEvents(user.username).catch(() => []),
        sharedDatabase.getAchievements(user.username).catch(() => [])
      ]);

      // Calculate journey stats
      const stats = calculateJourneyStats(entries, journeyEvents, achievements);
      setJourneyStats(stats);
    } catch (error) {
      console.error('Error loading journey data:', error);
      // Fallback to localStorage
      const savedEntries = localStorage.getItem('moodEntries');
      if (savedEntries) {
        const entries = JSON.parse(savedEntries);
        setMoodEntries(entries);
        setJourneyStats(calculateJourneyStats(entries, [], []));
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateJourneyStats = (entries: MoodEntry[], journeyEvents: UserJourneyEvent[], achievements: UserAchievement[]): JourneyStats => {
    const now = Date.now();
    const loginTime = user?.loginTime || now;
    const totalDays = Math.ceil((now - loginTime) / (1000 * 60 * 60 * 24));
    
    const totalMoodEntries = entries.length;
    const averageMood = entries.length > 0 
      ? entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length 
      : 0;

    // Calculate mood improvement (comparing first 3 entries vs last 3 entries)
    let moodImprovement = 0;
    if (entries.length >= 6) {
      const firstThree = entries.slice(-3).reduce((sum, entry) => sum + entry.mood, 0) / 3;
      const lastThree = entries.slice(0, 3).reduce((sum, entry) => sum + entry.mood, 0) / 3;
      moodImprovement = lastThree - firstThree;
    }

    // Calculate streak (consecutive days with entries)
    let streakDays = 0;
    if (entries.length > 0) {
      const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const today = new Date().toDateString();
      let currentStreak = 0;
      
      for (let i = 0; i < sortedEntries.length; i++) {
        const entryDate = new Date(sortedEntries[i].date).toDateString();
        const expectedDate = new Date(Date.now() - (currentStreak * 24 * 60 * 60 * 1000)).toDateString();
        
        if (entryDate === expectedDate || (i === 0 && entryDate === today)) {
          currentStreak++;
        } else {
          break;
        }
      }
      streakDays = currentStreak;
    }

    // Count different types of events
    const totalChatSessions = journeyEvents.filter(e => e.eventType === 'chat_session').length;
    const totalGamingSessions = journeyEvents.filter(e => e.eventType === 'gaming_session').length;
    const totalCommunityEvents = journeyEvents.filter(e => e.eventType === 'community_event').length;

    // Get recent activity (last 5 events)
    const recentActivity = journeyEvents
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    return {
      totalDays,
      totalMoodEntries,
      averageMood,
      moodImprovement,
      totalChatSessions,
      totalGamingSessions,
      totalCommunityEvents,
      streakDays,
      achievements,
      recentActivity
    };
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'mood_entry': return Heart;
      case 'chat_session': return MessageCircle;
      case 'gaming_session': return Gamepad2;
      case 'community_event': return Users;
      case 'achievement': return Award;
      case 'login': return User;
      case 'logout': return LogOut;
      default: return Activity;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'mood_entry': return 'text-pink-500';
      case 'chat_session': return 'text-blue-500';
      case 'gaming_session': return 'text-green-500';
      case 'community_event': return 'text-purple-500';
      case 'achievement': return 'text-yellow-500';
      case 'login': return 'text-green-600';
      case 'logout': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };


  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${
        darkMode ? 'text-white' : 'text-slate-800'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your journey...</p>
        </div>
      </div>
    );
  }

  if (!journeyStats) {
    return (
      <div className={`text-center py-12 ${
        darkMode ? 'text-white' : 'text-slate-800'
      }`}>
        <div className="text-6xl mb-4">🚀</div>
        <h2 className="text-2xl font-bold mb-2">Start Your Journey</h2>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Begin tracking your mental health journey to see your progress here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl ${
        darkMode 
          ? 'bg-[#40414F] border border-gray-700' 
          : 'bg-white/90 backdrop-blur-sm border border-blue-100'
      }`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4a6cf7' }}>
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-blue-900'
            }`}>
              My Journey
            </h2>
            <p className={`${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Welcome back, {user?.username}! Here's your mental health journey overview.
            </p>
          </div>
        </div>
      </div>

      {/* Journey Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Days */}
        <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300 ${
          darkMode 
            ? 'bg-[#40414F] border-gray-700' 
            : 'bg-white/90 border-blue-100'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-blue-600" size={24} />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-blue-900'}`}>Days Active</h3>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">{journeyStats.totalDays}</div>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Days on platform</p>
          </div>
        </div>

        {/* Mood Entries */}
        <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300 ${
          darkMode 
            ? 'bg-[#40414F] border-gray-700' 
            : 'bg-white/90 border-blue-100'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <Heart className="text-pink-600" size={24} />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-blue-900'}`}>Mood Entries</h3>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600 mb-1">{journeyStats.totalMoodEntries}</div>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Journal entries</p>
          </div>
        </div>

        {/* Average Mood */}
        <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300 ${
          darkMode 
            ? 'bg-[#40414F] border-gray-700' 
            : 'bg-white/90 border-blue-100'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-green-600" size={24} />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-blue-900'}`}>Avg Mood</h3>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {journeyStats.averageMood.toFixed(1)}/5
            </div>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Overall mood</p>
          </div>
        </div>

        {/* Current Streak */}
        <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300 ${
          darkMode 
            ? 'bg-[#40414F] border-gray-700' 
            : 'bg-white/90 border-blue-100'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <Zap className="text-yellow-600" size={24} />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-blue-900'}`}>Current Streak</h3>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-1">{journeyStats.streakDays}</div>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Days in a row</p>
          </div>
        </div>
      </div>

      {/* Progress and Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Improvement */}
        <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border ${
          darkMode 
            ? 'bg-[#40414F] border-gray-700' 
            : 'bg-white/90 border-blue-100'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-purple-600" size={24} />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-blue-900'}`}>Mood Progress</h3>
          </div>
          <div className="text-center">
            {journeyStats.moodImprovement > 0 ? (
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  +{journeyStats.moodImprovement.toFixed(1)}
                </div>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  🎉 You're improving! Keep up the great work!
                </p>
              </div>
            ) : journeyStats.moodImprovement < 0 ? (
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {journeyStats.moodImprovement.toFixed(1)}
                </div>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  💪 Remember, progress isn't always linear. You've got this!
                </p>
              </div>
            ) : (
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">0.0</div>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  📊 Keep tracking to see your progress!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border ${
          darkMode 
            ? 'bg-[#40414F] border-gray-700' 
            : 'bg-white/90 border-blue-100'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <Award className="text-yellow-600" size={24} />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-blue-900'}`}>Achievements</h3>
          </div>
          <div className="space-y-2">
            {journeyStats.achievements.length > 0 ? (
              journeyStats.achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {achievement.achievementTitle}
                    </span>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {achievement.achievementDescription}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Keep using the platform to unlock achievements!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border ${
        darkMode 
          ? 'bg-[#40414F] border-gray-700' 
          : 'bg-white/90 border-blue-100'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <Activity className="text-cyan-600" size={24} />
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-blue-900'}`}>Recent Activity</h3>
        </div>
        
        <div className="space-y-4">
          {journeyStats.recentActivity.length > 0 ? (
            journeyStats.recentActivity.map((activity) => {
              const IconComponent = getEventIcon(activity.eventType);
              const color = getEventColor(activity.eventType);
              return (
                <div
                  key={activity.id}
                  className={`border rounded-xl p-4 transition-colors duration-200 ${
                    darkMode 
                      ? 'border-gray-700 hover:bg-gray-700/50' 
                      : 'border-blue-100 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-5 h-5 ${color}`} />
                      <div>
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {activity.eventTitle}
                        </h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {activity.eventDescription}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📝</div>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                No recent activity. Start using the platform to see your journey here!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Platform Usage Summary */}
      <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg border ${
        darkMode 
          ? 'bg-[#40414F] border-gray-700' 
          : 'bg-white/90 border-blue-100'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="text-indigo-600" size={24} />
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-blue-900'}`}>Platform Usage</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">{journeyStats.totalChatSessions}</div>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Chat Sessions</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-3">
              <Gamepad2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">{journeyStats.totalGamingSessions}</div>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Gaming Sessions</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mx-auto mb-3">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-1">{journeyStats.totalCommunityEvents}</div>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Community Events</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyJourney;
