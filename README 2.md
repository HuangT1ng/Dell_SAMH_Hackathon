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
npm run start:all
```

This will start:
- **Reddit Scraper Backend** on http://localhost:3001  
- **Reddit Scraper Dashboard** on http://localhost:5174
- **SAMH Platform** on http://localhost:5173






### Unified Backend (Port 3001)
 🔗 Available endpoints:
    GET  http://localhost:3001/api/mental-health-posts
    POST http://localhost:3001/api/mental-health-posts
    POST http://localhost:3001/api/scrape
    GET  http://localhost:3001/api/mood-entries
    POST http://localhost:3001/api/mood-entries
    GET  http://localhost:3001/api/chat/conversations/:userId
    GET  http://localhost:3001/api/chat/conversations/:conversationId/messages
    POST http://localhost:3001/api/chat/conversations
    POST http://localhost:3001/api/chat/messages
    PUT  http://localhost:3001/api/chat/conversations/:conversationId/read
    PUT  http://localhost:3001/api/chat/conversations/:conversationId
    POST http://localhost:3001/api/users/login
    GET  http://localhost:3001/api/users/:username
    GET  http://localhost:3001/api/users
    GET  http://localhost:3001/api/users/search/:query
    GET  http://localhost:3001/api/health
    GET  http://localhost:3001/api/stats
## 🎯 Applications

### SAMH Platform
**Professional mental health platform with:**
- **Homepage**: Clean, professional landing page
- **Mood Bar**: Track daily mood and mental health journey
- **Gaming**: Gaming hub and wellness sessions
- **Chat**: Mental health chat support

### Reddit Scraper Dashboard
**Mental health data analysis tool with:**
- **Data Visualization**: View scraped mental health posts
- **Sentiment Analysis**: Positive/negative sentiment indicators
- **Platform Filtering**: Filter by Reddit, Facebook, X (Twitter)
- **Real-time Scraping**: Execute new scraping sessions
- **Search & Filter**: Find specific mental health discussions

## 🔧 Development

### Project Structure
```
Dell_SAMH_Hackathon/
├── web_app/                    # SAMH Platform (Main App)
├── reddit_scrapper_dashboard/  # Reddit Scraper Dashboard
├── unified_backend_server.js   # Centralized Database
├── scraper_server.js          # Scraper Backend
├── run_scraper.js             # Python Scraper Wrapper
└── package.json               # Root package with scripts
```

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