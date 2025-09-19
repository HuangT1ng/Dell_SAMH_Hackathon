// import express from 'express';
// import pkg from 'sqlite3';
// import cors from 'cors';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const { Database } = pkg.verbose();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);


// const app = express();
// const PORT = 3003; // Different port for shared database

// // Middleware
// app.use(cors({
//   origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3001', 'http://localhost:3002'],
//   credentials: true
// }));
// app.use(express.json());

// // Database setup - centralized location
// const dbPath = path.join(__dirname, 'shared_data', 'scrapper_data.db');
// const db = new Database(dbPath);

// // Initialize database with comprehensive schema
// const initializeDatabase = () => {
//   db.serialize(() => {
//     // Mental health posts table (for scraper data)
//     db.run(`
//       CREATE TABLE IF NOT EXISTS mental_health_posts (
//         id TEXT PRIMARY KEY,
//         title TEXT NOT NULL,
//         content TEXT NOT NULL,
//         author TEXT NOT NULL,
//         subreddit TEXT NOT NULL,
//         upvotes INTEGER NOT NULL,
//         comments INTEGER NOT NULL,
//         timestamp TEXT NOT NULL,
//         url TEXT NOT NULL,
//         sentiment TEXT NOT NULL,
//         platform TEXT NOT NULL,
//         samh_username TEXT,
//         created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     // Add SAMH_USERNAME column if it doesn't exist (for existing databases)
//     db.run(`ALTER TABLE mental_health_posts ADD COLUMN samh_username TEXT`, (err) => {
//       if (err && !err.message.includes('duplicate column name')) {
//         console.error('Error adding samh_username column:', err);
//       }
//     });

//     // Mood entries table (for SAMH platform data)
//     db.run(`
//       CREATE TABLE IF NOT EXISTS mood_entries (
//         id TEXT PRIMARY KEY,
//         date TEXT NOT NULL,
//         mood INTEGER NOT NULL,
//         mood_label TEXT NOT NULL,
//         triggers TEXT NOT NULL, -- JSON string
//         activities TEXT NOT NULL, -- JSON string
//         notes TEXT,
//         timestamp INTEGER NOT NULL,
//         created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     // User analytics table (for platform insights)
//     db.run(`
//       CREATE TABLE IF NOT EXISTS user_analytics (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         event_type TEXT NOT NULL,
//         event_data TEXT NOT NULL, -- JSON string
//         timestamp INTEGER NOT NULL,
//         created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     // Check if mental health posts data already exists
//     db.get("SELECT COUNT(*) as count FROM mental_health_posts", (err, row) => {
//       if (err) {
//         console.error('Error checking mental health posts data:', err);
//         return;
//       }

//       if (row.count === 0) {
        
//         const posts = [
//           {
//             id: '1',
//             title: 'jc burnout',
//             content: 'I feel isolated in JC—the JAE-IP divide, CCA rejections, and constant comparisons have crushed my confidence and fed my imposter syndrome. Watching others win awards while my grades slipped (from 67.5 to 52.5 RP) makes me dread school; online lectures don\'t stick, I\'m far behind, and I\'ve even skipped classes to cope. My dream of medicine feels further away, and I\'m torn between staying or pursuing vet science, but I worry about being "older" and judged. I just want to be recognised once and don\'t know how to pick myself up.',
//             author: 'Ok_Rabbit_1613',
//             subreddit: 'MentalHealth',
//             upvotes: 245,
//             comments: 67,
//             timestamp: '2 hours ago',
//             url: 'https://www.reddit.com/user/Ok_Rabbit_1613/',
//             sentiment: 'positive',
//             platform: 'REDDIT',
//             samh_username: null
//           },
//           {
//             id: '2',
//             title: 'Struggling with anxiety and depression',
//             content: 'Has anyone else felt like they\'re drowning in their own thoughts? I need some advice on coping mechanisms that actually work.',
//             author: 'AcceptableBridge7667',
//             subreddit: 'depression',
//             upvotes: 89,
//             comments: 34,
//             timestamp: '4 hours ago',
//             url: 'https://www.reddit.com/user/AcceptableBridge7667/',
//             sentiment: 'negative',
//             platform: 'FACEBOOK',
//             samh_username: null
//           },
//           {
//             id: '3',
//             title: 'Meditation and mindfulness techniques that work',
//             content: 'I feel you because I have definitely felt this way in j1 too. ',
//             author: 'Lazy_Taste_5054',
//             subreddit: 'Meditation',
//             upvotes: 156,
//             comments: 23,
//             timestamp: '6 hours ago',
//             url: 'https://reddit.com/r/Meditation/post3',
//             sentiment: 'positive',
//             platform: 'X',
//             samh_username: null
//           },
//           {
//             id: '4',
//             title: 'Therapy session went well today',
//             content: 'everyone in this sch is pissed at the lecture system.',
//             author: 'krispy_krmemes',
//             subreddit: 'therapy',
//             upvotes: 78,
//             comments: 19,
//             timestamp: '8 hours ago',
//             url: 'https://reddit.com/r/therapy/post4',
//             sentiment: 'positive',
//             platform: 'REDDIT',
//             samh_username: null
//           },
//           {
//             id: '5',
//             title: 'Feeling overwhelmed with work stress',
//             content: 'I\'ve been working long hours and feeling really stressed lately. The pressure is getting to me and I\'m not sure how to manage it all. Looking for some advice on work-life balance.',
//             author: 'shellybeanxx',
//             subreddit: 'MentalHealth',
//             upvotes: 123,
//             comments: 45,
//             timestamp: '1 hour ago',
//             url: 'https://www.reddit.com/user/shellybeanxx/',
//             sentiment: 'negative',
//             platform: 'REDDIT',
//             samh_username: 'ht'
//           }
//         ];

