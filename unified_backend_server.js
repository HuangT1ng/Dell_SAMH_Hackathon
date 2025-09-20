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
    // Drop existing chat tables to recreate with new schema
    db.run(`DROP TABLE IF EXISTS chat_messages`);
    db.run(`DROP TABLE IF EXISTS user_conversation_views`);
    db.run(`DROP TABLE IF EXISTS chat_conversations`);
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
        samh_username TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add SAMH_USERNAME column if it doesn't exist (for existing databases)
    db.run(`ALTER TABLE mental_health_posts ADD COLUMN samh_username TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding samh_username column:', err);
      }
    });

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

    // Chat conversations table (for shared chat history)
    db.run(`
      CREATE TABLE chat_conversations (
        id TEXT PRIMARY KEY,
        user1 TEXT NOT NULL,
        user2 TEXT NOT NULL,
        last_message TEXT,
        last_message_time INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user1, user2)
      )
    `);

    // User conversation views (for per-user settings like unread count, deleted status)
    db.run(`
      CREATE TABLE user_conversation_views (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        unread_count INTEGER DEFAULT 0,
        is_deleted BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES chat_conversations (id) ON DELETE CASCADE,
        UNIQUE(conversation_id, user_id)
      )
    `);

    // Chat messages table (for shared messages)
    db.run(`
      CREATE TABLE chat_messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        sender_username TEXT NOT NULL,
        text TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES chat_conversations (id) ON DELETE CASCADE
      )
    `);

    // Community events table (for community events)
    db.run(`
      CREATE TABLE IF NOT EXISTS community_events (
        id TEXT PRIMARY KEY,
        organization_name TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT NOT NULL,
        image_url TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User accounts table (for tracking user logins)
    db.run(`
      CREATE TABLE IF NOT EXISTS user_accounts (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        account_type TEXT NOT NULL CHECK (account_type IN ('admin', 'user')),
        first_login DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
        login_count INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating user_accounts table:', err);
      } else {
        console.log('✅ user_accounts table created successfully');
      }
    });
    
    // Clear existing data
    db.run("DELETE FROM mental_health_posts", (err) => {
      if (err) {
        console.error('Error clearing existing data:', err);
        return;
      }
        
        const posts = [
          {
            id: '1',
            title: 'jc burnout',
            content: "I feel isolated in JC—the JAE-IP divide, CCA rejections, and constant comparisons have crushed my confidence and fed my imposter syndrome. Watching others win awards while my grades slipped (from 67.5 to 52.5 RP) makes me dread school; online lectures don't stick, I'm far behind, and I've even skipped classes to cope. My dream of medicine feels further away, and I'm torn between staying or pursuing vet science, but I worry about being older and judged. I just want to be recognised once and don't know how to pick myself up.",
            author: 'shellybeanxx',
            subreddit: 'MentalHealth',
            upvotes: 245,
            comments: 67,
            timestamp: '2 hours ago',
            url: 'https://www.reddit.com/user/Ok_Rabbit_1613/',
            sentiment: 'negative',
            platform: 'REDDIT',
            samh_username: 'ht'
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
            platform: 'REDDIT',
            samh_username: 'grace'
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
            sentiment: 'neutral',
            platform: 'REDDIT',
            samh_username: null
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
            sentiment: 'negative',
            platform: 'REDDIT',
            samh_username: null
          },
          {
            id: '5',
            title: 'No energy to focus',
            content: 'just no energy to focus on those cuz all my energy is just on studying',
            author: 'Ok-Accountant-5177',
            subreddit: 'StudentLife',
            upvotes: 42,
            comments: 18,
            timestamp: '1 hour ago',
            url: 'https://reddit.com/r/StudentLife/post5',
            sentiment: 'negative',
            platform: 'REDDIT',
            samh_username: null
          },
          {
            id: '6',
            title: 'Feeling like a failure',
            content: 'how much of a failure I am.',
            author: 'Vast_Resident_2289',
            subreddit: 'depression',
            upvotes: 67,
            comments: 25,
            timestamp: '3 hours ago',
            url: 'https://reddit.com/r/depression/post6',
            sentiment: 'negative',
            platform: 'REDDIT',
            samh_username: null
          },
          {
            id: '7',
            title: 'Personal insecurities',
            content: 'they\'re just projecting their personal insecurities.',
            author: 'Haunting_Tea_8207',
            subreddit: 'MentalHealth',
            upvotes: 89,
            comments: 31,
            timestamp: '5 hours ago',
            url: 'https://reddit.com/r/MentalHealth/post7',
            sentiment: 'neutral',
            platform: 'REDDIT',
            samh_username: null
          },
          {
            id: '8',
            title: 'Too much to do, too little time',
            content: 'Why does it always feel like there\'s so much to do and so little time',
            author: 'Thekabablord',
            subreddit: 'Stress',
            upvotes: 134,
            comments: 45,
            timestamp: '7 hours ago',
            url: 'https://reddit.com/r/Stress/post8',
            sentiment: 'negative',
            platform: 'REDDIT',
            samh_username: null
          },
          {
            id: '9',
            title: 'Always isolated',
            content: 'I am (almost) always isolated.',
            author: 'No_Debate4294',
            subreddit: 'lonely',
            upvotes: 78,
            comments: 22,
            timestamp: '9 hours ago',
            url: 'https://reddit.com/r/lonely/post9',
            sentiment: 'negative',
            platform: 'REDDIT',
            samh_username: null
          },
          {
            id: '10',
            title: 'Looking back at awkward moments',
            content: 'Sometimes I just look back at all the awkward things I\'ve done and feel so useless, like I\'m never going to fit in or get past my mistakes. It\'s exhausting to keep up a front and try to laugh things off when all I want to do is scream about how hard life feels right now.',
            author: 'nonfriedjml',
            subreddit: 'socialanxiety',
            upvotes: 156,
            comments: 38,
            timestamp: '11 hours ago',
            url: 'https://reddit.com/r/socialanxiety/post10',
            sentiment: 'negative',
            platform: 'REDDIT',
            samh_username: null
          },
          {
            id: '11',
            title: 'Something wrong with me',
            content: 'It feels like there\'s something wrong with me that no one else can see. I keep struggling to understand why everything feels overwhelming, and it\'s discouraging when people just brush it off like I\'m overreacting.',
            author: 'NecessaryFish8132',
            subreddit: 'MentalHealth',
            upvotes: 203,
            comments: 67,
            timestamp: '13 hours ago',
            url: 'https://reddit.com/r/MentalHealth/post11',
            sentiment: 'negative',
            platform: 'REDDIT',
            samh_username: null
          },
          {
            id: '12',
            title: 'Tired of hearing "see a therapist"',
            content: 'Honestly, I don\'t want to hear \'just see a therapist\' one more time. It feels like nobody actually wants to hear about my struggles—they just want me to bottle it up and stop bothering them with my problems.',
            author: 'BangMyPussy',
            subreddit: 'TrueOffMyChest',
            upvotes: 289,
            comments: 84,
            timestamp: '15 hours ago',
            url: 'https://reddit.com/r/TrueOffMyChest/post12',
            sentiment: 'negative',
            platform: 'REDDIT',
            samh_username: null
          },
          {
            id: '13',
            title: 'Overwhelmed by anxiety',
            content: 'I\'m so overwhelmed by anxiety and stress that even leaving my room feels impossible.',
            author: 'OkReserve7647',
            subreddit: 'Anxiety',
            upvotes: 167,
            comments: 42,
            timestamp: '17 hours ago',
            url: 'https://reddit.com/r/Anxiety/post13',
            sentiment: 'negative',
            platform: 'REDDIT',
            samh_username: null
          },
          {
            id: '14',
            title: 'Suffocating pressure about grades',
            content: 'The constant pressure about grades is suffocating, and it never seems to end.',
            author: 'sunnyislandacross',
            subreddit: 'StudentLife',
            upvotes: 145,
            comments: 56,
            timestamp: '19 hours ago',
            url: 'https://reddit.com/r/StudentLife/post14',
            sentiment: 'negative',
            platform: 'REDDIT',
            samh_username: null
          },
          {
            id: '15',
            title: 'Nothing is helping',
            content: 'It feels like nobody and nothing is really helping, no matter how tough things get.',
            author: 'scams-are-everywhere',
            subreddit: 'depression',
            upvotes: 98,
            comments: 29,
            timestamp: '21 hours ago',
            url: 'https://reddit.com/r/depression/post15',
            sentiment: 'negative',
            platform: 'REDDIT',
            samh_username: null
          },
          {
            id: '16',
            title: 'Watching everyone cope while I struggle',
            content: 'Watching everyone cope while I struggle just makes me feel even more alone.',
            author: 'Learn222',
            subreddit: 'lonely',
            upvotes: 112,
            comments: 34,
            timestamp: '23 hours ago',
            url: 'https://reddit.com/r/lonely/post16',
            sentiment: 'negative',
            platform: 'REDDIT',
            samh_username: null
          }
        ];

        const insertStmt = db.prepare(`
          INSERT INTO mental_health_posts 
          (id, title, content, author, subreddit, upvotes, comments, timestamp, url, sentiment, platform, samh_username)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        posts.forEach(post => {
          insertStmt.run([
            post.id, post.title, post.content, post.author, post.subreddit,
            post.upvotes, post.comments, post.timestamp, post.url, post.sentiment, post.platform, post.samh_username
          ]);
        });

        insertStmt.finalize();
    });
  });

  // Clear existing community events data and insert fresh data on server restart
  db.run("DELETE FROM community_events", (err) => {
    if (err) {
      console.error('Error clearing community events data:', err);
      return;
    }
    
      
      const events =[
        {
          id: '1',
          organization_name: 'Youth Brahm Centre',
          description: 'Brahm Centre is a registered charity that promotes happier and healthier living through empowering people to stay well.',
          location: '47, Scotts Road, #05-02, Goldbell Towers, Singapore 228233',
          image_url: 'https://mindline.sg/_next/image?url=https%3A%2F%2Fmindline.sg%2Foriginal_images%2FBrahm_Centre_ggv2G60.png&w=3840&q=75'
        },
        {
          id: '2',
          organization_name: 'Care Corner Singapore',
          description: 'Established in 1981, Care Corner Singapore is a non-profit organisation providing social and health care services for those in need.',
          location: '6, Woodlands Square, #03-01, Woods Square Tower 2, Singapore 737737',
          image_url: 'https://mindline.sg/_next/image?url=https%3A%2F%2Fmindline.sg%2Foriginal_images%2FCare_Corner_y1EnRXe.png&w=3840&q=75'
        },
        {
          id: '3',
          organization_name: 'CARE Singapore',
          description: 'CARE Singapore exists to help vulnerable young people find direction, hope and success.',
          location: 'Blk 428, Pasir Ris Drive 6, #01-21, Singapore 510428',
          image_url: 'https://care.sg/wp-content/uploads/2023/02/Untitled-design-1.png'
        },
        {
          id: '4',
          organization_name: 'Fei Yue Community Services',
          description: 'Since 1996, Fei Yue Community Services has been fostering life transformation and supporting individuals of all ages through purposeful service.',
          location: 'Blk 145, Simei Street 2, #01-06, Singapore 520145',
          image_url: 'https://mindline.sg/_next/image?url=https%3A%2F%2Fmindline.sg%2Foriginal_images%2FFei_Yue_Community_Services_6PmJ1cy.png&w=3840&q=75'
        },
        {
          id: '5',
          organization_name: 'Lakeside Family Services',
          description: 'At Lakeside Family Services, we seek to change lives and transform communities, through a wide range of holistic services, so that people will find hope and healing.',
          location: 'Blk 997, Jurong West Street 93, #01-369, Singapore 640977',
          image_url: 'https://mindline.sg/_next/image?url=https%3A%2F%2Fmindline.sg%2Foriginal_images%2FLakeside_Family_Services.png&w=3840&q=75'
        },
        {
          id: '6',
          organization_name: 'Limitless (Ltd)',
          description: 'Limitless is a youth mental health organisation that provides accessible services and treatment to youths who need support for their mental health.',
          location: '176, Orchard Road, #05-05, JustCo, Singapore 238843',
          image_url: 'https://mindline.sg/_next/image?url=https%3A%2F%2Fmindline.sg%2Foriginal_images%2FLimitless.png&w=3840&q=75'
        },
        {
          id: '7',
          organization_name: 'SHINE Children and Youth Services',
          description: 'SHINE Children and Youth Services is a registered charity, empowering children, youth, and families in Singapore since 1976.',
          location: 'Blk 329, Clementi Avenue 2, #01-248, Singapore 120329',
          image_url: 'https://mindline.sg/_next/image?url=https%3A%2F%2Fmindline.sg%2Foriginal_images%2FSHINE_Children__Youth_Services.png&w=3840&q=75'
        },
        {
          id: '8',
          organization_name: 'Singapore Anglican Community Services',
          description: 'Singapore Anglican Community Services is the community service arm of the Diocese of Singapore. It is a major psychiatric rehabilitation service provider in Singapore. It also offers care services for families-in-crisis',
          location: 'Block 184C Rivervale Crescent, #01-199',
          image_url: 'https://mindline.sg/_next/image?url=https%3A%2F%2Fmindline.sg%2Foriginal_images%2FSingapore_Anglican_Community_Services_tYyKNdO.png&w=3840&q=75'
        },
        {
          id: '9',
          organization_name: 'Singapore Association for Mental Health (SAMH) – Woodlands',
          description: 'Since 1968, the Singapore Association for Mental Health (SAMH) uplifts lives, promoting mental wellness for all - youths, adults and seniors.',
          location: '317, Woodlands Street 31, #01-196, Singapore 730317',
          image_url: 'https://mindline.sg/_next/image?url=https%3A%2F%2Fmindline.sg%2Foriginal_images%2FSingapore_Association_for_Mental_Health_NeOq52u.png&w=3840&q=75'
        },
        {
          id: '10',
          organization_name: 'Singapore Association for Mental Health (SAMH) – Bedok',
          description: 'Since 1968, the Singapore Association for Mental Health (SAMH) uplifts lives, promoting mental wellness for all - youths, adults and seniors.',
          location: 'Blk 124, Bedok North Rd, #01-133, Singapore 460124',
          image_url: 'https://mindline.sg/_next/image?url=https%3A%2F%2Fmindline.sg%2Foriginal_images%2FSingapore_Association_for_Mental_Health_XxCkAbn.png&w=3840&q=75'
        },
        {
          id: '11',
          organization_name: "ActiveSG Multi-Sport School Holiday Programme",
          description: "Kids aged 5–12 can join hockey, football, basketball, table tennis, and athletics at various sport centres during school holidays, helping them build skills and make friends.",
          location: "Delta Sport Centre, Jurong East Sport Centre, Heartbeat@Bedok, Bedok Stadium, Sengkang Sport Centre",
          image_url: ""
        },
        {
          id: '12',
          organization_name: "GetActive! Singapore 2025",
          description: "Singapore’s annual National Day celebration through sport, featuring community runs, cycling, aquatics, inclusive sports, and even record-setting gatherings for pet lovers.",
          location: "Singapore Sports Hub and selected ActiveSG Sport Centres, heartland venues",
          image_url: ""
        },
        {
          id: '13',
          organization_name: "Play Inclusive 2025",
          description: "Singapore’s largest inclusive sports movement, enabling those with and without disabilities to enjoy team sports like football, basketball, and floorball together.",
          location: "Singapore Sports Hub and heartland ActiveSG centres",
          image_url: ""
        },
        {
          id: '14',
          organization_name: "Majulah Fiesta Fitness Party",
          description: "A public fitness celebration as part of SG60 featuring dance workouts, concerts, and local markets.",
          location: "Singapore Sports Hub",
          image_url: ""
        },
        {
          id: '15',
          organization_name: "Singapore Urban Sports + Fitness Festival 2025",
          description: "Three weekends of urban sports like climbing, parkour, dance battles, skateboarding, and more.",
          location: "Singapore city & hub venues",
          image_url: ""
        },

        {
          id: '17',
          organization_name: "KpopX Fitness (September 2025 Edition)",
          description: "Free energetic workout events inspired by K-pop music, involving dance routines and mass workouts.",
          location: "Singapore EXPO",
          image_url: ""
        },
        {
          id: '18',
          organization_name: "Pesta Sukan",
          description: "Singapore’s oldest multi-sport festival with 37 sports and new mind sports like Chess/Weiqi.",
          location: "Multiple sport centres, Singapore",
          image_url: ""
        },
        {
          id: '19',
          organization_name: "Healthy Living Festival @ North West",
          description: "Mega family event featuring fun runs, sports clinics, and healthy living activities.",
          location: "Venues across North West District",
          image_url: ""
        },
        {
          id: '20',
          organization_name: "Lion City Dance Convention",
          description: "Open dance competition, movement workshops, and fitness dance-offs.",
          location: "Singapore Sports Hub",
          image_url: ""
        },
        {
          id: '21',
          organization_name: "ActiveSG Basketball Open Play",
          description: "Join walk-in basketball games for all skill levels, with coaching available on select dates.",
          location: "ActiveSG Basketball Centres, islandwide",
          image_url: ""
        },
        {
          id: '22',
          organization_name: "Family Aqua Fun Fiesta",
          description: "Inclusive pool day for families, with friendly swim races, water games, and float parades.",
          location: "ActiveSG Swimming Complexes, Singapore",
          image_url: ""
        },
        {
          id: '23',
          organization_name: "Pet Lovers’ Record Run",
          description: "Join the nation’s largest pet walk event and set a Singapore record for most humans and pets in a single walk!",
          location: "Kallang Riverside Park",
          image_url: ""
        },
        {
          id: '24',
          organization_name: "Cycle Safe! Community Cycling Clinic",
          description: "Free education clinic and ride-along for safe urban cycling with skills tips for all ages.",
          location: "Various PCN (Park Connector Network) nodes, Singapore",
          image_url: ""
        },
        {
          id: '25',
          organization_name: "Inclusive Wheelchair Sports Try-out",
          description: "Experience wheelchair basketball, boccia, and para-archery in this monthly inclusive event.",
          location: "ActiveSG Heartbeat@Bedok",
          image_url: ""
        },
        {
          id: '26',
          organization_name: "Yoga for Everyone",
          description: "Free public yoga sessions with professional instructors, suitable for all levels and abilities.",
          location: "East Coast Park (Area F)",
          image_url: ""
        },
        {
          id: '27',
          organization_name: "Family Badminton Day",
          description: "Open play sessions and family matches, with racquets and shuttles provided on site.",
          location: "Toa Payoh Sports Hall and other selected stadiums",
          image_url: ""
        },
        {
          id: '28',
          organization_name: "Urban Adventure Kids Bootcamp",
          description: "Obstacle zones and fun fitness challenges for energetic children ages 7–12.",
          location: "Yishun Sports Complex",
          image_url: ""
        },
        {
          id: '29',
          organization_name: "Kayak & Clean!",
          description: "Paddle together with ActiveSG volunteers to clean up Singapore’s waters.",
          location: "Bedok Reservoir Park",
          image_url: ""
        },

        {
          id: '32',
          organization_name: "Car-Free Wellness Walk",
          description: "Guided evening walk and wellness circuit with the city’s streets closed to traffic.",
          location: "Civic District / City Hall area",
          image_url: ""
        },
        {
          id: '33',
          organization_name: "Learn-To-Swim Together",
          description: "Small-group beginner swimming classes for adults and youth, with safety coaching.",
          location: "ActiveSG Swimming Complexes",
          image_url: ""
        },
        {
          id: '34',
          organization_name: "Run for Inclusion 2025",
          description: "Annual mass run celebrating disability inclusion, with runners supporting visually- and mobility-impaired peers.",
          location: "F1 Pit Building, Singapore",
          image_url: ""
        },
        {
          id: '35',
          organization_name: "Mall Walk Challenge",
          description: "Challenge yourself and friends to a fun, competitive, and accessible mall walk.",
          location: "Ion Orchard, VivoCity, other participating malls",
          image_url: ""
        },
        {
          id: '36',
          organization_name: "Park Fitness Pop-up",
          description: "Mobile fitness trainer sessions in Singapore’s parks, with circuit workouts for all.",
          location: "MacRitchie Reservoir, West Coast Park, and more",
          image_url: ""
        },
        {
          id: '37',
          organization_name: "ActiveSG Junior Football League",
          description: "Join or cheer in youth football leagues with teams from across Singapore.",
          location: "ActiveSG Football Centres",
          image_url: ""
        },
        {
          id: '38',
          organization_name: "Community Dragon Boat Day",
          description: "Team up for dragon boating workshops and friendly races on open water.",
          location: "Kallang Basin",
          image_url: ""
        },
        {
          id: '39',
          organization_name: "Ping Pong Social Hour",
          description: "Friendly open table-tennis sessions for players of all experience levels.",
          location: "Pasir Ris Sports Hall and multiple venues",
          image_url: ""
        },
        {
          id: '40',
          organization_name: "Climb For All",
          description: "Free wall climbing day for youth and families. All gear and safety guidance provided.",
          location: "Our Tampines Hub",
          image_url: ""
        },
        {
          id: '41',
          organization_name: "Weekend Sports with Friends",
          description: "Group sports meetups (volleyball, basketball, floorball, dodgeball) open for all sign-ups, every Saturday.",
          location: "Community Clubs and Sport Centres",
          image_url: ""
        }
      ];

      const insertEventStmt = db.prepare(`
        INSERT INTO community_events 
        (id, organization_name, description, location, image_url)
        VALUES (?, ?, ?, ?, ?)
      `);

      events.forEach(event => {
        insertEventStmt.run([
          event.id, event.organization_name, event.description, event.location, event.image_url
        ]);
      });

      insertEventStmt.finalize();
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
    // console.log(`📊 Returning ${rows.length} mental health posts`);
    res.json(rows);
  });
});

