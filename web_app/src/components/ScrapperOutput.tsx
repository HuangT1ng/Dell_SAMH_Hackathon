import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, ExternalLink, Calendar, TrendingUp, Users, MessageSquare } from 'lucide-react';
import { redditScraper, ScrapingResult } from '../utils/scraper';

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
}

interface ScrapperOutputProps {
  darkMode: boolean;
}

const ScrapperOutput: React.FC<ScrapperOutputProps> = ({ darkMode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubreddit, setSelectedSubreddit] = useState('all');
  const [selectedSentiment, setSelectedSentiment] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState<string>('');

  // Mock data for demonstration
  const mockData: ScrapperData[] = [
    {
      id: '1',
      title: 'Mental health awareness is crucial in today\'s society',
      content: 'I wanted to share my experience with mental health challenges and how seeking help changed my life...',
      author: 'Ok_Rabbit_1613',
      subreddit: 'MentalHealth',
      upvotes: 245,
      comments: 67,
      timestamp: '2 hours ago',
      url: 'https://www.reddit.com/user/Ok_Rabbit_1613/',
      sentiment: 'positive'
    },
    {
      id: '2',
      title: 'Struggling with anxiety and depression',
      content: 'Has anyone else felt like they\'re drowning in their own thoughts? I need some advice...',
      author: 'AcceptableBridge7667',
      subreddit: 'depression',
      upvotes: 89,
      comments: 34,
      timestamp: '4 hours ago',
      url: 'https://www.reddit.com/user/AcceptableBridge7667/',
      sentiment: 'negative'
    },
    {
      id: '3',
      title: 'Meditation and mindfulness techniques that work',
      content: 'After years of trying different approaches, here are the techniques that actually helped me...',
      author: 'mindful_living',
      subreddit: 'Meditation',
      upvotes: 156,
      comments: 23,
      timestamp: '6 hours ago',
      url: 'https://reddit.com/r/Meditation/post3',
      sentiment: 'positive'
    },
    {
      id: '4',
      title: 'Therapy session went well today',
      content: 'Just had my third therapy session and I\'m starting to see some progress. It\'s not easy but it\'s worth it.',
      author: 'therapy_journey',
      subreddit: 'therapy',
      upvotes: 78,
      comments: 19,
      timestamp: '8 hours ago',
      url: 'https://reddit.com/r/therapy/post4',
      sentiment: 'positive'
    },
    {
      id: '5',
      title: 'Feeling overwhelmed with work stress',
      content: 'My job has been incredibly stressful lately and it\'s affecting my mental health. Any tips?',
      author: 'stressed_worker',
      subreddit: 'stress',
      upvotes: 45,
      comments: 28,
      timestamp: '12 hours ago',
      url: 'https://reddit.com/r/stress/post5',
      sentiment: 'negative'
    }
  ];

  const [data, setData] = useState<ScrapperData[]>(mockData);

  const filteredData = data.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubreddit = selectedSubreddit === 'all' || item.subreddit === selectedSubreddit;
    const matchesSentiment = selectedSentiment === 'all' || item.sentiment === selectedSentiment;
    
    return matchesSearch && matchesSubreddit && matchesSentiment;
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

  const subreddits = ['all', 'MentalHealth', 'depression', 'Meditation', 'therapy', 'stress'];
  const sentiments = ['all', 'positive', 'negative', 'neutral'];

  const handleRefresh = async () => {
    setIsLoading(true);
    setScrapingStatus('Starting Selenium scraper...');
    
    try {
      console.log('Starting Reddit scraping...');
      
      // Start the Reddit scraper
      setScrapingStatus('Scraping...');
      const result = await redditScraper.openAndScrape();
      
      if (result.success) {
        setScrapingStatus(`Scraping completed! Scrolled ${result.scroll_count} times`);
        console.log('Scraping completed successfully:', result);
      } else {
        setScrapingStatus(`Scraping failed: ${result.error}`);
        console.error('Scraping failed:', result.error);
      }
      
    } catch (error) {
      console.error('Error during scraping:', error);
      setScrapingStatus('Error occurred during scraping...');
    } finally {
      setIsLoading(false);
      // Clear status message after 5 seconds
      setTimeout(() => setScrapingStatus(''), 5000);
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
              Reddit Scrapper Output
            </h2>
            <p className={`${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Real-time data from Reddit mental health communities
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
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

          {/* Subreddit Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedSubreddit}
              onChange={(e) => setSelectedSubreddit(e.target.value)}
              className={`pl-9 pr-8 py-2 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                  : 'bg-white/90 border-blue-100 text-blue-900 focus:ring-blue-500'
              }`}
            >
              {subreddits.map(sub => (
                <option key={sub} value={sub}>
                  {sub === 'all' ? 'All Subreddits' : `r/${sub}`}
                </option>
              ))}
            </select>
          </div>

          {/* Sentiment Filter */}
          <div className="relative">
            <TrendingUp className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(e.target.value)}
              className={`pl-9 pr-8 py-2 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                  : 'bg-white/90 border-blue-100 text-blue-900 focus:ring-blue-500'
              }`}
            >
              {sentiments.map(sentiment => (
                <option key={sentiment} value={sentiment}>
                  {sentiment === 'all' ? 'All Sentiments' : sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className={`flex items-center justify-center px-4 py-2 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-blue-50'
          }`}>
            <span className={`text-sm font-medium ${
              darkMode ? 'text-gray-300' : 'text-blue-700'
            }`}>
              {filteredData.length} results
            </span>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredData.map((item) => (
          <div
            key={item.id}
            className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${
              darkMode 
                ? 'bg-[#40414F] border-gray-700 hover:shadow-blue-500/20' 
                : 'bg-white/90 backdrop-blur-sm border-blue-100 hover:shadow-blue-500/30'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className={`font-semibold mb-2 line-clamp-2 ${
                  darkMode ? 'text-white' : 'text-blue-900'
                }`}>
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm px-2 py-1 rounded-full border ${
                    darkMode ? getSentimentColorDark(item.sentiment) : getSentimentColor(item.sentiment)
                  }`}>
                    {item.sentiment}
                  </span>
                  <span className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    r/{item.subreddit}
                  </span>
                </div>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-all duration-200 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                }`}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Content */}
            <p className={`text-sm mb-4 line-clamp-3 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {item.content}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <TrendingUp className={`w-4 h-4 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {item.upvotes}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className={`w-4 h-4 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {item.comments}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className={`w-4 h-4 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <span className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {item.author}
                </span>
                <Calendar className={`w-4 h-4 ml-2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <span className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {item.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}
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
    </div>
  );
};

export default ScrapperOutput;
