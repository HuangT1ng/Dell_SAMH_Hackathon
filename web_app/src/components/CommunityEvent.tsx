import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, Search } from 'lucide-react';

interface CommunityEventProps {
  darkMode: boolean;
}

interface EventCard {
  id: string;
  organization_name: string;
  description: string;
  location: string;
  image_url: string;
  created_at: string;
}

const API_BASE_URL = 'http://localhost:3001';

const CommunityEvent: React.FC<CommunityEventProps> = ({ darkMode }) => {
  const [events, setEvents] = useState<EventCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState<EventCard[]>([]);
  const [showFilteredEvents, setShowFilteredEvents] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Fetch community events from database
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/community-events`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch community events');
      }
      
      const data = await response.json();
      setEvents(data);
      console.log('✅ Fetched community events:', data.length);
    } catch (err) {
      console.error('❌ Error fetching community events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);



  const handleMatch = async () => {
    setIsMatching(true);
    
    setTimeout(() => {
      const matchedEvents = events.filter(event => {
        const eventId = parseInt(event.id);
        return eventId >= 42;
      });
      
      setFilteredEvents(matchedEvents);
      setShowFilteredEvents(true);
      setIsMatching(false);
      
      // Show popup after matching is complete
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 4000); 
    }, 1500);
  };

  const showAllEvents = () => {
    setShowFilteredEvents(false);
    setFilteredEvents([]);
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
 
          <p className={`text-lg ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Join supportive community events and connect with others
          </p>
        </div>
        
        {/* Magnifying Glass Button */}
        <div className="flex flex-col items-center gap-2 ml-auto">
          <button
            onClick={handleMatch}
            disabled={isMatching}
            className={`flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 ${
              isMatching
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/30 transform hover:scale-105 active:scale-95'
            }`}
          >
            {isMatching ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Search className="w-6 h-6" />
            )}
          </button>
          <span className={`text-xs font-medium ml-2 ${
            isMatching
              ? darkMode ? 'text-gray-500' : 'text-gray-400'
              : darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {isMatching ? 'Matching...' : 'Match Me!'}
          </span>
        </div>
      </div>


      {/* Filtered Events Header */}
      {showFilteredEvents && (
        <div className={`rounded-xl p-4 shadow-lg border ${
          darkMode 
            ? 'bg-[#40414F] border-gray-700' 
            : 'bg-white/90 border-blue-100'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                🎯 Matched Events ({filteredEvents.length})
              </h3>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
              </p>
            </div>
            <button
              onClick={showAllEvents}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Show All Events
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className={`text-lg ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Loading community events...
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={`rounded-xl border p-6 ${
          darkMode 
            ? 'bg-red-900/20 border-red-700' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="text-center">
            <h3 className={`text-lg font-semibold mb-2 ${
              darkMode ? 'text-red-400' : 'text-red-600'
            }`}>
              Error Loading Events
            </h3>
            <p className={`text-sm ${
              darkMode ? 'text-red-300' : 'text-red-500'
            }`}>
              {error}
            </p>
            <button
              onClick={fetchEvents}
              className={`mt-4 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                darkMode
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Events Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(showFilteredEvents ? filteredEvents : events).map((event) => (
            <div
              key={event.id}
              className={`rounded-xl border transition-all duration-300 hover:shadow-lg overflow-hidden ${
                darkMode 
                  ? 'bg-[#40414F] border-gray-700 hover:border-gray-600' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Event Image */}
              <div className="w-full h-48 overflow-hidden">
                <img
                  src={event.image_url}
                  alt={event.organization_name}
                  className="w-full h-full object-fill"
                />
              </div>

              {/* Event Content */}
              <div className="p-6 space-y-3">
                {/* Organization Name */}
                <h3 className={`text-xl font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {event.organization_name}
                </h3>

                {/* Event Description */}
                <p className={`text-sm leading-relaxed ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {event.description}
                </p>

                {/* Location */}
                <div className="flex items-center gap-2">
                  <MapPin className={`w-4 h-4 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {event.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State (if no events) */}
      {!isLoading && !error && (showFilteredEvents ? filteredEvents.length === 0 : events.length === 0) && (
        <div className={`rounded-xl border transition-all duration-300 ${
          darkMode 
            ? 'bg-[#40414F] border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <MapPin className={`w-16 h-16 mx-auto mb-4 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <h3 className={`text-lg font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {showFilteredEvents ? 'No matching events found' : 'No events scheduled'}
              </h3>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {showFilteredEvents 
                  ? 'Try adding more interests or check back later for new events'
                  : 'Check back later for upcoming community events'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Popup Window */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-300"
            onClick={() => setShowPopup(false)}
          />
          
          {/* Popup */}
          <div className={`relative w-full max-w-sm mx-4 rounded-2xl shadow-2xl transform transition-all duration-300 ${
            darkMode 
              ? 'bg-[#343541] border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}>
            {/* Popup Content */}
            <div className="p-6 text-center">
              <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-blue-600/20' : 'bg-blue-100'
              }`}>
                <Search className={`w-6 h-6 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
              </h3>
              <p className={`text-sm leading-relaxed ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Here are sports-related events we found and filtered for you, tailored to your interests.
              </p>
              <button
                onClick={() => setShowPopup(false)}
                className={`mt-4 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  darkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CommunityEvent;