// Add new mental health post
app.post('/api/mental-health-posts', (req, res) => {
  const { title, content, author, subreddit, upvotes, comments, timestamp, url, sentiment, platform, samh_username } = req.body;
  
  if (!title || !content || !author) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const id = Date.now().toString();
  
  db.run(`
    INSERT INTO mental_health_posts 
    (id, title, content, author, subreddit, upvotes, comments, timestamp, url, sentiment, platform, samh_username)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, title, content, author, subreddit, upvotes || 0, comments || 0, timestamp, url, sentiment || 'neutral', platform, samh_username || null], function(err) {
    if (err) {
      console.error('Error inserting mental health post:', err);
      res.status(500).json({ error: 'Failed to insert mental health post' });
      return;
    }
    console.log('✅ New mental health post added:', title);
    res.json({ id, message: 'Mental health post inserted successfully' });
  });
});

// Get all community events
app.get('/api/community-events', (req, res) => {
  db.all("SELECT * FROM community_events ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      console.error('Error fetching community events:', err);
      res.status(500).json({ error: 'Failed to fetch community events' });
      return;
    }
    console.log(`📊 Returning ${rows.length} community events`);
    res.json(rows);
  });
});

// Add new community event
app.post('/api/community-events', (req, res) => {
  const { organization_name, description, location, image_url } = req.body;
  
  if (!organization_name || !description || !location || !image_url) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const id = Date.now().toString();
  
  db.run(`
    INSERT INTO community_events 
    (id, organization_name, description, location, image_url)
    VALUES (?, ?, ?, ?, ?)
  `, [id, organization_name, description, location, image_url], function(err) {
    if (err) {
      console.error('Error inserting community event:', err);
      res.status(500).json({ error: 'Failed to insert community event' });
      return;
    }
    console.log('✅ New community event added:', organization_name);
    res.json({ id, message: 'Community event inserted successfully' });
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
    
    // console.log(`📊 Returning ${parsedRows.length} mood entries`);
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

// Chat API endpoints

// Get all conversations for a user
app.get('/api/chat/conversations/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.all(`
    SELECT 
      c.*,
      ucv.unread_count,
      ucv.is_deleted,
      CASE 
        WHEN c.user1 = ? THEN c.user2 
        ELSE c.user1 
      END as contact_name,
      CASE 
        WHEN c.user1 = ? THEN u2.account_type 
        ELSE u1.account_type 
      END as contact_account_type
    FROM chat_conversations c
    LEFT JOIN user_conversation_views ucv ON c.id = ucv.conversation_id AND ucv.user_id = ?
    LEFT JOIN user_accounts u1 ON c.user1 = u1.username
    LEFT JOIN user_accounts u2 ON c.user2 = u2.username
    WHERE (c.user1 = ? OR c.user2 = ?) 
    AND (ucv.is_deleted = 0 OR ucv.is_deleted IS NULL)
    ORDER BY c.last_message_time DESC
  `, [userId, userId, userId, userId, userId], (err, rows) => {
    if (err) {
      console.error('Error fetching conversations:', err);
      res.status(500).json({ error: 'Failed to fetch conversations' });
      return;
    }
    
    // console.log(`📊 Returning ${rows.length} conversations for user ${userId}`);
    res.json(rows);
  });
});

// Get messages for a specific conversation
app.get('/api/chat/conversations/:conversationId/messages', (req, res) => {
  const { conversationId } = req.params;
  
  db.all(`
    SELECT 
      id,
      conversation_id,
      sender_username,
      text,
      timestamp,
      CASE 
        WHEN sender_username = ? THEN 'user'
        ELSE 'bot'
      END as sender
    FROM chat_messages 
    WHERE conversation_id = ?
    ORDER BY timestamp ASC
  `, [req.query.currentUser || '', conversationId], (err, rows) => {
    if (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ error: 'Failed to fetch messages' });
      return;
    }
    
    // console.log(`📊 Returning ${rows.length} messages for conversation ${conversationId}`);
    res.json(rows);
  });
});

// Create a new conversation
app.post('/api/chat/conversations', (req, res) => {
  const { user1, user2 } = req.body;
  
  if (!user1 || !user2) {
    return res.status(400).json({ error: 'Missing required fields: user1 and user2' });
  }
  
  if (user1 === user2) {
    return res.status(400).json({ error: 'Cannot create conversation with yourself' });
  }
  
  // Ensure consistent ordering (alphabetically) to avoid duplicates
  const [firstUser, secondUser] = [user1, user2].sort();
  
  // First check if conversation already exists
  db.get(`
    SELECT id FROM chat_conversations 
    WHERE user1 = ? AND user2 = ?
  `, [firstUser, secondUser], function(err, existingConv) {
    if (err) {
      console.error('Error checking existing conversation:', err);
      res.status(500).json({ error: 'Failed to check existing conversation' });
      return;
    }
    
    if (existingConv) {
      // Conversation already exists, use existing ID
      const conversationId = existingConv.id;
      console.log('✅ Using existing conversation:', conversationId);
      
      // Create user conversation views for both users (if they don't exist)
      const viewId1 = `${conversationId}_${firstUser}`;
      const viewId2 = `${conversationId}_${secondUser}`;
      
      db.run(`
        INSERT OR IGNORE INTO user_conversation_views 
        (id, conversation_id, user_id, unread_count, is_deleted)
        VALUES (?, ?, ?, 0, 0)
      `, [viewId1, conversationId, firstUser], (err1) => {
        if (err1) console.error('Error creating user view 1:', err1);
      });
      
      db.run(`
        INSERT OR IGNORE INTO user_conversation_views 
        (id, conversation_id, user_id, unread_count, is_deleted)
        VALUES (?, ?, ?, 0, 0)
      `, [viewId2, conversationId, secondUser], (err2) => {
        if (err2) console.error('Error creating user view 2:', err2);
      });
      
      console.log('✅ Conversation ready between:', firstUser, 'and', secondUser, 'ID:', conversationId);
      res.json({ id: conversationId, message: 'Conversation ready' });
      return;
    }
    
    // Create new conversation
    const conversationId = Date.now().toString();
    db.run(`
      INSERT INTO chat_conversations 
      (id, user1, user2, last_message_time)
      VALUES (?, ?, ?, ?)
    `, [conversationId, firstUser, secondUser, Date.now()], function(insertErr) {
      if (insertErr) {
        console.error('Error creating conversation:', insertErr);
        res.status(500).json({ error: 'Failed to create conversation' });
        return;
      }
      console.log('✅ New conversation created:', conversationId);
      
      // Create user conversation views for both users (if they don't exist)
      const viewId1 = `${conversationId}_${firstUser}`;
      const viewId2 = `${conversationId}_${secondUser}`;
      
      db.run(`
        INSERT OR IGNORE INTO user_conversation_views 
        (id, conversation_id, user_id, unread_count, is_deleted)
        VALUES (?, ?, ?, 0, 0)
      `, [viewId1, conversationId, firstUser], (err1) => {
        if (err1) console.error('Error creating user view 1:', err1);
      });
      
      db.run(`
        INSERT OR IGNORE INTO user_conversation_views 
        (id, conversation_id, user_id, unread_count, is_deleted)
        VALUES (?, ?, ?, 0, 0)
      `, [viewId2, conversationId, secondUser], (err2) => {
        if (err2) console.error('Error creating user view 2:', err2);
      });
      
      console.log('✅ Conversation ready between:', firstUser, 'and', secondUser, 'ID:', conversationId);
      res.json({ id: conversationId, message: 'Conversation ready' });
    });
  });
});

// Send a message
app.post('/api/chat/messages', (req, res) => {
  const { conversationId, senderUsername, text } = req.body;
  
  if (!conversationId || !senderUsername || !text) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const messageId = Date.now().toString();
  const timestamp = Date.now();
  
  // Insert the message
  db.run(`
    INSERT INTO chat_messages 
    (id, conversation_id, sender_username, text, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `, [messageId, conversationId, senderUsername, text, timestamp], function(err) {
    if (err) {
      console.error('Error sending message:', err);
      res.status(500).json({ error: 'Failed to send message' });
      return;
    }
    
    // Update conversation's last message and timestamp
    db.run(`
      UPDATE chat_conversations 
      SET last_message = ?, last_message_time = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [text, timestamp, conversationId], function(updateErr) {
      if (updateErr) {
        console.error('Error updating conversation:', updateErr);
      }
    });
    
    // Increment unread count for the other user
    db.run(`
      UPDATE user_conversation_views 
      SET unread_count = unread_count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE conversation_id = ? AND user_id != ?
    `, [conversationId, senderUsername], function(unreadErr) {
      if (unreadErr) {
        console.error('Error updating unread count:', unreadErr);
      }
    });
    
    console.log('✅ New message sent by:', senderUsername);
    res.json({ id: messageId, message: 'Message sent successfully' });
  });
});

