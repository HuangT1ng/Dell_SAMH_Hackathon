#!/usr/bin/env python3


import sys
import json
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

class RedditScraper:
    def __init__(self):
        self.is_scraping = False
        self.last_result = None
        self.target_url = 'https://www.reddit.com/r/SGExams/comments/jn7qll/a_levels_too_stressed_during_the_paper/ '

    def open_and_scrape(self):
        """Scraping in Progress"""
        if self.is_scraping:
            raise Exception('Scraping is already in progress')

        self.is_scraping = True
        
        try:
            print('Starting Selenium Reddit scraper...')
            
            # Call the Selenium script
            result = self._run_selenium_script()
            
            self.last_result = result
            
            if result['success']:
                print('Scraping completed successfully:', result)
            else:
                print('Scraping failed')
            
            return result
            
        except Exception as error:
            # Log detailed error but return generic message to frontend
            print('Error during scraping:', error)
            error_result = {
                'success': False,
                'error': ''
            }
            
            self.last_result = error_result
            return error_result
            
        finally:
            self.is_scraping = False

    def _run_selenium_script(self):
        """Run the actual Selenium scraping"""
        import os
        import tempfile
        
        # Create a persistent user data directory
        user_data_dir = os.path.join(tempfile.gettempdir(), 'reddit_scraper_chrome')
        
        # Setup Chrome options
        chrome_options = Options()
        chrome_options.add_argument(f"--user-data-dir={user_data_dir}")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        driver = None
        
        try:
            # Setup ChromeDriver
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=chrome_options)
            
            # Hide automation indicators
            driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            # Open Reddit page
            print(f'{self.target_url}...')
            driver.get(self.target_url)
            
            # Wait for page to load
            time.sleep(3)
            
            # Scroll once per second for 10 seconds and highlight specific content
            scroll_count = 0
            
            for i in range(10):                
              
            # Check for specific phrases and highlight them
                self._highlight_content(driver)
                print(f'Scrolling {i+1}/10...')
                driver.execute_script("window.scrollBy(0, window.innerHeight / 2);")
                scroll_count += 1
                
                time.sleep(0.1)  # Wait 0.5 seconds between scrolls (2x speed)
            
            # Get page info
            title = driver.title
            page_height = driver.execute_script("return document.body.scrollHeight")
            
            result = {
                'success': True,
                'title': title,
                'scroll_count': scroll_count,
                'page_height': page_height,
                'url': self.target_url
            }
            
            return result
            
        except Exception as e:
            # Log error but don't expose detailed error messages to frontend
            print(f"Scraping error: {str(e)}")
            return {
                'success': False,
                'error': ''
            }
            
        finally:
            if driver:
                driver.quit()

    def _highlight_content(self, driver):
        """Highlight specific phrases and associated usernames"""
        try:
            # JavaScript to find and highlight specific phrases and their usernames
            highlight_script = """
            // Target phrases to highlight
            const targetPhrases = [
                'i was actually feeling the same this morning, at ard 7am i was having dizzy and vomiting spells',
                'i was just panicking really hard and its not like i didnt know how to do the questions but it was just.... the pressure was too much i dunno.',
                'bruh finally someone that’s actually going thru the same shit as me',
                'i totally understand what you mean cause this is similar to what happened to me during one of my mid year papers'
            ];
            
            // Function to highlight entire paragraph containing target phrases
            function highlightParagraphsWithText(text, color) {
                const walker = document.createTreeWalker(
                    document.body,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                );
                
                const textNodes = [];
                let node;
                
                while (node = walker.nextNode()) {
                    if (node.textContent.toLowerCase().includes(text.toLowerCase())) {
                        textNodes.push(node);
                    }
                }
                
                textNodes.forEach(textNode => {
                    const parent = textNode.parentNode;
                    if (parent.tagName !== 'SCRIPT' && parent.tagName !== 'STYLE') {
                        // Find the paragraph container
                        let paragraphContainer = parent;
                        let attempts = 0;
                        
                        // Go up the DOM tree to find the paragraph/comment container
                        while (paragraphContainer && attempts < 10) {
                            // Check if this is a paragraph, comment, or post container
                            if (paragraphContainer.tagName === 'P' || 
                                paragraphContainer.classList.contains('Comment') ||
                                paragraphContainer.classList.contains('Post') ||
                                paragraphContainer.getAttribute('data-testid') === 'comment' ||
                                paragraphContainer.getAttribute('data-testid') === 'post' ||
                                paragraphContainer.querySelector('[data-testid="comment"]') ||
                                paragraphContainer.querySelector('[data-testid="post"]')) {
                                
                                // Highlight the entire paragraph/container
                                paragraphContainer.style.backgroundColor = color;
                                paragraphContainer.style.padding = '8px';
                                paragraphContainer.style.borderRadius = '5px';
                                paragraphContainer.style.margin = '4px 0';
                                console.log('Highlighted paragraph containing:', text.substring(0, 50) + '...');
                                
                                // Find and highlight associated username
                                highlightAssociatedUsername(paragraphContainer);
                                break;
                            }
                            paragraphContainer = paragraphContainer.parentElement;
                            attempts++;
                        }
                    }
                });
            }
            
            // Function to highlight username associated with a text element
            function highlightAssociatedUsername(element) {
                // Look for username in the same post/comment container
                let container = element;
                let attempts = 0;
                
                // Go up the DOM tree to find the post/comment container
                while (container && attempts < 10) {
                    // Check if this is a post or comment container
                    if (container.classList.contains('Post') || 
                        container.classList.contains('Comment') ||
                        container.getAttribute('data-testid') === 'post' ||
                        container.getAttribute('data-testid') === 'comment' ||
                        container.querySelector('[data-testid="post_author_link"]') ||
                        container.querySelector('[data-testid="comment_author_link"]')) {
                        
                        // Find username elements within this container
                        const usernameSelectors = [
                            '[data-testid="post_author_link"]',
                            '[data-testid="comment_author_link"]',
                            'a[href*="/user/"]',
                            '.author',
                            '.username'
                        ];
                        
                        usernameSelectors.forEach(selector => {
                            const usernameElement = container.querySelector(selector);
                            if (usernameElement) {
                                usernameElement.style.backgroundColor = 'lightblue';
                                usernameElement.style.padding = '2px';
                                usernameElement.style.borderRadius = '3px';
                                console.log('Highlighted username:', usernameElement.textContent);
                            }
                        });
                        break;
                    }
                    container = container.parentElement;
                    attempts++;
                }
            }
            
            // Special handling for post title using aria-label
            function highlightPostTitle() {
                // Use the specific aria-label selector
                const titleElement = document.querySelector('[aria-label*="Post Title: will i be allowed to sit for my a levels if i survived my su*cide attempt?"]');
                
                if (titleElement) {
                    // Highlight the entire post title
                    titleElement.style.backgroundColor = 'lightcoral';
                    titleElement.style.padding = '4px';
                    titleElement.style.borderRadius = '3px';
                    console.log('Highlighted entire post title using aria-label');
                    
                    // Also highlight the post author
                    highlightAssociatedUsername(titleElement);
                } else {
                    console.log('Post title with aria-label not found, trying fallback selectors');
                    
                    // Fallback to other selectors
                    const fallbackSelectors = [
                        '[data-testid="post-content"] h1',
                        '.Post h1',
                        'h1[data-testid="post-title"]',
                        'h1'
                    ];
                    
                    fallbackSelectors.forEach(selector => {
                        const titleElement = document.querySelector(selector);
                        if (titleElement && titleElement.textContent.toLowerCase().includes('my su*cide attempt?')) {
                            // Highlight the entire post title
                            titleElement.style.backgroundColor = 'lightcoral';
                            titleElement.style.padding = '4px';
                            titleElement.style.borderRadius = '3px';
                            console.log('Highlighted entire post title using fallback');
                            
                            highlightAssociatedUsername(titleElement);
                        }
                    });
                }
            }
            
            // Highlight post title first
            highlightPostTitle();
            
            // Highlight entire paragraphs containing target phrases in light red
            targetPhrases.forEach(phrase => {
                highlightParagraphsWithText(phrase, 'lightcoral');
            });
            
            console.log('Content highlighted successfully');
            """
            
            # Execute the highlighting script
            driver.execute_script(highlight_script)
            print('Highlighted content on page')
            
            # Pause for 1 second after highlighting
            time.sleep(2)
            
        except Exception as e:
            print(f'Error highlighting content: {e}')

    def get_last_result(self):
        """Get the last scraping result"""
        return self.last_result

    def get_status(self):
        """Get scraping status"""
        return {
            'is_scraping': self.is_scraping,
            'has_result': self.last_result is not None
        }

    def clear_result(self):
        """Clear last result"""
        self.last_result = None
        print('Scraping result cleared')

# Create global instance
reddit_scraper = RedditScraper()

def scrape_reddit():
    """Main scraping function for external calls"""
    return reddit_scraper.open_and_scrape()

if __name__ == "__main__":
    # Run scraping and return JSON result
    result = scrape_reddit()
    print(json.dumps(result))