//         const insertPostStmt = db.prepare(`
//           INSERT INTO mental_health_posts 
//           (id, title, content, author, subreddit, upvotes, comments, timestamp, url, sentiment, platform, samh_username)
//           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//         `);

//         posts.forEach(post => {
//           insertPostStmt.run([
//             post.id, post.title, post.content, post.author, post.subreddit,
//             post.upvotes, post.comments, post.timestamp, post.url, post.sentiment, post.platform, post.samh_username
//           ]);
//         });

//         insertPostStmt.finalize();
//       } else {
//         console.log(`Database already contains ${row.count} mental health posts`);
//       }
//     });
//   });
// };

// // API Routes

// // Mental Health Posts (for Reddit Scraper)
// app.get('/api/mental-health-posts', (req, res) => {
//   db.all("SELECT * FROM mental_health_posts ORDER BY created_at DESC", (err, rows) => {
//     if (err) {
//       console.error('Error fetching mental health posts:', err);
//       res.status(500).json({ error: 'Failed to fetch mental health posts' });
//       return;
//     }
    
//     console.log(`Returning ${rows.length} mental health posts`);
//     res.json(rows);
//   });
// });

// app.post('/api/mental-health-posts', (req, res) => {
//   const { title, content, author, subreddit, upvotes, comments, timestamp, url, sentiment, platform, samh_username } = req.body;
  
//   if (!title || !content || !author) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }
  
//   const id = Date.now().toString();
  
//   db.run(`
//     INSERT INTO mental_health_posts 
//     (id, title, content, author, subreddit, upvotes, comments, timestamp, url, sentiment, platform, samh_username)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `, [id, title, content, author, subreddit, upvotes || 0, comments || 0, timestamp, url, sentiment || 'neutral', platform, samh_username || null], function(err) {
//     if (err) {
//       console.error('Error inserting mental health post:', err);
//       res.status(500).json({ error: 'Failed to insert mental health post' });
//       return;
//     }
    
//     res.json({ id, message: 'Mental health post inserted successfully' });
//   });
// });

// // Mood Entries (for SAMH Platform)
// app.get('/api/mood-entries', (req, res) => {
//   db.all("SELECT * FROM mood_entries ORDER BY timestamp DESC", (err, rows) => {
//     if (err) {
//       console.error('Error fetching mood entries:', err);
//       res.status(500).json({ error: 'Failed to fetch mood entries' });
//       return;
//     }
    
//     // Parse JSON strings back to objects
//     const parsedRows = rows.map(row => ({
//       ...row,
//       triggers: JSON.parse(row.triggers || '[]'),
//       activities: JSON.parse(row.activities || '[]')
//     }));
    
//     console.log(`Returning ${parsedRows.length} mood entries`);
//     res.json(parsedRows);
//   });
// });

