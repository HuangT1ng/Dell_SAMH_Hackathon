// Shared database utility for SAMH Platform to communicate with centralized database

export interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  moodLabel: string;
  triggers: string[];
  activities: string[];
  notes: string;
  timestamp: number;
}

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
}

export interface AnalyticsEvent {
  eventType: string;
  eventData: any;
}

class SharedDatabaseManager {
  private baseUrl: string = 'http://localhost:3001/api';

  // Mood Entries Management
  async getAllMoodEntries(): Promise<MoodEntry[]> {
    try {
      console.log('Fetching mood entries from shared database...');
      const response = await fetch(`${this.baseUrl}/mood-entries`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Loaded ${data.length} mood entries from shared database`);
      return data;
    } catch (error) {
      console.error('Error fetching mood entries from shared database:', error);
      throw error;
    }
  }

  async addMoodEntry(entry: MoodEntry): Promise<{ id: string; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/mood-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Mood entry added to shared database:', result);
      return result;
    } catch (error) {
      console.error('Error adding mood entry to shared database:', error);
      throw error;
    }
  }

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
  async getStats(): Promise<{ mental_health_posts: number; mood_entries: number; user_analytics: number }> {
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
