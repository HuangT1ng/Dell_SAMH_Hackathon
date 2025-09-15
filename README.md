# SAMH Platform - Frontend

A unified frontend platform combining mental health tracking and user management interfaces.

## 🌟 Features

### 🧠 MindFlow - Mental Health Tracking
- **Mood Journaling**: Track daily moods with emoji-based interface
- **Trigger & Activity Tracking**: Identify stress triggers and positive activities
- **Mood Analytics**: Visual charts showing mood trends over time
- **Entry History**: Search and filter through past journal entries
- **Dark Mode Support**: Toggle between light and dark themes

### 👥 Reddit Dashboard - User Management
- **User Profiles**: Manage users with different levels (L1-L4)
- **Search & Filter**: Find users by name or level
- **Verification System**: Verified user badges
- **Level-based Styling**: Color-coded user levels

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation & Running

1. **Navigate to the web_app directory:**
   ```bash
   cd web_app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Open http://localhost:5173 in your browser

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Base**: Vite + React + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks + LocalStorage

### Key Components
```
web_app/src/
├── App.tsx                 # Main application with navigation
├── components/
│   ├── Dashboard.tsx       # MindFlow dashboard
│   ├── AddEntry.tsx        # Mood entry form
│   ├── EntryHistory.tsx    # Journal history
│   ├── MoodChart.tsx       # Mood visualization
│   └── RedditDashboard.tsx # User management
```

## 🎨 Design Features

- **Unified Navigation**: Seamless switching between services
- **Dark Mode**: Consistent theming across all components
- **Responsive Design**: Works on desktop and mobile
- **Modern UI**: Glassmorphism effects and smooth animations
- **Accessibility**: Proper contrast and keyboard navigation

## 📱 Usage

1. **MindFlow Dashboard**: Track your daily mood and mental health
2. **Add Entry**: Create new journal entries with triggers and activities
3. **History**: Review past entries with search and filtering
4. **Reddit Dashboard**: Manage user profiles and levels

## 🛠️ Development

### Project Structure
```
web_app/
├── src/
│   ├── App.tsx                 # Main application
│   ├── components/             # React components
│   ├── index.css              # Global styles
│   └── main.tsx               # Entry point
├── package.json               # Dependencies
├── tailwind.config.js         # Tailwind configuration
├── vite.config.ts             # Vite configuration
└── tsconfig.json              # TypeScript configuration
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features
1. **Components**: Add new components in `src/components/`
2. **Styling**: Use Tailwind classes with dark mode support
3. **State**: Use React hooks for local state management
4. **Navigation**: Update the navigation array in `App.tsx`

## 🎨 Styling Guidelines

### Dark Mode Support
All components support dark mode through the `darkMode` prop:
```tsx
className={`base-classes ${
  darkMode 
    ? 'dark-mode-classes' 
    : 'light-mode-classes'
}`}
```

### Color Scheme
- **Primary**: Blue to Cyan gradients
- **Success**: Green tones
- **Warning**: Orange/Yellow tones
- **Error**: Red tones
- **Neutral**: Gray tones

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature-name`
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is part of the Dell SAMH Hackathon.

## 🆘 Support

For issues or questions:
1. Check the console for error messages
2. Ensure all dependencies are installed
3. Check browser developer tools for frontend issues

---

**Built with ❤️ for mental health awareness and support**