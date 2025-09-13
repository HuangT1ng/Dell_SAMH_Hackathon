const express = require('express');
const { runRedditScraper } = require('./run_scraper');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Scraper endpoint
app.post('/api/scrape', async (req, res) => {
  try {
    console.log('Received scraping request...');
    const result = await runRedditScraper();
    res.json(result);
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Scraper server is running' });
});

app.listen(PORT, () => {
  console.log(`Scraper server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /api/scrape - Run Reddit scraper');
  console.log('  GET  /api/health - Health check');
});