// Mark conversation as read (reset unread count)
app.put('/api/chat/conversations/:conversationId/read', (req, res) => {
  const { conversationId } = req.params;
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId in request body' });
  }
  
  db.run(`
    UPDATE user_conversation_views 
    SET unread_count = 0, updated_at = CURRENT_TIMESTAMP
    WHERE conversation_id = ? AND user_id = ?
  `, [conversationId, userId], function(err) {
    if (err) {
      console.error('Error marking conversation as read:', err);
      res.status(500).json({ error: 'Failed to mark conversation as read' });
      return;
    }
    
    console.log('✅ Conversation marked as read for user:', userId);
    res.json({ message: 'Conversation marked as read' });
  });
});

// Delete/restore conversation
app.put('/api/chat/conversations/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  const { isDeleted, userId } = req.body;
  
  if (typeof isDeleted !== 'boolean') {
    return res.status(400).json({ error: 'isDeleted must be a boolean' });
  }
  
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId in request body' });
  }
  
  db.run(`
    UPDATE user_conversation_views 
    SET is_deleted = ?, updated_at = CURRENT_TIMESTAMP
    WHERE conversation_id = ? AND user_id = ?
  `, [isDeleted ? 1 : 0, conversationId, userId], function(err) {
    if (err) {
      console.error('Error updating conversation:', err);
      res.status(500).json({ error: 'Failed to update conversation' });
      return;
    }
    
    console.log(`✅ Conversation ${isDeleted ? 'deleted' : 'restored'} for user:`, userId);
    res.json({ message: `Conversation ${isDeleted ? 'deleted' : 'restored'} successfully` });
  });
});

