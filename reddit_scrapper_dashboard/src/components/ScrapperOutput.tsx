import React, { useState, useEffect, useRef } from 'react';
import { Search, Download, RefreshCw, ExternalLink, Calendar, TrendingUp, Users, MessageSquare, X } from 'lucide-react';
import { redditScraper, ScrapingResult } from '../utils/scraper';
import { databaseManager, ScrapperData } from '../utils/database';

interface ScrapperOutputProps {
  darkMode: boolean;
}

const ScrapperOutput: React.FC<ScrapperOutputProps> = ({ darkMode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState<string>('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [visibleCards, setVisibleCards] = useState<number>(0);
  const panelContentRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<ScrapperData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Load data from database on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        await databaseManager.initialize();
        const dbData = await databaseManager.getAllData();
        setData(dbData);
      } catch (error) {
        console.error('Error loading data from database:', error);
        // If server is not running, show an error message
        setScrapingStatus('Error: Backend server not running. Please start the server first.');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, []);

  const filteredData = data.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = selectedPlatform === 'ALL' || item.platform === selectedPlatform;
    
    return matchesSearch && matchesPlatform;
  });

  // Handle staggered card animation when panel opens
  useEffect(() => {
    if (isPanelOpen) {
      setVisibleCards(0);
      const interval = setInterval(() => {
        setVisibleCards(prev => {
          if (prev < filteredData.length) {
            return prev + 1;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setVisibleCards(0);
    }
  }, [isPanelOpen, filteredData.length]);

  // Auto-scroll to latest card
  useEffect(() => {
    if (visibleCards > 0 && panelContentRef.current) {
      const lastCardIndex = visibleCards - 1;
      const cardElements = panelContentRef.current.querySelectorAll('[data-card-index]');
      const lastCard = cardElements[lastCardIndex] as HTMLElement;
      
      if (lastCard) {
        setTimeout(() => {
          lastCard.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'end',
            inline: 'nearest'
          });
        }, 100); // Small delay to ensure card is rendered
      }
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


  const handleRefresh = async () => {
    setIsLoading(true);
    
    try {
      // Step 1: Run scraping
      setScrapingStatus('Scraping...');
      console.log('Starting scraping...');
      const result = await redditScraper.openAndScrape();
      
      if (result.success) {
        console.log('Scraping completed successfully:', result);
      } else {
        console.error('Scraping failed:', result.error);
      }
      
      // Step 2: Load data from database
      setScrapingStatus('Loading data...');
      console.log('Loading data from database...');
      const dbData = await databaseManager.getAllData();
      setData(dbData);
      console.log('Data loaded successfully');
      
      setScrapingStatus('Complete!');
      
    } catch (error) {
      console.error('Error during refresh:', error);
      setScrapingStatus('Error occurred');
    } finally {
      setIsLoading(false);
      // Clear status message after 3 seconds
      setTimeout(() => setScrapingStatus(''), 3000);
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Title,Author,Subreddit,Upvotes,Comments,Sentiment,Timestamp\n" +
      filteredData.map(item => 
        `"${item.title}","${item.author}","${item.subreddit}",${item.upvotes},${item.comments},"${item.sentiment}","${item.timestamp}"`
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
    <>
      {/* CSS Animation Styles */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl ${
        darkMode 
          ? 'bg-[#40414F] border border-gray-700' 
          : 'bg-white/90 backdrop-blur-sm border border-blue-100'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-blue-900'
            }`}>
              Scrapper Output
            </h2>
            <p className={`${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Real-time data from mental health communities
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {scrapingStatus && (
              <div className={`px-3 py-2 rounded-lg text-sm ${
                darkMode 
                  ? 'bg-blue-600/20 text-blue-300' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {scrapingStatus}
              </div>
            )}
            <button
              onClick={handleExport}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-6 rounded-xl ${
        darkMode 
          ? 'bg-[#40414F] border border-gray-700' 
          : 'bg-white/90 backdrop-blur-sm border border-blue-100'
      }`}>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                  : 'bg-white/90 border-blue-100 text-blue-900 focus:ring-blue-500 focus:border-blue-300'
              }`}
            />
          </div>

          {/* Platform Filter Buttons and Results */}
          <div className="flex flex-wrap items-center gap-3">
            {['ALL', 'REDDIT', 'FACEBOOK', 'X'].map((platform) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedPlatform === platform
                    ? darkMode
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-blue-600 text-white shadow-lg'
                    : darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'
                }`}
              >
                {platform}
              </button>
            ))}
            
            {/* Results Count - Clickable Button */}
            <button 
              onClick={() => setIsPanelOpen(true)}
              className={`flex items-center justify-center px-6 py-2 rounded-lg transition-all duration-200 hover:shadow-md ml-auto ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white' 
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800'
              }`}
            >
              <span className="text-sm font-medium">
                {filteredData.length} results
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className={`rounded-xl border overflow-hidden ${
        darkMode 
          ? 'bg-[#40414F] border-gray-700' 
          : 'bg-white/90 backdrop-blur-sm border-blue-100'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead className={`${
              darkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <tr>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${
                  darkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  Username
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${
                  darkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  Background Summary
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${
                  darkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  Platform
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${
                  darkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  Profile Link
                </th>
              </tr>
            </thead>
            
            {/* Table Body */}
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoadingData ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCw className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                      <p className={`text-lg font-medium ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Loading data from database...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.map((item) => (
                <tr 
                  key={item.id}
                  className={`transition-colors duration-200 ${
                    darkMode 
                      ? 'hover:bg-gray-700/50' 
                      : 'hover:bg-blue-50/50'
                  }`}
                >
                  {/* Username */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className={`w-4 h-4 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <span className={`font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.author}
                      </span>
                    </div>
                  </td>
                  
                  {/* Background Summary */}
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <h4 className={`font-medium mb-1 ${
                        darkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {item.title}
                      </h4>
                      <p className={`text-sm line-clamp-2 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {item.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full border ${
                          darkMode ? getSentimentColorDark(item.sentiment) : getSentimentColor(item.sentiment)
                        }`}>
                          {item.sentiment}
                        </span>
                        <span className={`text-xs ${
                          darkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {item.timestamp}
                        </span>
                      </div>
                    </div>
                  </td>
                  
                  {/* Platform */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                      item.platform === 'REDDIT' 
                        ? darkMode
                          ? 'bg-orange-500 text-white shadow-lg'
                          : 'bg-orange-500 text-white shadow-lg'
                        : item.platform === 'FACEBOOK'
                        ? darkMode
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-blue-600 text-white shadow-lg'
                        : darkMode
                          ? 'bg-gray-800 text-white shadow-lg'
                          : 'bg-gray-700 text-white shadow-lg'
                    }`}>
                      {item.platform}
                    </span>
                  </td>
                  
                  {/* Profile Link */}
                  <td className="px-6 py-4">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white' 
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800'
                      }`}
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Profile
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredData.length === 0 && (
        <div className={`text-center py-12 rounded-xl ${
          darkMode ? 'bg-[#40414F]' : 'bg-white/90'
        }`}>
          <Search className={`w-16 h-16 mx-auto mb-4 ${
            darkMode ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-lg font-semibold mb-2 ${
            darkMode ? 'text-white' : 'text-blue-900'
          }`}>
            No posts found
          </h3>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Right Side Popup Panel */}
      {isPanelOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsPanelOpen(false)}
          />
          
          {/* Panel */}
          <div className={`fixed top-0 right-0 h-full w-full md:w-1/3 z-50 transform transition-transform duration-300 ease-in-out ${
            darkMode ? 'bg-[#40414F]' : 'bg-white'
          } shadow-2xl`}>
            {/* Panel Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Results Summary
              </h3>
              <button
                onClick={() => setIsPanelOpen(false)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  darkMode 
                    ? 'hover:bg-gray-600 text-gray-300 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Panel Content */}
            <div ref={panelContentRef} className="p-6 overflow-y-auto h-full pb-20">
              {/* User Cards */}
              <div className="space-y-4">
                {filteredData.slice(0, visibleCards).map((item, index) => (
                  <div
                    key={item.id}
                    data-card-index={index}
                    className={`p-4 rounded-lg border transition-all duration-500 transform ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    } animate-fade-in-up`}
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                    }}
                  >
                    {/* Username */}
                    <div className="flex items-center gap-2 mb-3">
                      <Users className={`w-4 h-4 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <span className={`font-semibold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.author}
                      </span>
                      <span className={`text-sm px-2 py-1 rounded-full border ${
                        darkMode ? getSentimentColorDark(item.sentiment) : getSentimentColor(item.sentiment)
                      }`}>
                        {item.sentiment}
                      </span>
                    </div>
                    
                    {/* Summary/Content */}
                    <div className={`text-sm leading-relaxed ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <div className={`font-medium mb-2 ${
                        darkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {item.title}
                      </div>
                      <p className="line-clamp-3">
                        {item.content}
                      </p>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <span className={`text-xs ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        r/{item.subreddit}
                      </span>
                      <span className={`text-xs ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {item.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredData.length === 0 && (
                <div className="text-center py-12">
                  <Users className={`w-16 h-16 mx-auto mb-4 ${
                    darkMode ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <h3 className={`text-lg font-semibold mb-2 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    No results found
                  </h3>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
    </>
  );
};

export default ScrapperOutput;
