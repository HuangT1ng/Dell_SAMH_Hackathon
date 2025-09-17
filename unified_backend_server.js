import express from 'express';
import pkg from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import fs from 'fs';

const { Database } = pkg.verbose();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001; // Single backend port

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Database setup - using your scrapper_data.db
const dbPath = path.join(__dirname, 'shared_data', 'scrapper_data.db');
const db = new Database(dbPath);

// Create shared_data directory if it doesn't exist
const sharedDataDir = path.join(__dirname, 'shared_data');
if (!fs.existsSync(sharedDataDir)) {
  fs.mkdirSync(sharedDataDir, { recursive: true });
}

// Initialize database with comprehensive schema
const initializeDatabase = () => {
  db.serialize(() => {
    // Mental health posts table (for scraper data)
    db.run(`
      CREATE TABLE IF NOT EXISTS mental_health_posts (
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
        platform TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Mood entries table (for SAMH platform data)
    db.run(`
      CREATE TABLE IF NOT EXISTS mood_entries (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        mood INTEGER NOT NULL,
        mood_label TEXT NOT NULL,
        triggers TEXT NOT NULL,
        activities TEXT NOT NULL,
        notes TEXT,
        timestamp INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Always clear and replace database with mock data
    console.log('Clearing existing data and inserting mock mental health data...');
    
    // Clear existing data
    db.run("DELETE FROM mental_health_posts", (err) => {
      if (err) {
        console.error('Error clearing existing data:', err);
        return;
      }
        
        const mockPosts = [
          {
            id: '1',
            title: 'jc burnout',
            content: 'I feel isolated in JC—the JAE-IP divide, CCA rejections, and constant comparisons have crushed my confidence and fed my imposter syndrome. Watching others win awards while my grades slipped (from 67.5 to 52.5 RP) makes me dread school; online lectures don’t stick, I’m far behind, and I’ve even skipped classes to cope. My dream of medicine feels further away, and I’m torn between staying or pursuing vet science, but I worry about being “older” and judged. I just want to be recognised once and don’t know how to pick myself up.',
            author: 'shellybeanxx',
            subreddit: 'MentalHealth',
            upvotes: 245,
            comments: 67,
            timestamp: '2 hours ago',
            url: 'https://www.reddit.com/user/Ok_Rabbit_1613/',
            sentiment: 'negative',
            platform: 'REDDIT'
          },
          {
            id: '2',
            title: 'Struggling with anxiety and depression',
            content: 'Has anyone else felt like they\'re drowning in their own thoughts? I need some advice on coping mechanisms that actually work.',
            author: 'dancing_cascade',
            subreddit: 'depression',
            upvotes: 89,
            comments: 34,
            timestamp: '4 hours ago',
            url: 'https://www.reddit.com/user/AcceptableBridge7667/',
            sentiment: 'negative',
            platform: 'REDDIT'
          },
          {
            id: '3',
            title: 'Meditation and mindfulness techniques that work',
            content: 'I feel you because I have definitely felt this way in j1 too. ',
            author: 'JaiKay28',
            subreddit: 'Meditation',
            upvotes: 156,
            comments: 23,
            timestamp: '6 hours ago',
            url: 'https://reddit.com/r/Meditation/post3',
            sentiment: 'positive',
            platform: 'REDDIT'
          },
          {
            id: '4',
            title: 'Therapy session went well today',
            content: 'everyone in this sch is pissed at the lecture system.',
            author: 'Lazy_Taste_5054',
            subreddit: 'therapy',
            upvotes: 78,
            comments: 19,
            timestamp: '8 hours ago',
            url: 'https://reddit.com/r/therapy/post4',
            sentiment: 'positive',
            platform: 'REDDIT'
          }
        ];

        const insertStmt = db.prepare(`
          INSERT INTO mental_health_posts 
          (id, title, content, author, subreddit, upvotes, comments, timestamp, url, sentiment, platform)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        mockPosts.forEach(post => {
          insertStmt.run([
            post.id, post.title, post.content, post.author, post.subreddit,
            post.upvotes, post.comments, post.timestamp, post.url, post.sentiment, post.platform
          ]);
        });

        insertStmt.finalize();
        console.log('Mock mental health posts replaced successfully!');
    });
  });
};

// Python Scraper Function
function runPythonScraper() {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, 'reddit_scrapper_dashboard', 'src', 'utils', 'scraper.py');
    
    console.log('🐍 Starting Python Reddit scraper...');
    console.log('📍 Python script path:', pythonScript);
    
    const python = spawn('python3', [pythonScript], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let errorOutput = '';
    
    python.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      console.log('Python output:', chunk.trim());
    });
    
    python.stderr.on('data', (data) => {
      const chunk = data.toString();
      errorOutput += chunk;
      console.error('Python error:', chunk.trim());
    });
    
    python.on('close', (code) => {
      console.log(`🐍 Python script finished with code: ${code}`);
      
      if (code === 0) {
        try {
          // Parse the JSON output from the last line
          const lines = output.trim().split('\n');
          const jsonLine = lines[lines.length - 1];
          const result = JSON.parse(jsonLine);
          console.log('✅ Scraping result:', result);
          resolve(result);
        } catch (e) {
          console.error('❌ Failed to parse Python output:', e);
          console.error('Raw output:', output);
          reject(new Error('Failed to parse scraping result'));
        }
      } else {
        console.error('❌ Python script failed');
        console.error('Error output:', errorOutput);
        reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
      }
    });
    
    python.on('error', (error) => {
      console.error('❌ Failed to start Python script:', error);
      reject(error);
    });
  });
}

// API Routes

// Get all mental health posts
app.get('/api/mental-health-posts', (req, res) => {
  db.all("SELECT * FROM mental_health_posts ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      console.error('Error fetching mental health posts:', err);
      res.status(500).json({ error: 'Failed to fetch mental health posts' });
      return;
    }
    console.log(`📊 Returning ${rows.length} mental health posts`);
    res.json(rows);
  });
});

// Add new mental health post
app.post('/api/mental-health-posts', (req, res) => {
  const { title, content, author, subreddit, upvotes, comments, timestamp, url, sentiment, platform } = req.body;
  
  if (!title || !content || !author) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const id = Date.now().toString();
  
  db.run(`
    INSERT INTO mental_health_posts 
    (id, title, content, author, subreddit, upvotes, comments, timestamp, url, sentiment, platform)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, title, content, author, subreddit, upvotes || 0, comments || 0, timestamp, url, sentiment || 'neutral', platform], function(err) {
    if (err) {
      console.error('Error inserting mental health post:', err);
      res.status(500).json({ error: 'Failed to insert mental health post' });
      return;
    }
    console.log('✅ New mental health post added:', title);
    res.json({ id, message: 'Mental health post inserted successfully' });
  });
});

// Reddit Scraper endpoint
app.post('/api/scrape', async (req, res) => {
  try {
    console.log('🔍 Received scraping request...');
    
    // Run the Python scraper
    const result = await runPythonScraper();
    
    // If scraping was successful, you could save the result to database here
    if (result.success) {
      console.log('✅ Scraping completed successfully');
      // Optionally save scraped data to database
      // await saveScrapeResult(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('❌ Scraping error:', error);
    
    // Return a fallback response
    const fallbackResult = {
      success: false,
      error: error.message,
      title: 'Scraping failed',
      scroll_count: 0,
      page_height: 0,
      url: 'N/A'
    };
    
    res.status(500).json(fallbackResult);
  }
});

// Mood entries endpoints (for SAMH platform)
app.get('/api/mood-entries', (req, res) => {
  db.all("SELECT * FROM mood_entries ORDER BY timestamp DESC", (err, rows) => {
    if (err) {
      console.error('Error fetching mood entries:', err);
      res.status(500).json({ error: 'Failed to fetch mood entries' });
      return;
    }
    
    const parsedRows = rows.map(row => ({
      ...row,
      triggers: JSON.parse(row.triggers || '[]'),
      activities: JSON.parse(row.activities || '[]')
    }));
    
    console.log(`📊 Returning ${parsedRows.length} mood entries`);
    res.json(parsedRows);
  });
});

app.post('/api/mood-entries', (req, res) => {
  const { id, date, mood, moodLabel, triggers, activities, notes, timestamp } = req.body;
  
  if (!id || !date || mood === undefined || !moodLabel) {
    return res.status(400).json({ error: 'Missing required mood entry fields' });
  }
  
  db.run(`
    INSERT INTO mood_entries 
    (id, date, mood, mood_label, triggers, activities, notes, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, date, mood, moodLabel, JSON.stringify(triggers || []), JSON.stringify(activities || []), notes, timestamp], function(err) {
    if (err) {
      console.error('Error inserting mood entry:', err);
      res.status(500).json({ error: 'Failed to insert mood entry' });
      return;
    }
    
    console.log('✅ New mood entry added');
    res.json({ id, message: 'Mood entry inserted successfully' });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Unified Backend Server is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    database: 'connected'
  });
});

// Database stats
app.get('/api/stats', (req, res) => {
  const stats = {};
  
  db.get("SELECT COUNT(*) as count FROM mental_health_posts", (err, postsRow) => {
    if (err) return res.status(500).json({ error: 'Failed to get stats' });
    
    stats.mental_health_posts = postsRow.count;
    
    db.get("SELECT COUNT(*) as count FROM mood_entries", (err, moodRow) => {
      if (err) return res.status(500).json({ error: 'Failed to get stats' });
      
      stats.mood_entries = moodRow.count;
      res.json(stats);
    });
  });
});

// Initialize database and start server
initializeDatabase();

app.listen(PORT, () => {
  console.log(`🚀 Unified Backend Server running on http://localhost:${PORT}`);
  console.log('📊 Database initialized');
  console.log('🔗 Available endpoints:');
  console.log(`   GET  http://localhost:${PORT}/api/mental-health-posts`);
  console.log(`   POST http://localhost:${PORT}/api/mental-health-posts`);
  console.log(`   POST http://localhost:${PORT}/api/scrape`);
  console.log(`   GET  http://localhost:${PORT}/api/mood-entries`);
  console.log(`   POST http://localhost:${PORT}/api/mood-entries`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   GET  http://localhost:${PORT}/api/stats`);
  console.log('🌐 Serves both Reddit Scraper Dashboard and SAMH Platform');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Unified Backend Server...');
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