// Global cache to prevent duplicate API calls
const quickMessageCache = new Map();
const CACHE_DURATION = 10000; // 10 seconds

// Generate quick messages using LLM
app.post('/api/chat/generate-quick-messages', async (req, res) => {
  const { conversationId, messages, forceRefresh } = req.body;
  
  if (!conversationId || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing required fields: conversationId and messages' });
  }
  
  // Check cache first - use last message ID for better uniqueness
  const lastMessage = messages[messages.length - 1];
  const cacheKey = `${conversationId}_${messages.length}_${lastMessage?.id || 'empty'}`;
  const cached = quickMessageCache.get(cacheKey);
  const now = Date.now();
  
  // Skip cache if forceRefresh is true
  if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log(`💾 [NVIDIA NIMs] Using cached suggestions for conversation ${conversationId}`);
    return res.json({ suggestions: cached.suggestions });
  }
  
  if (forceRefresh) {
    console.log(`🔄 [NVIDIA NIMs] Force refresh requested for conversation ${conversationId} - bypassing cache`);
  }
  
  console.log(`🤖 [NVIDIA NIMs] Starting quick message generation for conversation ${conversationId}`);
  console.log(`📊 [NVIDIA NIMs] Message count: ${messages.length}`);
  
  try {
    // Import the chat service
    const { spawn } = await import('child_process');
    const path = await import('path');
    
    // Create a prompt for generating quick message suggestions
    const conversationHistory = messages.map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');
    
    const prompt = `You are a mental health support assistant. Based on the conversation history below, provide exactly 3 short, empathetic response suggestions for an admin to use. Each suggestion should be under 15 words and be supportive and appropriate.

Conversation History:
${conversationHistory}

Respond with ONLY 3 lines, each containing one suggestion. No explanations, no reasoning, just the 3 suggestions.`;

  // Add randomness for force refresh to get different responses
  const randomTemp = forceRefresh ? (0.7 + Math.random() * 0.3).toFixed(2) : '0.5'; // 0.7-1.0 for force refresh
  const randomTopP = forceRefresh ? (0.8 + Math.random() * 0.2).toFixed(2) : '0.7'; // 0.8-1.0 for force refresh
  
  if (forceRefresh) {
    console.log(`🎲 [NVIDIA NIMs] Using randomized parameters: temp=${randomTemp}, top_p=${randomTopP}`);
  }
  
  // Call the Python chatbot service
  console.log(`🐍 [NVIDIA NIMs] Spawning Python process for conversation ${conversationId}`);
  const pythonProcess = spawn('python3', [
    path.join(__dirname, 'chatbot', 'main.py'),
    '--prompt', prompt,
    '--max-tokens', '100',
    '--temperature', randomTemp,
    '--top-p', randomTopP
  ]);
    
    let output = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log(`📤 [NVIDIA NIMs] Python stdout: ${data.toString().trim()}`);
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.log(`⚠️ [NVIDIA NIMs] Python stderr: ${data.toString().trim()}`);
    });
    
    pythonProcess.on('close', (code) => {
      console.log(`🏁 [NVIDIA NIMs] Python process completed with code ${code} for conversation ${conversationId}`);
      
      if (code === 0) {
        console.log(`✅ [NVIDIA NIMs] Successfully received response from NVIDIA API`);
        console.log(`📝 [NVIDIA NIMs] Raw output: ${output.trim()}`);
        
        // Parse the output to extract 3 suggestions
        let suggestions = [];
        
        // Try to extract suggestions from the output
        const lines = output.trim().split('\n').filter(line => line.trim());
        
        // Look for numbered suggestions (1., 2., 3.) or quoted suggestions
        for (const line of lines) {
          const trimmed = line.trim();
          // Look for numbered items or quoted text
          if (trimmed.match(/^\d+\.\s*["']?/) || trimmed.match(/^["']/)) {
            // Remove numbering and quotes
            let suggestion = trimmed.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, '');
            if (suggestion.length > 5 && suggestion.length < 100) {
              suggestions.push(suggestion);
            }
          }
        }
        
        // If we don't have enough suggestions, try to extract from the end of the output
        if (suggestions.length < 3) {
          const lastLines = lines.slice(-3);
          suggestions = lastLines.filter(line => {
            const trimmed = line.trim();
            return trimmed.length > 5 && trimmed.length < 100 && !trimmed.match(/^(Here are|Certainly|I'm here)/i);
          }).slice(0, 3);
        }
        
        // Ensure we have exactly 3 suggestions
        while (suggestions.length < 3) {
          suggestions.push('How can I help you today?');
        }
        
        console.log(`🎯 [NVIDIA NIMs] Final suggestions for conversation ${conversationId}:`, suggestions);
        
        // Cache the results
        quickMessageCache.set(cacheKey, {
          suggestions,
          timestamp: now
        });
        
        res.json({ suggestions });
      } else {
        console.error(`❌ [NVIDIA NIMs] Python process failed with code ${code}:`, errorOutput);
        // Fallback to default suggestions
        res.json({ 
          suggestions: [
            'How are you feeling today?',
            'I\'m here to listen and support you.',
            'Would you like to talk about what\'s on your mind?'
          ]
        });
      }
    });
    
    // Set timeout for the Python process
    setTimeout(() => {
      pythonProcess.kill();
      if (!res.headersSent) {
        res.json({ 
          suggestions: [
            'How are you feeling today?',
            'I\'m here to listen and support you.',
            'Would you like to talk about what\'s on your mind?'
          ]
        });
      }
    }, 10000); // 10 second timeout
    
  } catch (error) {
    console.error('Error generating quick messages:', error);
    res.status(500).json({ 
      error: 'Failed to generate quick messages',
      suggestions: [
        'How are you feeling today?',
        'I\'m here to listen and support you.',
        'Would you like to talk about what\'s on your mind?'
      ]
    });
  }
});

