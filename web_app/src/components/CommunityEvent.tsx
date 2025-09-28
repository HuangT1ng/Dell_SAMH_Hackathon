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

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001' 
  : 'https://backend-ntu.apps.innovate.sg-cna.com';

const CommunityEvent: React.FC<CommunityEventProps> = ({ darkMode }) => {
  const [events, setEvents] = useState<EventCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState<EventCard[]>([]);
  const [showFilteredEvents, setShowFilteredEvents] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventCard | null>(null);

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
      
      // Randomize the order of events each time
      const randomizedEvents = matchedEvents.sort(() => Math.random() - 0.5);
      
      setFilteredEvents(randomizedEvents);
      setShowFilteredEvents(true);
      setIsMatching(false);
      
      // Show popup after matching is complete
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 4000); 
    }, 1500);
  };




  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 ml-8 mt-4">
          <p className={`text-lg ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Join supportive community events and connect with others
          </p>
        </div>
        
        {/* Magnifying Glass Button */}
        <div className="flex flex-col items-center gap-2 mr-8 mt-4">
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
          <span className={`text-xs font-bold ${
            isMatching
              ? darkMode ? 'text-gray-500' : 'text-gray-400'
              : darkMode ? 'text-white' : 'text-black'
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
                KAI Suggested Personalisied Events ({filteredEvents.length})
              </h3>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
              </p>
            </div>
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

      {/* Events List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {(showFilteredEvents ? filteredEvents : events).map((event) => (
            <div
              key={event.id}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:shadow-md ${
                darkMode
                  ? "bg-slate-800 border border-slate-700 hover:bg-slate-700"
                  : "bg-white border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {/* Event Image */}
              <div className="flex-shrink-0">
                <img
                  src={event.image_url}
                  alt={event.organization_name}
                  className="w-20 h-20 rounded-lg object-contain bg-gray-50"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/80x80?text=Event';
                  }}
                />
              </div>

              {/* Event Content */}
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {event.organization_name}
                </h3>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                <button 
                  onClick={() => setSelectedEvent(event)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    darkMode
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Learn More
                </button>
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
                Here are some suggested events catered for you.
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

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setSelectedEvent(null)}
          ></div>
          <div className={`relative max-w-2xl w-full rounded-3xl p-8 shadow-2xl ${
            darkMode
              ? "bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-slate-700/50 backdrop-blur-sm"
              : "bg-gradient-to-br from-white/95 to-white/90 border border-white/50 backdrop-blur-sm"
          }`}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedEvent(null)}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                darkMode
                  ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Event Content */}
            <div className="relative z-10">
              {/* Event Image */}
              <div className="rounded-2xl overflow-hidden shadow-lg mb-6">
                <img
                  src={selectedEvent.image_url}
                  alt={selectedEvent.organization_name}
                  className="w-full h-64 object-contain bg-gray-50"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/400x256?text=Event';
                  }}
                />
              </div>

              {/* Organization Name */}
              <h3 className={`text-3xl font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {selectedEvent.organization_name}
              </h3>

              {/* Event Description */}
              <p className={`text-lg leading-relaxed mb-6 ${
                darkMode ? 'text-gray-300' : 'text-slate-600'
              }`}>
                {selectedEvent.description}
              </p>

              {/* Location */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="grid h-12 w-12 place-items-center rounded-2xl shadow-lg"
                  style={{ backgroundColor: '#4a6cf7' }}
                >
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <span className={`text-lg font-medium ${
                  darkMode ? 'text-gray-200' : 'text-slate-700'
                }`}>
                  {selectedEvent.location}
                </span>
              </div>

              {/* Action Button */}
              <div className="flex justify-center">
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CommunityEvent;
