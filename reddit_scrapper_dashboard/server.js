import express from 'express';
import pkg from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const { Database } = pkg.verbose();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'scrapper_data.db');
const db = new Database(dbPath);

// Initialize database with mock data
const initializeDatabase = () => {
  db.serialize(() => {
    // Create table
    db.run(`
      CREATE TABLE IF NOT EXISTS scrapper_data (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author TEXT NOT NULL,
        subreddit TEXT NOT NULL,
        upvotes INTEGER NOT NULL,
        comments INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        url TEXT NOT NULL,
        sentiment TEXT NOT NULL,
        platform TEXT NOT NULL
      )
    `);

    // Check if data already exists
    db.get("SELECT COUNT(*) as count FROM scrapper_data", (err, row) => {
      if (err) {
        console.error('Error checking data:', err);
        return;
      }

      // If no data exists, insert mock data
      if (row.count === 0) {
        console.log('Inserting mock data into database...');
        
        const mockData = [
          {
            id: '1',
            title: 'Mental health awareness is crucial in today\'s society',
            content: 'I wanted to share my experience with mental health challenges and how seeking help changed my life...',
            author: 'Ok_Rabbit_1613',
            subreddit: 'MentalHealth',
            upvotes: 245,
            comments: 67,
            timestamp: '2 hours ago',
            url: 'https://www.reddit.com/user/Ok_Rabbit_1613/',
            sentiment: 'positive',
            platform: 'REDDIT'
          },
          {
            id: '2',
            title: 'Struggling with anxiety and depression',
            content: 'Has anyone else felt like they\'re drowning in their own thoughts? I need some advice...',
            author: 'AcceptableBridge7667',
            subreddit: 'depression',
            upvotes: 89,
            comments: 34,
            timestamp: '4 hours ago',
            url: 'https://www.reddit.com/user/AcceptableBridge7667/',
            sentiment: 'negative',
            platform: 'FACEBOOK'
          },
          {
            id: '3',
            title: 'Meditation and mindfulness techniques that work',
            content: 'After years of trying different approaches, here are the techniques that actually helped me...',
            author: 'mindful_living',
            subreddit: 'Meditation',
            upvotes: 156,
            comments: 23,
            timestamp: '6 hours ago',
            url: 'https://reddit.com/r/Meditation/post3',
            sentiment: 'positive',
            platform: 'X'
          },
          {
            id: '4',
            title: 'Therapy session went well today',
            content: 'Just had my third therapy session and I\'m starting to see some progress. It\'s not easy but it\'s worth it.',
            author: 'therapy_journey',
            subreddit: 'therapy',
            upvotes: 78,
            comments: 19,
            timestamp: '8 hours ago',
            url: 'https://reddit.com/r/therapy/post4',
            sentiment: 'positive',
            platform: 'REDDIT'
          },
          {
            id: '5',
            title: 'Feeling overwhelmed with work stress',
            content: 'My job has been incredibly stressful lately and it\'s affecting my mental health. Any tips?',
            author: 'stressed_worker',
            subreddit: 'stress',
            upvotes: 45,
            comments: 28,
            timestamp: '12 hours ago',
            url: 'https://reddit.com/r/stress/post5',
            sentiment: 'negative',
            platform: 'FACEBOOK'
          }
        ];

        const insertStmt = db.prepare(`
          INSERT INTO scrapper_data 
          (id, title, content, author, subreddit, upvotes, comments, timestamp, url, sentiment, platform)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        mockData.forEach(item => {
          insertStmt.run([
            item.id, item.title, item.content, item.author, item.subreddit,
            item.upvotes, item.comments, item.timestamp, item.url, item.sentiment, item.platform
          ]);
        });

        insertStmt.finalize();
        console.log('Mock data inserted successfully!');
      } else {
        console.log(`Database already contains ${row.count} records`);
      }
    });
  });
};

// API Routes

// Get all scrapper data
app.get('/api/data', (req, res) => {
  db.all("SELECT * FROM scrapper_data ORDER BY id", (err, rows) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Failed to fetch data' });
      return;
    }
    
    console.log(`Returning ${rows.length} records`);
    res.json(rows);
  });
});

// Simulate scraping endpoint
app.post('/api/scrape', (req, res) => {
  console.log('Scraping request received...');
  
  // Simulate scraping delay
  setTimeout(() => {
    const result = {
      success: true,
      title: 'Mental health discussions scraped',
      scroll_count: Math.floor(Math.random() * 30) + 10,
      page_height: Math.floor(Math.random() * 5000) + 3000,
      url: 'https://www.reddit.com/r/MentalHealth/'
    };
    
    console.log('Scraping completed:', result);
    res.json(result);
  }, 3000); // 3 second delay to simulate scraping
});

// Add new data (for future use)
app.post('/api/data', (req, res) => {
  const { title, content, author, subreddit, upvotes, comments, timestamp, url, sentiment, platform } = req.body;
  
  if (!title || !content || !author) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const id = Date.now().toString();
  
  db.run(`
    INSERT INTO scrapper_data 
    (id, title, content, author, subreddit, upvotes, comments, timestamp, url, sentiment, platform)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, title, content, author, subreddit, upvotes, comments, timestamp, url, sentiment, platform], function(err) {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).json({ error: 'Failed to insert data' });
      return;
    }
    
    res.json({ id, message: 'Data inserted successfully' });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Reddit Scrapper Dashboard Server is running',
    timestamp: new Date().toISOString()
  });
});

// Initialize database and start server
initializeDatabase();

app.listen(PORT, () => {
  console.log(`🚀 Reddit Scrapper Dashboard Server running on http://localhost:${PORT}`);
  console.log('📊 Database initialized with mock data');
  console.log('🔗 API endpoints:');
  console.log(`   GET  http://localhost:${PORT}/api/data - Get all scrapper data`);
  console.log(`   POST http://localhost:${PORT}/api/scrape - Simulate scraping`);
  console.log(`   GET  http://localhost:${PORT}/api/health - Health check`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('📊 Database connection closed');
    }
    process.exit(0);
  });
});

export default app;
