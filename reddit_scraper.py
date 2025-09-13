#!/usr/bin/env python3
"""
Reddit Scraper using Selenium WebDriver
Opens Reddit page and scrolls down for 5 seconds
Can be called from web application
"""

import sys
import json
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

def scrape_reddit():
    """Main scraping function"""
    
    # Setup Chrome options
    chrome_options = Options()
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
        reddit_url = "https://www.reddit.com/r/SGExams/comments/1nfn7od/will_i_be_allowed_to_sit_for_my_a_levels_if_i/"
        driver.get(reddit_url)
        
        # Wait for page to load
        time.sleep(3)
        
        # Scroll for 5 seconds
        start_time = time.time()
        scroll_count = 0
        
        while time.time() - start_time < 5:
            driver.execute_script("window.scrollBy(0, window.innerHeight);")
            scroll_count += 1
            time.sleep(0.2)
        
        # Get page info
        title = driver.title
        page_height = driver.execute_script("return document.body.scrollHeight")
        
        result = {
            "success": True,
            "title": title,
            "scroll_count": scroll_count,
            "page_height": page_height,
            "url": reddit_url
        }
        
        return result
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
        
    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    # Run scraping and return JSON result
    result = scrape_reddit()
    print(json.dumps(result))
