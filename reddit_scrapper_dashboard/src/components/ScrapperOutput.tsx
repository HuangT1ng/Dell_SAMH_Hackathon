import React, { useState, useEffect, useRef } from 'react';
import { Search, Download, RefreshCw, ExternalLink, Calendar, TrendingUp, Users, MessageSquare, X } from 'lucide-react';
import { redditScraper, ScrapingResult } from '../utils/scraper';
import { databaseManager, ScrapperData } from '../utils/database';

interface ScrapperOutputProps {
  darkMode: boolean;
}

const ScrapperOutput: React.FC<ScrapperOutputProps> = ({ darkMode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState<string>('');

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

  const handleScrapeClick = async () => {
    setIsLoading(true);
    setScrapingStatus('Initializing Reddit scraper...');
    
    try {
      const result = await redditScraper.openAndScrape();
      
      if (result.success) {
        setScrapingStatus(`✅ Scraping completed! Found: ${result.title}`);
        // Refresh data after successful scraping
        await handleRefresh();
      } else {
        setScrapingStatus(`❌ Scraping failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Scraping error:', error);
      setScrapingStatus('❌ Scraping failed: Unable to connect to scraper service');
    } finally {
      setIsLoading(false);
      // Clear status after 10 seconds
      setTimeout(() => setScrapingStatus(''), 10000);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    
    try {
      setScrapingStatus('Loading data...');
      console.log('Loading data from database...');
      const dbData = await databaseManager.getAllData();
      setData(dbData);
      console.log('Data loaded:', dbData.length, 'items');
      setScrapingStatus('✅ Data refreshed successfully');
      setTimeout(() => setScrapingStatus(''), 3000);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setScrapingStatus('❌ Failed to refresh data');
      setTimeout(() => setScrapingStatus(''), 5000);
    } finally {
      setIsLoading(false);
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
    <div className="px-8 py-8">
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
              {filteredData.length} posts found
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

      {/* Search Filter */}
      <div className={`p-4 rounded-lg border mb-6 ${
        darkMode 
          ? 'bg-slate-800 border-slate-600' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="relative max-w-md">
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
                    <ExternalLink className="w-4 h-4" />
                    Actions
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
                        Loading data from database...
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
                        View Post
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
  );
};

export default ScrapperOutput;