// app.post('/api/mood-entries', (req, res) => {
//   const { id, date, mood, moodLabel, triggers, activities, notes, timestamp } = req.body;
  
//   if (!id || !date || mood === undefined || !moodLabel) {
//     return res.status(400).json({ error: 'Missing required mood entry fields' });
//   }
  
//   db.run(`
//     INSERT INTO mood_entries 
//     (id, date, mood, mood_label, triggers, activities, notes, timestamp)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//   `, [id, date, mood, moodLabel, JSON.stringify(triggers || []), JSON.stringify(activities || []), notes, timestamp], function(err) {
//     if (err) {
//       console.error('Error inserting mood entry:', err);
//       res.status(500).json({ error: 'Failed to insert mood entry' });
//       return;
//     }
    
//     res.json({ id, message: 'Mood entry inserted successfully' });
//   });
// });

// // Analytics endpoint
// app.post('/api/analytics', (req, res) => {
//   const { eventType, eventData } = req.body;
  
//   if (!eventType || !eventData) {
//     return res.status(400).json({ error: 'Missing analytics data' });
//   }
  
//   db.run(`
//     INSERT INTO user_analytics (event_type, event_data, timestamp)
//     VALUES (?, ?, ?)
//   `, [eventType, JSON.stringify(eventData), Date.now()], function(err) {
//     if (err) {
//       console.error('Error inserting analytics:', err);
//       res.status(500).json({ error: 'Failed to insert analytics' });
//       return;
//     }
    
//     res.json({ message: 'Analytics data recorded successfully' });
//   });
// });

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ 
//     status: 'OK', 
//     message: 'Shared Mental Health Database Server is running',
//     timestamp: new Date().toISOString(),
//     port: PORT
//   });
// });

// // Database stats endpoint
// app.get('/api/stats', (req, res) => {
//   const stats = {};
  
//   db.get("SELECT COUNT(*) as count FROM mental_health_posts", (err, postsRow) => {
//     if (err) {
//       return res.status(500).json({ error: 'Failed to get stats' });
//     }
    
//     stats.mental_health_posts = postsRow.count;
    
//     db.get("SELECT COUNT(*) as count FROM mood_entries", (err, moodRow) => {
//       if (err) {
//         return res.status(500).json({ error: 'Failed to get stats' });
//       }
      
//       stats.mood_entries = moodRow.count;
      
//       db.get("SELECT COUNT(*) as count FROM user_analytics", (err, analyticsRow) => {
//         if (err) {
//           return res.status(500).json({ error: 'Failed to get stats' });
//         }
        
//         stats.user_analytics = analyticsRow.count;
//         res.json(stats);
//       });
//     });
//   });
// });

// // Create shared_data directory if it doesn't exist
// import fs from 'fs';
// const sharedDataDir = path.join(__dirname, 'shared_data');
// if (!fs.existsSync(sharedDataDir)) {
//   fs.mkdirSync(sharedDataDir, { recursive: true });
// }

// // Initialize database and start server
// initializeDatabase();

// app.listen(PORT, () => {
//   console.log(`🗄️  Shared Mental Health Database Server running on http://localhost:${PORT}`);
//   console.log('📊 Database initialized with comprehensive schema');
//   console.log('🔗 API endpoints:');
//   console.log(`   GET  http://localhost:${PORT}/api/mental-health-posts - Get mental health posts`);
//   console.log(`   POST http://localhost:${PORT}/api/mental-health-posts - Add mental health post`);
//   console.log(`   GET  http://localhost:${PORT}/api/mood-entries - Get mood entries`);
//   console.log(`   POST http://localhost:${PORT}/api/mood-entries - Add mood entry`);
//   console.log(`   POST http://localhost:${PORT}/api/analytics - Record analytics`);
//   console.log(`   GET  http://localhost:${PORT}/api/stats - Database statistics`);
//   console.log(`   GET  http://localhost:${PORT}/api/health - Health check`);
//   console.log('🔄 Accessible by both SAMH Platform and Reddit Scraper');
// });

// // Graceful shutdown
// process.on('SIGINT', () => {
//   console.log('\n🛑 Shutting down Shared Database Server...');
//   db.close((err) => {
//     if (err) {
//       console.error('Error closing database:', err);
//     } else {
//       console.log('📊 Database connection closed');
//     }
//     process.exit(0);
//   });
// });

// export default app;
