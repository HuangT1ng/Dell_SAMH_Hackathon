import React, { useState, useEffect } from 'react';
import { Search, Download, RefreshCw, Users, MessageSquare, User } from 'lucide-react';

interface RedditDashboardProps {
  darkMode: boolean;
  onNavigateToChat?: (samhUsername: string) => void;
}

interface ScrapperData {
  id: string;
  title: string;
  content: string;
  author: string;
  subreddit: string;
  upvotes: number;
  comments: number;
  timestamp: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  platform: 'REDDIT' | 'FACEBOOK' | 'X';
  samh_username?: string;
}

// Environment-aware API configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001' 
  : 'https://backend-ntu.apps.innovate.sg-cna.com';

const RedditDashboard: React.FC<RedditDashboardProps> = ({ darkMode, onNavigateToChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<ScrapperData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [postStatuses, setPostStatuses] = useState<{[key: string]: 'unattended' | 'pending' | 'ready' | 'attended'}>({});
  const [buttonStates, setButtonStates] = useState<{[key: string]: boolean}>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load persisted status states from localStorage
  const loadPersistedStatuses = () => {
    try {
      const savedStatuses = localStorage.getItem('redditDashboardStatuses');
      if (savedStatuses) {
        const parsedStatuses = JSON.parse(savedStatuses);
        console.log('Loading persisted statuses:', parsedStatuses);
        setPostStatuses(parsedStatuses);
      }
      
      const savedButtonStates = localStorage.getItem('redditDashboardButtonStates');
      if (savedButtonStates) {
        const parsedButtonStates = JSON.parse(savedButtonStates);
        console.log('Loading persisted button states:', parsedButtonStates);
        setButtonStates(parsedButtonStates);
      }
      
      // Mark initial load as complete
      setIsInitialLoad(false);
    } catch (error) {
      console.error('Error loading persisted statuses:', error);
      setIsInitialLoad(false);
    }
  };

  // Save status states to localStorage whenever they change
  useEffect(() => {
    // Don't save during initial load to avoid overwriting persisted data
    if (!isInitialLoad && Object.keys(postStatuses).length > 0) {
      try {
        console.log('Saving statuses to localStorage:', postStatuses);
        localStorage.setItem('redditDashboardStatuses', JSON.stringify(postStatuses));
      } catch (error) {
        console.error('Error saving statuses to localStorage:', error);
      }
    }
  }, [postStatuses, isInitialLoad]);

  // Save button states to localStorage whenever they change
  useEffect(() => {
    // Don't save during initial load to avoid overwriting persisted data
    if (!isInitialLoad && Object.keys(buttonStates).length > 0) {
      try {
        console.log('Saving button states to localStorage:', buttonStates);
        localStorage.setItem('redditDashboardButtonStates', JSON.stringify(buttonStates));
      } catch (error) {
        console.error('Error saving button states to localStorage:', error);
      }
    }
  }, [buttonStates, isInitialLoad]);

  const loadData = async () => {
    setIsLoadingData(true);
    setStatus('Loading...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/mental-health-posts`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const posts = await response.json();
      setData(posts);
      
      // Load persisted states after data is loaded
      loadPersistedStatuses();
      
      // Clear status after 3 seconds
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error loading data:', error);
      setStatus('❌ Error loading data. Please check if the backend server is running.');
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleRefresh = async () => {
    await loadData();
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Title,Author,SAMH_Username,Subreddit,Upvotes,Comments,Sentiment,Timestamp\n" +
      filteredData.map(item => 
        `"${item.title}","${item.author}","${item.samh_username || 'Not assigned'}","${item.subreddit || 'N/A'}","${item.upvotes || 0}","${item.comments || 0}","${item.sentiment}","${item.timestamp}"`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reddit_mental_health_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = data.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      case 'negative': return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSentimentColorDark = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-900/30 text-green-300 border-green-700';
      case 'negative': return 'bg-red-900/30 text-red-300 border-red-700';
      case 'neutral': return 'bg-gray-700 text-gray-300 border-gray-600';
      default: return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  const getStatusColor = (status: 'unattended' | 'pending' | 'ready' | 'attended') => {
    switch (status) {
      case 'unattended': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'attended': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColorDark = (status: 'unattended' | 'pending' | 'ready' | 'attended') => {
    switch (status) {
      case 'unattended': return 'bg-red-900/30 text-red-300 border-red-700';
      case 'pending': return 'bg-yellow-900/30 text-yellow-300 border-yellow-700';
      case 'ready': return 'bg-green-900/30 text-green-300 border-green-700';
      case 'attended': return 'bg-blue-900/30 text-blue-300 border-blue-700';
      default: return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  const handleConsentClick = (postId: string) => {
    const isDimmed = buttonStates[postId] || false;
    
    if (isDimmed) {
      // Return to normal state and reset status
      setButtonStates(prev => ({ ...prev, [postId]: false }));
      setPostStatuses(prev => ({ ...prev, [postId]: 'unattended' }));
    } else {
      // Make it dimmed and start status progression
      setButtonStates(prev => ({ ...prev, [postId]: true }));
      
      // Set to pending immediately
      setPostStatuses(prev => ({ ...prev, [postId]: 'pending' }));
      
      setTimeout(() => {
        setPostStatuses(prev => ({ ...prev, [postId]: 'ready' }));
      }, 2000);
    }
  };

  const handleReadyToChatClick = async (postId: string) => {
    try {
      // Find the post data
      const post = data.find(item => item.id === postId);
      if (!post) {
        console.error('Post not found:', postId);
        return;
      }

      // Check if the post has a SAMH username
      if (!post.samh_username) {
        setStatus('❌ No SAMH username found for this author. Cannot initiate chat.');
        setTimeout(() => setStatus(''), 5000);
        return;
      }

      console.log('Ready to chat clicked for post:', postId, 'SAMH username:', post.samh_username);
      
      // Update the post status to "attended" immediately
      setPostStatuses(prev => {
        const newStatuses: {[key: string]: 'unattended' | 'pending' | 'ready' | 'attended'} = {
          ...prev,
          [postId]: 'attended'
        };
        
        // Save to localStorage immediately
        try {
          localStorage.setItem('redditDashboardStatuses', JSON.stringify(newStatuses));
          console.log('✅ Status saved to localStorage:', newStatuses);
        } catch (error) {
          console.error('Error saving status to localStorage:', error);
        }
        
        return newStatuses;
      });
      
      // Call the navigation callback if provided (with small delay to show status change)
      if (onNavigateToChat && post.samh_username) {
        setTimeout(() => {
          onNavigateToChat(post.samh_username!);
        }, 500); // Small delay to show "Attended to" status
      } else {
        setStatus('✅ SAMH username found: ' + post.samh_username + '. Navigation to chat not configured.');
        setTimeout(() => setStatus(''), 5000);
      }
    } catch (error) {
      console.error('Error handling ready to chat:', error);
      setStatus('❌ Error initiating chat. Please try again.');
      setTimeout(() => setStatus(''), 5000);
    }
  };


  return (
    <div className="space-y-0">
      {/* Header */}
      <div className={`rounded-xl border transition-all duration-300 ${
          darkMode 
          ? 'bg-[#40414F] border-gray-700' 
          : 'bg-white/90 backdrop-blur-sm border-blue-100'
      }`}>
        <div className={`${isMobile ? 'p-3' : 'p-4'}`}>
          <div className={`${isMobile ? 'space-y-4' : 'flex justify-between items-center'}`}>
            <div>
              <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold ${
                darkMode ? 'text-white' : 'text-slate-800'
              }`}>
                Mental Health Data Dashboard
              </h2>
              <p className={`text-sm mt-1 ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Monitor and manage mental health posts from social media
              </p>
            </div>
            <div className={`flex gap-3 ${isMobile ? 'justify-center' : ''}`}>
              <button
                onClick={handleRefresh}
                disabled={isLoadingData}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                  isLoadingData
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'text-white'
                }`}
                style={{ backgroundColor: isLoadingData ? undefined : '#4a6cf7' }}
              >
                {isLoadingData ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {isLoadingData ? 'Loading...' : 'Refresh'}
              </button>
              <button
                onClick={handleExport}
                disabled={data.length === 0}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 border ${
                  data.length === 0
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : darkMode 
                      ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                      : 'border-gray-300 text-slate-700 hover:bg-gray-50'
                }`}
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
          {status && (
            <div className={`mt-3 px-3 py-2 rounded text-sm ${
            darkMode 
                ? 'bg-blue-600/20 text-blue-300' 
                : 'bg-blue-100 text-blue-700'
          }`}>
              {status}
            </div>
          )}
          </div>
      </div>

      {/* Search Filter */}
      <div className={`rounded-xl border transition-all duration-300 ${
        darkMode 
          ? 'bg-[#40414F] border-gray-700' 
          : 'bg-white/90 backdrop-blur-sm border-blue-100'
      }`}>
        <div className={`${isMobile ? 'p-2' : 'p-3'}`}>
          <div className={`relative ${isMobile ? 'w-full' : 'max-w-2xl'}`}>
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={isMobile ? "Search posts..." : "Search posts by title, content, or author..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                darkMode 
                  ? 'bg-slate-700 border-slate-600 text-white focus:ring-blue-500' 
                  : 'bg-white border-gray-300 text-slate-900 focus:ring-blue-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Data Display */}
      <div className={`rounded-xl border overflow-hidden shadow-lg transition-all duration-300 ${
              darkMode 
          ? 'bg-[#40414F] border-gray-700' 
          : 'bg-white/90 backdrop-blur-sm border-blue-100'
      }`}>
        {isMobile ? (
          // Mobile Card Layout
          <div className="p-4 space-y-4">
            {isLoadingData ? (
              <div className="flex flex-col items-center justify-center py-16">
                <RefreshCw className="w-10 h-10 animate-spin mb-4 text-blue-500" />
                <p className={`text-lg font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Loading...
                </p>
              </div>
            ) : data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  darkMode ? 'bg-slate-700' : 'bg-gray-100'
                }`}>
                  <Search className={`w-8 h-8 ${
                    darkMode ? 'text-slate-400' : 'text-gray-400'
                  }`} />
                </div>
                <p className={`text-lg font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  No data available
                </p>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Click refresh to load mental health posts
                </p>
              </div>
            ) : (
              filteredData.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    darkMode 
                      ? 'bg-slate-800 border-slate-700' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {/* Author Section */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      darkMode ? 'bg-slate-600' : 'bg-gray-200'
                    }`}>
                      <Users className={`w-5 h-5 ${
                        darkMode ? 'text-slate-300' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <span className={`font-semibold text-base ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.author}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.platform === 'REDDIT' 
                            ? 'bg-orange-100 text-orange-800'
                            : item.platform === 'FACEBOOK'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.platform}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="mb-3">
                    <h4 className={`font-semibold text-base mb-2 leading-tight ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {item.title}
                    </h4>
                    <p className={`text-sm leading-relaxed ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {item.content.length > 100 ? `${item.content.substring(0, 100)}...` : item.content}
                    </p>
                  </div>

                  {/* Sentiment and Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      darkMode ? getSentimentColorDark(item.sentiment) : getSentimentColor(item.sentiment)
                    }`}>
                      <span>{item.sentiment === 'positive' ? '😊' : item.sentiment === 'negative' ? '😔' : '😐'}</span>
                      <span>{item.sentiment}</span>
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      postStatuses[item.id] === 'attended'
                        ? 'bg-green-100 text-green-800'
                        : postStatuses[item.id] === 'ready'
                          ? 'bg-blue-100 text-blue-800'
                          : postStatuses[item.id] === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}>
                      {postStatuses[item.id] === 'attended' ? 'Attended' :
                       postStatuses[item.id] === 'ready' ? 'Ready' :
                       postStatuses[item.id] === 'pending' ? 'Pending' : 'Unattended'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleConsentClick(item.id);
                      }}
                      style={{
                        opacity: buttonStates[item.id] ? '0.6' : '1',
                        transform: buttonStates[item.id] ? 'scale(0.95)' : 'scale(1)'
                      }}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        darkMode 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {postStatuses[item.id] === 'pending' ? 'Processing...' : 'Get Consent'}
                    </button>
                    
                    {postStatuses[item.id] === 'ready' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReadyToChatClick(item.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Chat
                        </button>
                      </div>
                    )}
                  </div>

                  {/* SAMH Username */}
                  {item.samh_username && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <span className={`text-xs ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        SAMH User: {item.samh_username}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          // Desktop Table Layout
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead className={`${
                darkMode ? 'bg-gradient-to-r from-slate-700 to-slate-600' : 'bg-gradient-to-r from-gray-50 to-gray-100'
              }`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-sm font-semibold tracking-wide ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Author
                    </div>
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold tracking-wide ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Content
                    </div>
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold tracking-wide ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Sentiment
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold tracking-wide ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Actions
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold tracking-wide ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Status
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold tracking-wide ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Summary
                    </div>
                  </th>
                </tr>
              </thead>
            
            {/* Table Body */}
            <tbody className={`divide-y ${darkMode ? 'divide-slate-600' : 'divide-gray-200'}`}>
              {isLoadingData ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCw className="w-10 h-10 animate-spin mb-4 text-blue-500" />
                      <p className={`text-lg font-medium ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Loading...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                        darkMode ? 'bg-slate-700' : 'bg-gray-100'
                      }`}>
                        <Search className={`w-8 h-8 ${
                          darkMode ? 'text-slate-400' : 'text-gray-400'
                        }`} />
                      </div>
                      <p className={`text-lg font-medium mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        No data available
                      </p>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Click refresh to load mental health posts
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.map((item, index) => (
                <tr 
                  key={item.id}
                  className={`transition-all duration-200 ${
                    darkMode 
                      ? 'hover:bg-slate-700/50' 
                      : 'hover:bg-blue-50/50'
                  } ${index % 2 === 0 ? (darkMode ? 'bg-slate-800' : 'bg-white') : (darkMode ? 'bg-slate-750' : 'bg-gray-50/30')}`}
                >
                  {/* Author */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        darkMode ? 'bg-slate-600' : 'bg-gray-200'
                      }`}>
                        <Users className={`w-5 h-5 ${
                          darkMode ? 'text-slate-300' : 'text-gray-600'
                        }`} />
                </div>
                <div>
                        <span className={`font-semibold text-base ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {item.author}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.platform === 'REDDIT' 
                              ? 'bg-orange-100 text-orange-800'
                              : item.platform === 'FACEBOOK'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.platform}
                          </span>
                  </div>
                </div>
              </div>
                  </td>
                  
                  {/* Content */}
                  <td className="px-6 py-4">
                    <div className="max-w-2xl">
                      <h4 className={`font-semibold text-base mb-2 leading-tight ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.title}
                      </h4>
                      <p className={`text-sm leading-relaxed mb-3 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {item.content.length > 150 ? `${item.content.substring(0, 150)}...` : item.content}
                      </p>
            </div>
                  </td>
                  
                  
                  {/* Sentiment */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      darkMode ? getSentimentColorDark(item.sentiment) : getSentimentColor(item.sentiment)
                    }`}>
                      <span>{item.sentiment === 'positive' ? '😊' : item.sentiment === 'negative' ? '😔' : '😐'}</span>
                      <span>{item.sentiment}</span>
                    </span>
                  </td>

            {/* Actions */}
                  <td className="px-6 py-4">
                    <button
                      data-post-id={item.id}
                      onClick={(e) => {
                        e.preventDefault();
                        handleConsentClick(item.id);
                      }}
                      style={{
                        opacity: buttonStates[item.id] ? '0.6' : '1',
                        transform: buttonStates[item.id] ? 'scale(0.95)' : 'scale(1)'
                      }}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        darkMode 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      } hover:shadow-lg transform hover:scale-105 active:scale-95 active:opacity-60`}
                    >
                      Get Consent
                    </button>
                  </td>
                  
                  {/* Status */}
                  <td className="px-6 py-4 text-center">
                    {postStatuses[item.id] === 'ready' ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleReadyToChatClick(item.id);
                        }}
                        className={`inline-flex items-center justify-center px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105 active:scale-95 ${
                          darkMode 
                            ? getStatusColorDark('ready')
                            : getStatusColor('ready')
                        }`}
                      >
                        Ready To Chat
                      </button>
                    ) : (
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${
                        darkMode 
                          ? getStatusColorDark(postStatuses[item.id] || 'unattended')
                          : getStatusColor(postStatuses[item.id] || 'unattended')
                      }`}>
                        {postStatuses[item.id] === 'pending' ? 'Pending' : 
                         postStatuses[item.id] === 'attended' ? 'Attending' : 'Unattended'}
                      </span>
                    )}
                  </td>

                  {/* Summary */}
                  <td className="px-6 py-4 text-center">
                    {item.samh_username ? (
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${
                        darkMode 
                          ? 'bg-green-600 text-green-200' 
                          : 'bg-green-200 text-green-800'
                      }`}>
                        Available
                      </span>
                    ) : (
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${
                        darkMode 
                          ? 'bg-gray-600 text-gray-300' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        Not SAMH User
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {filteredData.length === 0 && !isLoadingData && data.length > 0 && (
        <div className={`text-center py-8 ${
          darkMode ? 'text-slate-400' : 'text-gray-600'
        }`}>
          <p>No posts found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default RedditDashboard;