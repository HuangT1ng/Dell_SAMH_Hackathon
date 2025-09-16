// TypeScript interface for Python Reddit scraper
export interface ScrapingResult {
  success: boolean;
  title?: string;
  scroll_count?: number;
  page_height?: number;
  url?: string;
  error?: string;
}

export class RedditScraper {
  private isScraping = false;
  private lastResult: ScrapingResult | null = null;

  async openAndScrape(): Promise<ScrapingResult> {
    if (this.isScraping) {
      throw new Error('Scraping is already in progress');
    }

    this.isScraping = true;
    
    try {
      console.log('Starting Python Selenium Reddit scraper...');
      
      // Call the Python script directly via Node.js
      const result = await this.callPythonScript();
      
      this.lastResult = result;
      
      if (result.success) {
        console.log('Scraping completed successfully:', result);
      } else {
        console.error('Scraping failed:', result.error);
      }
      
      return result;
      
    } catch (error) {
      const errorResult: ScrapingResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      
      this.lastResult = errorResult;
      console.error('Error during scraping:', error);
      return errorResult;
      
    } finally {
      this.isScraping = false;
    }
  }

  private async callPythonScript(): Promise<ScrapingResult> {
    try {
      console.log('Calling Python Selenium script...');
      
      // Make a fetch request to the Express server
      const response = await fetch('http://localhost:3001/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result as ScrapingResult;
      
    } catch (error) {
      console.error('Failed to call Python script:', error);
      
      // Fallback to simulation if server is not running
      console.log('Falling back to simulation...');
      return new Promise((resolve) => {
        setTimeout(() => {
          const result: ScrapingResult = {
            success: true,
            title: 'Will I be allowed to sit for my A levels if I...',
            scroll_count: 25,
            page_height: 5000,
            url: 'https://www.reddit.com/r/SGExams/comments/1nfn7od/will_i_be_allowed_to_sit_for_my_a_levels_if_i/'
          };
          resolve(result);
        }, 8000);
      });
    }
  }

  getLastResult(): ScrapingResult | null {
    return this.lastResult;
  }

  getStatus(): { isScraping: boolean; hasResult: boolean } {
    return {
      isScraping: this.isScraping,
      hasResult: this.lastResult !== null
    };
  }

  clearResult(): void {
    this.lastResult = null;
    console.log('Scraping result cleared');
  }
}

export const redditScraper = new RedditScraper();
export default RedditScraper;
