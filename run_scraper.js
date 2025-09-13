const { spawn } = require('child_process');
const path = require('path');

/**
 * Run the Python Selenium scraper
 * @returns {Promise<Object>} Scraping result
 */
function runRedditScraper() {
    return new Promise((resolve, reject) => {
        // Use the Python scraper from the web_app utils directory
        const pythonScript = path.join(__dirname, 'web_app', 'src', 'utils', 'scraper.py');
        
        console.log('Starting Reddit scraper...');
        console.log('Python script path:', pythonScript);
        
        const python = spawn('python3', [pythonScript], {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let output = '';
        let errorOutput = '';
        
        python.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        python.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        python.on('close', (code) => {
            if (code === 0) {
                try {
                    // The Python script outputs JSON at the end
                    const lines = output.trim().split('\n');
                    const jsonLine = lines[lines.length - 1];
                    const result = JSON.parse(jsonLine);
                    console.log('Scraping completed:', result);
                    resolve(result);
                } catch (e) {
                    console.error('Failed to parse result:', e);
                    console.error('Raw output:', output);
                    reject(new Error('Failed to parse scraping result'));
                }
            } else {
                console.error('Python script failed with code:', code);
                console.error('Error output:', errorOutput);
                reject(new Error(`Scraping failed with code ${code}: ${errorOutput}`));
            }
        });
        
        python.on('error', (error) => {
            console.error('Failed to start Python script:', error);
            reject(error);
        });
    });
}

// Export for use in other modules
module.exports = { runRedditScraper };

// If run directly, execute the scraper
if (require.main === module) {
    runRedditScraper()
        .then(result => {
            console.log('Final result:', result);
            process.exit(0);
        })
        .catch(error => {
            console.error('Scraping failed:', error);
            process.exit(1);
        });
}
