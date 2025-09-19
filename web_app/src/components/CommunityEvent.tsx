import React, { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

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


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className={`text-3xl font-bold mb-2 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Community Events
        </h1>
        <p className={`text-lg ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Join supportive community events and connect with others
        </p>
      </div>

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
          {events.map((event) => (
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
                  className="w-full h-full object-cover"
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
      {!isLoading && !error && events.length === 0 && (
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
                No events scheduled
              </h3>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Check back later for upcoming community events
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityEvent;
