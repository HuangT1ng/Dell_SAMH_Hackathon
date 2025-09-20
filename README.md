# Dell SAMH Mental Health Platform

A comprehensive mental health platform consisting of two independent applications sharing a centralized database.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Unified Backend Server                      │
│                 (Port 3001)                                │
│   ┌─────────────────────┐  ┌─────────────────────────────┐  │
│   │ Mental Health Posts │  │     Mood Entries           │  │
│   │ (Scraper writes)    │  │  (SAMH Platform writes)    │  │
│   └─────────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
            ▲                              ▲
            │                              │
┌───────────▼──────────┐        ┌──────────▼──────────────┐
│ Reddit Scraper       │        │ SAMH Platform           │
│ Dashboard            │        │ (Main App)              │
│ (Port 5174)          │        │ (Port 5173)             │
│                      │        │                         │
│ • Scrapes Reddit     │        │ • Homepage              │
│ • Mental health data │        │ • Mood tracking         │
│ • Sentiment analysis │        │ • Gaming features       │
│ • Data visualization │        │ • Chat support          │
└──────────────────────┘        └─────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python 3 (for Reddit scraper)
- Chrome browser (for Selenium)

### Installation
```bash
# Install all dependencies
npm run install:all
```

### Start All Services
```bash
# Start everything at once
npm run start:all
```

This will start:
- **Shared Database Server** on http://localhost:3003
- **Reddit Scraper Backend** on http://localhost:3001  
- **Reddit Scraper Dashboard** on http://localhost:5174
- **SAMH Platform** on http://localhost:5173

### Individual Services

#### 1. Shared Database Server
```bash
npm run start:db
```
- **Port**: 3003
- **Purpose**: Centralized SQLite database for both applications
- **Data**: Mental health posts, mood entries, analytics

#### 2. SAMH Platform (Main App)
```bash
npm run start:samh-platform
```
- **Port**: 5173
- **Features**: Homepage, Mood tracking, Gaming, Chat
- **Database**: Reads/writes mood entries to shared database

#### 3. Reddit Scraper Dashboard
```bash
npm run start:scraper-dashboard
```
- **Port**: 5174
- **Features**: Reddit scraping, Mental health post analysis
- **Database**: Writes scraped data to shared database

#### 4. Reddit Scraper Backend
```bash
npm run start:scraper-backend
```
- **Port**: 3001
- **Purpose**: Handles Python Selenium scraper execution

## 📊 API Endpoints

### Shared Database Server (Port 3003)
- `GET /api/mental-health-posts` - Get all scraped mental health posts
- `POST /api/mental-health-posts` - Add new mental health post
- `GET /api/mood-entries` - Get all mood entries
- `POST /api/mood-entries` - Add new mood entry
- `POST /api/analytics` - Record analytics event
- `GET /api/stats` - Get database statistics
- `GET /api/health` - Health check

### Reddit Scraper Backend (Port 3001)
- `POST /api/scrape` - Execute Reddit scraping
- `GET /api/health` - Health check

## 🎯 Applications

### SAMH Platform
**Professional mental health platform with:**
- **Homepage**: Clean, professional landing page
- **Mood Bar**: Track daily mood and mental health journey
- **Gaming**: Gaming hub and wellness sessions
- **Chat**: Mental health chat support
- **Theme**: Custom blue (#4a6cf7) and neutral (#f1efef) colors

### Reddit Scraper Dashboard
**Mental health data analysis tool with:**
- **Data Visualization**: View scraped mental health posts
- **Sentiment Analysis**: Positive/negative sentiment indicators
- **Platform Filtering**: Filter by Reddit, Facebook, X (Twitter)
- **Real-time Scraping**: Execute new scraping sessions
- **Search & Filter**: Find specific mental health discussions

## 🗄️ Database Schema

### Mental Health Posts
```sql
CREATE TABLE mental_health_posts (
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
);
```

### Mood Entries
```sql
CREATE TABLE mood_entries (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  mood INTEGER NOT NULL,
  mood_label TEXT NOT NULL,
  triggers TEXT NOT NULL, -- JSON array
  activities TEXT NOT NULL, -- JSON array
  notes TEXT,
  timestamp INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Development

### Project Structure
```
Dell_SAMH_Hackathon/
├── web_app/                    # SAMH Platform (Main App)
├── reddit_scrapper_dashboard/  # Reddit Scraper Dashboard
├── shared_database_server.js   # Centralized Database
├── scraper_server.js          # Scraper Backend
├── run_scraper.js             # Python Scraper Wrapper
└── package.json               # Root package with scripts
```

### Data Flow
1. **Reddit Scraper** scrapes mental health posts → **Shared Database**
2. **SAMH Platform** tracks user mood entries → **Shared Database**
3. Both apps read from shared database for analytics and insights

## 🎨 Features

### SAMH Platform Features
- ✅ Professional homepage with custom branding
- ✅ Mood tracking with visual charts
- ✅ Gaming wellness features
- ✅ Mental health chat support
- ✅ Dark/light mode toggle
- ✅ Responsive design

### Reddit Scraper Features
- ✅ Selenium-based Reddit scraping
- ✅ Mental health content detection
- ✅ Sentiment analysis
- ✅ Multi-platform data aggregation
- ✅ Real-time data visualization
- ✅ Search and filtering capabilities

## 🔒 Security & Privacy
- All data stored locally in SQLite database
- No external data transmission except for scraping
- Mental health data handled with care
- CORS configured for local development only

## 📈 Analytics
The shared database tracks:
- Mental health post engagement metrics
- User mood patterns and trends
- Platform usage analytics
- Sentiment analysis over time