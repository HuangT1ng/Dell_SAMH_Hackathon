// Database utility for frontend to communicate with backend SQLite database

export interface ScrapperData {
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

class DatabaseManager {
  private baseUrl: string = 'http://localhost:3001/api';

  async getAllData(): Promise<ScrapperData[]> {
    try {
      console.log('Fetching data from shared database...');
      const response = await fetch(`${this.baseUrl}/mental-health-posts`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Loaded ${data.length} records from database`);
      return data;
    } catch (error) {
      console.error('Error fetching data from database:', error);
      throw error;
    }
  }

  async addData(item: Omit<ScrapperData, 'id'>): Promise<{ id: string; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/mental-health-posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Data added successfully:', result);
      return result;
    } catch (error) {
      console.error('Error adding data to database:', error);
      throw error;
    }
  }

  async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Server health check failed:', error);
      return false;
    }
  }

  async initialize(): Promise<void> {
    const isHealthy = await this.checkServerHealth();
    if (!isHealthy) {
      throw new Error('Backend server is not running. Please start the server with: npm run server');
    }
    console.log('Database connection established');
  }
}

export const databaseManager = new DatabaseManager();
export default DatabaseManager;