// User accounts API endpoints

// Record user login
app.post('/api/users/login', (req, res) => {
  const { username, accountType } = req.body;
  
  if (!username || !accountType) {
    return res.status(400).json({ error: 'Missing required fields: username and accountType' });
  }
  
  if (!['admin', 'user'].includes(accountType)) {
    return res.status(400).json({ error: 'Invalid account type. Must be admin or user' });
  }
  
  const userId = Date.now().toString();
  const currentTime = new Date().toISOString();
  
  // Check if user already exists
  db.get("SELECT * FROM user_accounts WHERE username = ?", [username], (err, existingUser) => {
    if (err) {
      console.error('Error checking existing user:', err);
      res.status(500).json({ error: 'Failed to check user' });
      return;
    }
    
    if (existingUser) {
      // Update existing user's last login and increment login count
      db.run(`
        UPDATE user_accounts 
        SET last_login = ?, login_count = login_count + 1, updated_at = ?
        WHERE username = ?
      `, [currentTime, currentTime, username], function(updateErr) {
        if (updateErr) {
          console.error('Error updating user login:', updateErr);
          res.status(500).json({ error: 'Failed to update user login' });
          return;
        }
        
        console.log(`✅ User login updated: ${username} (${accountType}) - Login #${existingUser.login_count + 1}`);
        res.json({ 
          id: existingUser.id,
          username: existingUser.username,
          accountType: existingUser.account_type,
          loginCount: existingUser.login_count + 1,
          lastLogin: currentTime,
          message: 'User login updated successfully'
        });
      });
    } else {
      // Create new user
      db.run(`
        INSERT INTO user_accounts 
        (id, username, account_type, first_login, last_login, login_count)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [userId, username, accountType, currentTime, currentTime, 1], function(insertErr) {
        if (insertErr) {
          console.error('Error creating user:', insertErr);
          res.status(500).json({ error: 'Failed to create user' });
          return;
        }
        
        console.log(`✅ New user created: ${username} (${accountType})`);
        res.json({ 
          id: userId,
          username: username,
          accountType: accountType,
          loginCount: 1,
          lastLogin: currentTime,
          message: 'User created successfully'
        });
      });
    }
  });
});

// Get user information
app.get('/api/users/:username', (req, res) => {
  const { username } = req.params;
  
  db.get("SELECT * FROM user_accounts WHERE username = ?", [username], (err, user) => {
    if (err) {
      console.error('Error fetching user:', err);
      res.status(500).json({ error: 'Failed to fetch user' });
      return;
    }
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json({
      id: user.id,
      username: user.username,
      accountType: user.account_type,
      firstLogin: user.first_login,
      lastLogin: user.last_login,
      loginCount: user.login_count,
      createdAt: user.created_at
    });
  });
});

// Get all users (for admin purposes)
app.get('/api/users', (req, res) => {
  db.all("SELECT * FROM user_accounts ORDER BY last_login DESC", (err, users) => {
    if (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Failed to fetch users' });
      return;
    }
    
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      accountType: user.account_type,
      firstLogin: user.first_login,
      lastLogin: user.last_login,
      loginCount: user.login_count,
      createdAt: user.created_at
    }));
    
    // console.log(`📊 Returning ${formattedUsers.length} users`);
    res.json(formattedUsers);
  });
});

// Search users by username (for chat contacts)
app.get('/api/users/search/:query', (req, res) => {
  const { query } = req.params;
  const { exclude } = req.query; // Optional: exclude current user from results
  
  if (!query || query.trim().length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters long' });
  }
  
  let sql = "SELECT username, account_type, last_login FROM user_accounts WHERE username LIKE ?";
  let params = [`%${query}%`];
  
  // Exclude current user if specified
  if (exclude) {
    sql += " AND username != ?";
    params.push(exclude);
  }
  
  sql += " ORDER BY last_login DESC LIMIT 10";
  
  db.all(sql, params, (err, users) => {
    if (err) {
      console.error('Error searching users:', err);
      res.status(500).json({ error: 'Failed to search users' });
      return;
    }
    
    const searchResults = users.map(user => ({
      username: user.username,
      accountType: user.account_type,
      lastLogin: user.last_login,
      isOnline: isUserOnline(user.last_login)
    }));
    
    console.log(`🔍 Found ${searchResults.length} users matching "${query}"`);
    res.json(searchResults);
  });
});

// Helper function to determine if user is online (last login within 5 minutes)
function isUserOnline(lastLogin) {
  if (!lastLogin) return false;
  const lastLoginTime = new Date(lastLogin).getTime();
  const now = Date.now();
  const fiveMinutesAgo = now - (5 * 60 * 1000);
  return lastLoginTime > fiveMinutesAgo;
}

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
      
      db.get("SELECT COUNT(*) as count FROM chat_conversations", (err, conversationsRow) => {
        if (err) return res.status(500).json({ error: 'Failed to get stats' });
        
        stats.chat_conversations = conversationsRow.count;
        
        db.get("SELECT COUNT(*) as count FROM chat_messages", (err, messagesRow) => {
          if (err) return res.status(500).json({ error: 'Failed to get stats' });
          
          stats.chat_messages = messagesRow.count;
          
          db.get("SELECT COUNT(*) as count FROM user_accounts", (err, usersRow) => {
            if (err) return res.status(500).json({ error: 'Failed to get stats' });
            
            stats.user_accounts = usersRow.count;
            res.json(stats);
          });
        });
      });
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
  console.log(`   GET  http://localhost:${PORT}/api/chat/conversations/:userId`);
  console.log(`   GET  http://localhost:${PORT}/api/chat/conversations/:conversationId/messages`);
  console.log(`   POST http://localhost:${PORT}/api/chat/conversations`);
  console.log(`   POST http://localhost:${PORT}/api/chat/messages`);
  console.log(`   PUT  http://localhost:${PORT}/api/chat/conversations/:conversationId/read`);
  console.log(`   PUT  http://localhost:${PORT}/api/chat/conversations/:conversationId`);
  console.log(`   POST http://localhost:${PORT}/api/users/login`);
  console.log(`   GET  http://localhost:${PORT}/api/users/:username`);
  console.log(`   GET  http://localhost:${PORT}/api/users`);
  console.log(`   GET  http://localhost:${PORT}/api/users/search/:query`);
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
