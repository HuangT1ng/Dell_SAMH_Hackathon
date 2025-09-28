// Shared database utility for SAMH Platform to communicate with centralized database


export interface MentalHealthPost {
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

export interface AnalyticsEvent {
  eventType: string;
  eventData: any;
}

export interface UserJourneyEvent {
  id: string;
  userId: string;
  eventType: 'chat_session' | 'gaming_session' | 'community_event' | 'achievement' | 'login' | 'logout';
  eventTitle: string;
  eventDescription: string;
  timestamp: number;
  metadata?: any;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementType: string;
  achievementTitle: string;
  achievementDescription: string;
  unlockedAt: number;
  metadata?: any;
}

class SharedDatabaseManager {
  // Environment-aware API configuration
  private baseUrl: string = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api' 
    : 'https://backend-ntu.apps.innovate.sg-cna.com/api';


  // Mental Health Posts (Read-only for SAMH Platform)
  async getMentalHealthPosts(): Promise<MentalHealthPost[]> {
    try {
      console.log('Fetching mental health posts from shared database...');
      const response = await fetch(`${this.baseUrl}/mental-health-posts`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Loaded ${data.length} mental health posts from shared database`);
      return data;
    } catch (error) {
      console.error('Error fetching mental health posts from shared database:', error);
      throw error;
    }
  }

  // Analytics
  async recordAnalytics(event: AnalyticsEvent): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error recording analytics to shared database:', error);
      throw error;
    }
  }

  // Database Health Check
  async checkHealth(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error checking shared database health:', error);
      throw error;
    }
  }

  // Database Statistics
  async getStats(): Promise<{ mental_health_posts: number; user_analytics: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching database stats:', error);
      throw error;
    }
  }

  // User Journey Events Management
  async addJourneyEvent(event: UserJourneyEvent): Promise<{ id: string; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/journey-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Journey event added to shared database:', result);
      return result;
    } catch (error) {
      console.error('Error adding journey event to shared database:', error);
      throw error;
    }
  }

  async getJourneyEvents(userId: string): Promise<UserJourneyEvent[]> {
    try {
      console.log('Fetching journey events from shared database...');
      const response = await fetch(`${this.baseUrl}/journey-events/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Loaded ${data.length} journey events from shared database`);
      return data;
    } catch (error) {
      console.error('Error fetching journey events from shared database:', error);
      throw error;
    }
  }

  // User Achievements Management
  async addAchievement(achievement: UserAchievement): Promise<{ id: string; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/achievements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(achievement),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Achievement added to shared database:', result);
      return result;
    } catch (error) {
      console.error('Error adding achievement to shared database:', error);
      throw error;
    }
  }

  async getAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      console.log('Fetching achievements from shared database...');
      const response = await fetch(`${this.baseUrl}/achievements/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Loaded ${data.length} achievements from shared database`);
      return data;
    } catch (error) {
      console.error('Error fetching achievements from shared database:', error);
      throw error;
    }
  }

  async initialize(): Promise<void> {
    try {
      await this.checkHealth();
      console.log('✅ Connected to shared database successfully');
    } catch (error) {
      console.error('❌ Failed to connect to shared database:', error);
      throw new Error('Shared database is not available. Please start the shared database server.');
    }
  }
}

export const sharedDatabase = new SharedDatabaseManager();
export default sharedDatabase;
