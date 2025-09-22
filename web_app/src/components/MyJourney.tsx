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

  const PALETTE = {
    blue: "#4a6cf7",
    pink: "#ec4899", 
    orange: "#fb923c",
    yellow: "#facc15",
    green: "#34d399",
    slate: "#64748b",
  };

  return (
    <div className={`min-h-screen overflow-hidden ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-pink-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Header */}
        <div className="relative mb-12 sm:mb-16">
          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-24 h-24 sm:w-32 sm:h-32 rounded-full opacity-10" style={{ backgroundColor: PALETTE.blue }}></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full opacity-10" style={{ backgroundColor: PALETTE.pink }}></div>
          
          <div className={`relative backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border ${
            darkMode 
              ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50' 
              : 'bg-gradient-to-br from-white/90 to-white/70 border-white/50'
          }`}>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: PALETTE.blue }}>
                  <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></div>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Hey {user?.username}! 👋
                </h1>
                <p className={`text-base sm:text-lg md:text-xl ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Your mental health journey is looking amazing. Here's what you've accomplished so far.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Journey Stats - Modern Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {/* Total Days */}
          <div className={`group relative rounded-3xl p-6 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
            darkMode 
              ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50' 
              : 'bg-gradient-to-br from-white/90 to-white/70 border border-white/50 shadow-xl'
          }`}>
            <div className="absolute inset-0 rounded-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{ 
              background: `linear-gradient(135deg, ${PALETTE.blue}20 0%, ${PALETTE.blue}40 100%)`
            }}></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: PALETTE.blue }}>
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Days Active</h3>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2" style={{ color: PALETTE.blue }}>{journeyStats.totalDays}</div>
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Days on platform</p>
              </div>
            </div>
          </div>

          {/* Mood Entries */}
          <div className={`group relative rounded-3xl p-6 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
            darkMode 
              ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50' 
              : 'bg-gradient-to-br from-white/90 to-white/70 border border-white/50 shadow-xl'
          }`}>
            <div className="absolute inset-0 rounded-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{ 
              background: `linear-gradient(135deg, ${PALETTE.pink}20 0%, ${PALETTE.pink}40 100%)`
            }}></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: PALETTE.pink }}>
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Mood Entries</h3>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2" style={{ color: PALETTE.pink }}>{journeyStats.totalMoodEntries}</div>
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Journal entries</p>
              </div>
            </div>
          </div>

          {/* Average Mood */}
          <div className={`group relative rounded-3xl p-6 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
            darkMode 
              ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50' 
              : 'bg-gradient-to-br from-white/90 to-white/70 border border-white/50 shadow-xl'
          }`}>
            <div className="absolute inset-0 rounded-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{ 
              background: `linear-gradient(135deg, ${PALETTE.green}20 0%, ${PALETTE.green}40 100%)`
            }}></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: PALETTE.green }}>
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Avg Mood</h3>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2" style={{ color: PALETTE.green }}>
                  {journeyStats.averageMood.toFixed(1)}/5
                </div>
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Overall mood</p>
              </div>
            </div>
          </div>

          {/* Current Streak */}
          <div className={`group relative rounded-3xl p-6 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
            darkMode 
              ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50' 
              : 'bg-gradient-to-br from-white/90 to-white/70 border border-white/50 shadow-xl'
          }`}>
            <div className="absolute inset-0 rounded-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{ 
              background: `linear-gradient(135deg, ${PALETTE.yellow}20 0%, ${PALETTE.yellow}40 100%)`
            }}></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: PALETTE.yellow }}>
                  <Zap className="w-6 h-6 text-black" />
                </div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Current Streak</h3>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2" style={{ color: PALETTE.yellow }}>{journeyStats.streakDays}</div>
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Days in a row</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress and Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {/* Mood Improvement */}
          <div className={`group relative rounded-3xl p-6 sm:p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
            darkMode 
              ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50' 
              : 'bg-gradient-to-br from-white/90 to-white/70 border border-white/50 shadow-xl'
          }`}>
            <div className="absolute inset-0 rounded-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{ 
              background: `linear-gradient(135deg, ${PALETTE.orange}20 0%, ${PALETTE.orange}40 100%)`
            }}></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: PALETTE.orange }}>
                  <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Mood Progress</h3>
              </div>
              <div className="text-center">
                {journeyStats.moodImprovement > 0 ? (
                  <div>
                    <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4" style={{ color: PALETTE.green }}>
                      +{journeyStats.moodImprovement.toFixed(1)}
                    </div>
                    <p className={`text-base sm:text-lg ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      🎉 You're improving! Keep up the great work!
                    </p>
                  </div>
                ) : journeyStats.moodImprovement < 0 ? (
                  <div>
                    <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4" style={{ color: PALETTE.orange }}>
                      {journeyStats.moodImprovement.toFixed(1)}
                    </div>
                    <p className={`text-base sm:text-lg ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      💪 Remember, progress isn't always linear. You've got this!
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4" style={{ color: PALETTE.blue }}>0.0</div>
                    <p className={`text-base sm:text-lg ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      📊 Keep tracking to see your progress!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className={`group relative rounded-3xl p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
            darkMode 
              ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50' 
              : 'bg-gradient-to-br from-white/90 to-white/70 border border-white/50 shadow-xl'
          }`}>
            <div className="absolute inset-0 rounded-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{ 
              background: `linear-gradient(135deg, ${PALETTE.yellow}20 0%, ${PALETTE.yellow}40 100%)`
            }}></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: PALETTE.yellow }}>
                  <Award className="w-8 h-8 text-black" />
                </div>
                <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Achievements</h3>
              </div>
              <div className="space-y-4">
                {journeyStats.achievements.length > 0 ? (
                  journeyStats.achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: PALETTE.green }}>
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {achievement.achievementTitle}
                        </span>
                        <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          {achievement.achievementDescription}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🏆</div>
                    <p className={`text-lg ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      Keep using the platform to unlock achievements!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`group relative rounded-3xl p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl mb-16 ${
          darkMode 
            ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50' 
            : 'bg-gradient-to-br from-white/90 to-white/70 border border-white/50 shadow-xl'
        }`}>
          <div className="absolute inset-0 rounded-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{ 
            background: `linear-gradient(135deg, ${PALETTE.slate}20 0%, ${PALETTE.slate}40 100%)`
          }}></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: PALETTE.slate }}>
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Recent Activity</h3>
            </div>
            
            <div className="space-y-4">
              {journeyStats.recentActivity.length > 0 ? (
                journeyStats.recentActivity.map((activity) => {
                  const IconComponent = getEventIcon(activity.eventType);
                  const eventColors = {
                    'mood_entry': PALETTE.pink,
                    'chat_session': PALETTE.blue,
                    'gaming_session': PALETTE.green,
                    'community_event': PALETTE.orange,
                    'achievement': PALETTE.yellow,
                    'login': PALETTE.green,
                    'logout': PALETTE.slate,
                  };
                  const eventColor = eventColors[activity.eventType as keyof typeof eventColors] || PALETTE.slate;
                  
                  return (
                    <div
                      key={activity.id}
                      className={`group/item flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:scale-102 ${
                        darkMode 
                          ? 'bg-white/5 hover:bg-white/10' 
                          : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: eventColor }}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {activity.eventTitle}
                        </h4>
                        <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          {activity.eventDescription}
                        </p>
                      </div>
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                        darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <div className="text-8xl mb-6">📝</div>
                  <p className={`text-xl ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    No recent activity. Start using the platform to see your journey here!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Platform Usage Summary */}
        <div className={`group relative rounded-3xl p-6 sm:p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
          darkMode 
            ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50' 
            : 'bg-gradient-to-br from-white/90 to-white/70 border border-white/50 shadow-xl'
        }`}>
          <div className="absolute inset-0 rounded-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{ 
            background: `linear-gradient(135deg, ${PALETTE.blue}20 0%, ${PALETTE.blue}40 100%)`
          }}></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: PALETTE.blue }}>
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Platform Usage</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center group/stat">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-3 sm:mb-4 group-hover/stat:scale-110 transition-transform duration-300" style={{ backgroundColor: PALETTE.blue }}>
                  <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: PALETTE.blue }}>{journeyStats.totalChatSessions}</div>
                <p className={`text-base sm:text-lg font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Chat Sessions</p>
              </div>
              
              <div className="text-center group/stat">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-3 sm:mb-4 group-hover/stat:scale-110 transition-transform duration-300" style={{ backgroundColor: PALETTE.green }}>
                  <Gamepad2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: PALETTE.green }}>{journeyStats.totalGamingSessions}</div>
                <p className={`text-base sm:text-lg font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Gaming Sessions</p>
              </div>
              
              <div className="text-center group/stat">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-3 sm:mb-4 group-hover/stat:scale-110 transition-transform duration-300" style={{ backgroundColor: PALETTE.orange }}>
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: PALETTE.orange }}>{journeyStats.totalCommunityEvents}</div>
                <p className={`text-base sm:text-lg font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Community Events</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyJourney;
