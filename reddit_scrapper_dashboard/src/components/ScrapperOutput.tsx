import React, { useState, useEffect, useRef } from 'react';
import { Search, Download, RefreshCw, ExternalLink, Calendar, TrendingUp, Users, MessageSquare, X, Eye } from 'lucide-react';
import { redditScraper, ScrapingResult } from '../utils/scraper';
import { databaseManager, ScrapperData } from '../utils/database';

interface ScrapperOutputProps {
  darkMode: boolean;
}

const ScrapperOutput: React.FC<ScrapperOutputProps> = ({ darkMode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState<string>('');
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [visibleCards, setVisibleCards] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<ScrapperData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [postsToShow, setPostsToShow] = useState(0);

  // Initialize database connection only (no data loading on mount)
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await databaseManager.initialize();
        console.log('Database connection established');
      } catch (error) {
        console.error('Error connecting to database:', error);
        setScrapingStatus('Error: Backend server not running. Please start the server first.');
      }
    };

    initializeDatabase();
  }, []);

  const filteredData = data.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Handle sequential card appearance
  useEffect(() => {
    if (showSidePanel && filteredData.length > 0) {
      setVisibleCards(0); // Reset visible cards
      const interval = setInterval(() => {
        setVisibleCards(prev => {
          if (prev < filteredData.length) {
            return prev + 1;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 1500); // 3 second interval

      return () => clearInterval(interval);
    } else {
      setVisibleCards(0);
    }
  }, [showSidePanel, filteredData.length]);

  // Auto-scroll to bottom when new card appears
  useEffect(() => {
    if (scrollContainerRef.current && visibleCards > 0) {
      const scrollContainer = scrollContainerRef.current;
      // Small delay to ensure the card is rendered before scrolling
      setTimeout(() => {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [visibleCards]);

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

  const handleScrapeClick = async () => {
    setIsLoading(true);
    setScrapingStatus('Initializing Reddit scraper...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setScrapingStatus('Going Through Posts...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setScrapingStatus('Applying sentiment analysis...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await handleRefresh();
    
    // try {
    //   const result = await redditScraper.openAndScrape();
      
    //   if (result.success) {
    //     setScrapingStatus(`✅ Scraping completed! Found: ${result.title}`);
    //     // Refresh data after successful scraping
    //     await handleRefresh();
    //   } else {
    //     setScrapingStatus(`❌ Scraping failed: ${result.error || 'Unknown error'}`);
    //   }
    // } catch (error) {
    //   console.error('Scraping error:', error);
    //   setScrapingStatus('❌ Scraping failed: Unable to connect to scraper service');
    // } finally {
    //   setIsLoading(false);
    //   // Clear status after 10 seconds
    //   setTimeout(() => setScrapingStatus(''), 10000);
    // }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    setIsLoadingData(true);
    
    try {
      const dbData = await databaseManager.getAllData();
      
      // Increment posts to show by 4 each time, but cap at total posts
      const totalPosts = dbData.length;
      const newPostsToShow = postsToShow + 4;
      const actualPostsToShow = newPostsToShow > totalPosts ? totalPosts : newPostsToShow;
      
      // Get the incremental data
      const incrementalData = dbData.slice(0, actualPostsToShow);
      
      // Calculate how many new posts were added
      const newPostsAdded = actualPostsToShow - postsToShow;
      
      setData(incrementalData);
      setPostsToShow(actualPostsToShow);
      setScrapingStatus(`✅ Scraping completed! Found: ${newPostsAdded} new posts`);
      console.log(`Data loaded: ${incrementalData.length} total posts (incremental loading)`);
      setTimeout(() => setScrapingStatus(''), 3000);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setTimeout(() => setScrapingStatus(''), 5000);
    } finally {
      setIsLoading(false);
      setIsLoadingData(false);
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Title,Author,Subreddit,Upvotes,Comments,Sentiment,Timestamp\n" +
      filteredData.map(item => 
        `"${item.title}","${item.author}","${item.subreddit || 'N/A'}","${item.upvotes || 0}","${item.comments || 0}","${item.sentiment}","${item.timestamp}"`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reddit_scrapper_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="px-8 py-8 relative">
      {/* Main Content */}
      <div className="w-full">
      {/* Simple Header */}
      <div className={`p-6 rounded-lg border mb-6 ${
        darkMode 
          ? 'bg-slate-800 border-slate-600' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className={`text-2xl font-semibold ${
              darkMode ? 'text-white' : 'text-slate-800'
            }`}>
              Mental Health Data Dashboard
            </h2>
            <p className={`text-sm mt-1 ${
              darkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleScrapeClick}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                isLoading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'text-white'
              }`}
              style={{ backgroundColor: isLoading ? undefined : '#4a6cf7' }}
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {isLoading ? 'Scraping...' : 'Scrape'}
            </button>
            <button
              onClick={handleExport}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 border ${
                darkMode 
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                  : 'border-gray-300 text-slate-700 hover:bg-gray-50'
              }`}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
        {scrapingStatus && (
          <div className={`mt-3 px-3 py-2 rounded text-sm ${
            darkMode 
              ? 'bg-blue-600/20 text-blue-300' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {scrapingStatus}
          </div>
        )}
      </div>

      {/* Search Filter and Platform Buttons */}
      <div className={`p-4 rounded-lg border mb-6 ${
        darkMode 
          ? 'bg-slate-800 border-slate-600' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between gap-6">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-2xl">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-1 ${
              darkMode 
                ? 'bg-slate-700 border-slate-600 text-white focus:ring-blue-500' 
                : 'bg-white border-gray-300 text-slate-900 focus:ring-blue-500'
            }`}
          />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* View Result Button */}
            <button
              onClick={() => setShowSidePanel(!showSidePanel)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 ${
                showSidePanel
                  ? darkMode
                    ? 'bg-green-600 text-white border border-green-500'
                    : 'bg-green-500 text-white border border-green-500'
                  : darkMode
                    ? 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              View Result
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Data Table */}
      <div className={`rounded-xl border overflow-hidden shadow-lg ${
        darkMode 
          ? 'bg-slate-800 border-slate-600' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Enhanced Table Header */}
            <thead className={`${
              darkMode ? 'bg-gradient-to-r from-slate-700 to-slate-600' : 'bg-gradient-to-r from-gray-50 to-gray-100'
            }`}>
              <tr>
                <th className={`px-8 py-5 text-left text-sm font-semibold tracking-wide ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Username
                  </div>
                </th>
                <th className={`px-8 py-5 text-left text-sm font-semibold tracking-wide ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Content Summary
                  </div>
                </th>
                <th className={`px-8 py-5 text-left text-sm font-semibold tracking-wide ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  <div className="flex items-center gap-2">
                  </div>
                </th>
              </tr>
            </thead>
            
            {/* Enhanced Table Body */}
            <tbody className={`divide-y ${darkMode ? 'divide-slate-600' : 'divide-gray-200'}`}>
              {isLoadingData ? (
                <tr>
                  <td colSpan={3} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCw className="w-10 h-10 animate-spin mb-4 text-blue-500" />
                      <p className={`text-lg font-medium ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                      </p>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-16 text-center">
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
                  {/* Enhanced Username */}
                  <td className="px-8 py-6">
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
                  
                  {/* Enhanced Content Summary */}
                  <td className="px-8 py-6">
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
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          darkMode ? getSentimentColorDark(item.sentiment) : getSentimentColor(item.sentiment)
                        }`}>
                          {item.sentiment === 'positive' ? '😊' : item.sentiment === 'negative' ? '😔' : '😐'} {item.sentiment}
                        </span>
                        <span className={`text-xs flex items-center gap-1 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <Calendar className="w-3 h-3" />
                          {item.timestamp}
                        </span>
                      </div>
                    </div>
                  </td>
                  
                  {/* Enhanced Actions */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          darkMode 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } hover:shadow-lg transform hover:scale-105`}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Let SAMH Reach Out
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredData.length === 0 && !isLoadingData && (
        <div className={`text-center py-8 ${
          darkMode ? 'text-slate-400' : 'text-gray-600'
        }`}>
          <p>No posts found. Try adjusting your search or filter criteria.</p>
        </div>
      )}
      </div>

      {/* Popup Side Panel */}
      {showSidePanel && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowSidePanel(false)}
          />
          
          {/* Side Panel */}
          <div className={`fixed top-0 right-0 h-screen w-1/3 min-w-[350px] z-50 transform transition-transform duration-300 ${
            showSidePanel ? 'translate-x-0' : 'translate-x-full'
          } ${
            darkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'
          } border-l shadow-2xl flex flex-col`}>
          {/* Side Panel Header */}
          <div className={`p-4 border-b ${
            darkMode ? 'border-slate-600' : 'border-gray-200'
          }`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-slate-800'
              }`}>
                Retrieved Result
              </h3>
              <button
                onClick={() => setShowSidePanel(false)}
                className={`p-1 rounded-lg transition-colors ${
                  darkMode 
                    ? 'hover:bg-slate-700 text-slate-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Side Panel Content */}
          <div ref={scrollContainerRef} className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4 min-h-full">
              {filteredData.length > 0 ? (
                filteredData.slice(0, visibleCards).map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border transition-all duration-500 hover:shadow-md transform animate-in slide-in-from-right-4 fade-in ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="mb-2">
                      <h4 className={`font-medium text-sm leading-tight ${
                        darkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        @{item.author}
                      </h4>
                    </div>
                    
                    <p className={`text-xs leading-relaxed mb-3 ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {item.content.length > 120 ? `${item.content.substring(0, 120)}...` : item.content}
                    </p>
                    
                  </div>
                ))
              ) : data.length === 0 ? (
                <div className={`text-center py-8 ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  <p className="text-sm">No data available</p>
                  <p className="text-xs mt-1">Start scraping to load mental health posts</p>
                </div>
              ) : (
                <div className={`text-center py-8 ${
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  <p className="text-sm">No results match your search.</p>
                  <p className="text-xs mt-1">Try adjusting your search criteria.</p>
                </div>
              )}
            </div>
          </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ScrapperOutput;