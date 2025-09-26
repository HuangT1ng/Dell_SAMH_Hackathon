import React, { useState } from "react";
import { X, Calendar, Menu, Plus, Sun, Sunset, Ghost, Smile, Frown, Meh, LucideIcon, User, LogOut } from "lucide-react";
import JournalEmo from '../Assets/JournalEmo.png';
import BackgroundHeaderJournal from '../Assets/BackgroundHeaderJournal.png';

interface MoodEntry {
  id?: string;
  date: string;
  entry_type?: string;
  timestamp?: number;
  
  // Mood entries (multi-entry)
  mood_score?: number;
  mood_feelings?: string[];
  
  // Symptoms
  symptoms_data?: { [key: string]: number };
  symptoms_notes?: string;
  
  // Sleep
  sleep_quality?: number;
  sleep_duration_hours?: number;
  sleep_duration_minutes?: number;
  
  // Other Factors
  stress_level?: string;
  work_level?: string;
  activity_level?: string;
  exercise_level?: string;
  
  // Custom Factors (personal growth)
  productivity?: number;
  motivation?: number;
  focus?: number;
  creativity?: number;
  empathy?: number;
  kindness?: number;
  positivity?: number;
  patience?: number;
  discipline?: number;
  emotional_awareness?: number;
  
  // Gratitude (multi-entry)
  gratitude_text?: string;
  
  // Personal Notes
  personal_notes?: string;
  
  // Legacy fields for backward compatibility
  mood?: number;
  moodLabel?: string;
  triggers?: string[];
  activities?: string[];
  notes?: string;
  aiSummary?: string;
  sleepTime?: string;
  symptoms?: string[];
  energy?: number;
  social?: number;
  gratitude?: string;
  reflection?: string;
}

interface JournalSetupProps {
  onSave: (entry: MoodEntry) => void;
  onNavigate: (view: string) => void;
  isFirstTime: boolean;
  username?: string;
  onPreferencesSaved?: (preferences: string[]) => void;
}

interface WeeklyMoodBarProps {
  entries: MoodEntry[];
  onSave: (entry: MoodEntry) => void;
  onNavigate: (view: string) => void;
  isFirstTime: boolean;
  username?: string;
  navigation: Array<{
    id: string;
    label: string;
    icon: any;
    description: string;
  }>;
  user?: any;
  darkMode: boolean;
}

// Modern clean font stack
const FONT_FAMILY = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// Color palette - clean whites and soft colors
const COLORS = {
  background: '#FFFFFF',
  surface: '#F8F9FA',
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  text: '#1F2937',
  textLight: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  mood: {
    1: '#EF4444', // Terrible - Red
    2: '#F97316', // Bad - Orange  
    3: '#F59E0B', // Okay - Yellow
    4: '#10B981', // Good - Green
    5: '#3B82F6'  // Excellent - Blue
  }
};

const MOOD_LABELS = ["Terrible", "Bad", "Okay", "Good", "Excellent"];
const MOOD_ICONS = [Frown, Frown, Meh, Smile, Smile];

// Helper functions
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const getCurrentDate = () => new Date().toISOString().split('T')[0];
const formatDate = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Get week days for calendar
const getWeekDays = () => {
  const today = new Date();
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + i);
    days.push({
      date: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
      number: date.getDate(),
      isToday: date.toDateString() === today.toDateString()
    });
  }
  return days;
};

// Mood icon component
const MoodIcon: React.FC<{ mood: number; size?: number }> = ({ mood, size = 24 }) => {
  const IconComponent = MOOD_ICONS[clamp(mood - 1, 0, 4)];
  const color = COLORS.mood[mood as keyof typeof COLORS.mood] || COLORS.textLight;
  
  return (
    <div className="flex items-center justify-center" style={{ color }}>
      <IconComponent size={size} />
    </div>
  );
};

// Entry type definitions
interface EntryType {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  category: 'mood' | 'text' | 'time' | 'activity' | 'symptom' | 'growth';
  multiEntry?: boolean;
  scale?: {
    min: number;
    max: number;
    gradient?: string[];
    colors?: string[];
    type?: 'stars' | 'numbers';
  };
  options?: string[];
  attributes?: string[];
}

// Comprehensive journal entry types
const ENTRY_TYPES: EntryType[] = [
  { 
    id: 'mood', 
    name: 'Mood', 
    description: '', 
    icon: Smile, 
    color: COLORS.primary, 
    category: 'mood',
    multiEntry: true,
    scale: { min: 1, max: 10, gradient: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'] }
  },
  { 
    id: 'symptoms', 
    name: 'Symptoms', 
    description: 'Track anxiety, irritability, mood swings, depression, dissociation, sense of dread', 
    icon: Ghost, 
    color: COLORS.warning, 
    category: 'symptom',
    scale: { min: 0, max: 4, colors: ['#10B981', '#84CC16', '#F59E0B', '#F97316', '#EF4444'] }
  },
  { 
    id: 'sleep', 
    name: 'Sleep', 
    description: 'Sleep quality (1-5 stars) and duration tracking', 
    icon: Sunset, 
    color: COLORS.secondary, 
    category: 'time',
    scale: { min: 1, max: 5, type: 'stars' }
  },
  { 
    id: 'other_factors', 
    name: 'Other Factors', 
    description: 'Stress, Work, Activity, Exercise levels', 
    icon: Plus, 
    color: COLORS.success, 
    category: 'activity',
    options: ['stress', 'work', 'activity', 'exercise']
  },
  { 
    id: 'custom_factors', 
    name: 'Personal Growth', 
    description: 'Productivity, Motivation, Focus, Creativity, Empathy, Kindness, Positivity, Patience, Discipline, Emotional Awareness', 
    icon: Sun, 
    color: COLORS.accent, 
    category: 'growth',
    scale: { min: 1, max: 5 },
    attributes: ['productivity', 'motivation', 'focus', 'creativity', 'empathy', 'kindness', 'positivity', 'patience', 'discipline', 'emotional_awareness']
  },
  { 
    id: 'gratitude', 
    name: 'Gratitude', 
    description: 'Multi-entry gratitude journaling', 
    icon: Smile, 
    color: COLORS.primary, 
    category: 'text',
    multiEntry: true
  },
  { 
    id: 'personal_notes', 
    name: 'Personal Notes', 
    description: 'Free-form journaling and daily reflections', 
    icon: Meh, 
    color: COLORS.textLight, 
    category: 'text'
  }
];

// Emotion words dictionary for mood tracking
const EMOTION_WORDS = [
  'Happy', 'Grateful', 'Confident', 'Optimistic', 'Excited', 'Loved', 'Hopeful',
  'Super', 'Great', 'Good', 'Meh', 'Bad', 'Sick', 'Awful', 'Bored', 'Frustrated',
  'Anxious', 'Stressed', 'Confused', 'Exhausted', 'Upset', 'Overwhelmed',
  'Scared', 'Angry', 'Lonely', 'Guilty', 'Sad', 'Disappointed', 'Worried'
];

// Symptoms list
const SYMPTOMS_LIST = [
  'Anxiety', 'Irritability', 'Mood swings', 'Depression', 'Dissociation', 'Sense of dread'
];

// Other factors options
const OTHER_FACTORS = {
  stress: { name: 'Stress', icons: ['😌', '😐', '😰'] },
  work: { name: 'Work', icons: ['💼', '📊', '🔥'] },
  activity: { name: 'Activity', icons: ['🚶', '🏃', '💪'] },
  exercise: { name: 'Exercise', icons: ['🧘', '🏋️', '🏃'] }
};

// Mood Input Component with 1-10 scale and emotion words
const MoodInput: React.FC<{
  onSave: (moodScore: number, feelings: string[]) => void;
  initialMood?: number;
  initialFeelings?: string[];
}> = ({ onSave, initialMood, initialFeelings = [] }) => {
  const [moodScore, setMoodScore] = useState(initialMood || 5);
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>(initialFeelings);

  const getMoodColor = (score: number) => {
    if (score <= 2) return '#EF4444'; // Red
    if (score <= 4) return '#F59E0B'; // Orange
    if (score <= 6) return '#F59E0B'; // Yellow
    if (score <= 8) return '#10B981'; // Green
    return '#3B82F6'; // Blue
  };

  const toggleFeeling = (feeling: string) => {
    setSelectedFeelings(prev => 
      prev.includes(feeling) 
        ? prev.filter(f => f !== feeling)
        : [...prev, feeling]
    );
  };

  return (
    <div className="space-y-6">
      {/* Mood Scale 1-10 */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.text }}>
          How are you feeling? (1-10)
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {[1,2,3,4,5,6,7,8,9,10].map(score => (
            <button
              key={score}
              onClick={() => setMoodScore(score)}
              className={`p-3 rounded-lg border-2 transition-all ${
                moodScore === score 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{ backgroundColor: moodScore === score ? getMoodColor(score) + '20' : 'white' }}
            >
              <div 
                className="text-2xl font-bold"
                style={{ color: getMoodColor(score) }}
              >
                {score}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Emotion Words */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.text }}>
          How are you feeling? (Select all that apply)
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {EMOTION_WORDS.map(feeling => (
            <button
              key={feeling}
              onClick={() => toggleFeeling(feeling)}
              className={`p-2 rounded-lg border transition-all ${
                selectedFeelings.includes(feeling)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {feeling}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onSave(moodScore, selectedFeelings)}
        className="w-full h-12 rounded-2xl font-semibold text-white transition-all"
        style={{ backgroundColor: COLORS.primary }}
      >
        Save Mood Entry
      </button>
    </div>
  );
};

// Symptoms Input Component
const SymptomsInput: React.FC<{
  onSave: (symptomsData: { [key: string]: number }, notes: string) => void;
  initialSymptoms?: { [key: string]: number };
  initialNotes?: string;
}> = ({ onSave, initialSymptoms = {}, initialNotes = '' }) => {
  const [symptomsData, setSymptomsData] = useState<{ [key: string]: number }>(initialSymptoms);
  const [notes, setNotes] = useState(initialNotes);

  const updateSymptom = (symptom: string, level: number) => {
    setSymptomsData(prev => ({ ...prev, [symptom]: level }));
  };

  const getColor = (level: number) => {
    const colors = ['#10B981', '#84CC16', '#F59E0B', '#F97316', '#EF4444'];
    return colors[level] || '#6B7280';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.text }}>
          Rate your symptoms (0-4)
        </h3>
        <div className="space-y-4">
          {SYMPTOMS_LIST.map(symptom => (
            <div key={symptom} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium" style={{ color: COLORS.text }}>{symptom}</span>
                <span className="text-sm" style={{ color: COLORS.textLight }}>
                  {symptomsData[symptom] === 0 ? 'None' :
                   symptomsData[symptom] === 1 ? 'Mild' :
                   symptomsData[symptom] === 2 ? 'Moderate' :
                   symptomsData[symptom] === 3 ? 'Severe' : 'Very Severe'}
                </span>
              </div>
              <div className="flex space-x-2">
                {[0,1,2,3,4].map(level => (
                  <button
                    key={level}
                    onClick={() => updateSymptom(symptom, level)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      symptomsData[symptom] === level
                        ? 'border-gray-800'
                        : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: getColor(level) }}
                  >
                    <span className="text-xs font-bold text-white">{level}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.text }}>
          Additional Notes (Optional)
        </h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional context about your symptoms..."
          className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none"
          rows={3}
        />
      </div>

      <button
        onClick={() => onSave(symptomsData, notes)}
        className="w-full h-12 rounded-2xl font-semibold text-white transition-all"
        style={{ backgroundColor: COLORS.warning }}
      >
        Save Symptoms
      </button>
    </div>
  );
};

// Journal Setup Component for First-Time Users
const JournalSetup: React.FC<JournalSetupProps> = ({ onSave, onNavigate, username, onPreferencesSaved }) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['mood']); // Default to mood
  const [currentStep, setCurrentStep] = useState(0);

  const toggleEntryType = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleComplete = async () => {
    // Save journal preferences to backend
    if (username) {
      try {
        const API_BASE_URL = window.location.hostname === 'localhost' 
          ? 'http://localhost:3001' 
          : 'https://backend-ntu.apps.innovate.sg-cna.com';
        
        const response = await fetch(`${API_BASE_URL}/api/users/${username}/journal-preferences`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferences: selectedTypes })
        });
        
        if (response.ok) {
          console.log('✅ Journal preferences saved successfully');
          // Notify parent component about the saved preferences
          if (onPreferencesSaved) {
            onPreferencesSaved(selectedTypes);
          }
        } else {
          const errorText = await response.text();
          console.warn('⚠️ Failed to save journal preferences:', response.status, errorText);
        }
      } catch (error) {
        console.warn('⚠️ Error saving journal preferences:', error);
      }
    }
    
    // Create a default entry with selected types
    const today = getCurrentDate();
    const entry: MoodEntry = {
      date: today,
      mood: 3, // Default to "Okay"
      moodLabel: "Okay",
      triggers: [],
      activities: [],
      notes: `Journal setup completed. Selected entry types: ${selectedTypes.join(', ')}`,
      aiSummary: "Welcome to your personalized journal!"
    };
    onSave(entry);
  };

  if (currentStep === 0) {
    return (
      <div className="fixed inset-0 bg-white" style={{ fontFamily: FONT_FAMILY }}>
        <div className="h-screen flex flex-col px-6 pt-4 pb-6 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <button
              onClick={() => onNavigate("home")}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X size={24} />
            </button>
            <h1 className="text-2xl font-bold" style={{ color: COLORS.text }}>
              Set Up Your Journal
            </h1>
            <div className="w-10" />
          </div>

          {/* Welcome Message */}
          <div className="text-center mb-6 flex-shrink-0">
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
              <img 
                src={JournalEmo} 
                alt="Journal Character" 
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>
              Welcome! 👋
            </h2>
            <p className="text-base" style={{ color: COLORS.textLight }}>
              Choose what you'd like to track in your daily journal
            </p>
          </div>

          {/* Entry Type Selection - Scrollable */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-6">
            {ENTRY_TYPES.map((type) => {
              const IconComponent = type.icon;
              const isSelected = selectedTypes.includes(type.id);
              
              return (
                <button
                  key={type.id}
                  onClick={() => toggleEntryType(type.id)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: isSelected ? type.color : COLORS.surface,
                        color: isSelected ? 'white' : type.color
                      }}
                    >
                      <IconComponent size={24} />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-lg" style={{ color: COLORS.text }}>
                        {type.name}
                      </h3>
                      <p className="text-sm" style={{ color: COLORS.textLight }}>
                        {type.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Continue Button - Fixed at bottom */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setCurrentStep(1)}
              disabled={selectedTypes.length === 0}
              className="w-full h-14 rounded-2xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: selectedTypes.length > 0 ? COLORS.primary : COLORS.border,
                color: 'white'
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Confirmation
  return (
    <div className="fixed inset-0 bg-white" style={{ fontFamily: FONT_FAMILY }}>
      <div className="h-screen flex flex-col px-6 pt-4 pb-6">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
            <img 
              src={JournalEmo} 
              alt="Journal Character" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <h2 className="text-3xl font-bold mb-4" style={{ color: COLORS.text }}>
            Perfect! 🎉
          </h2>
          
          <p className="text-lg mb-8" style={{ color: COLORS.textLight }}>
            You've selected {selectedTypes.length} journal entry type{selectedTypes.length !== 1 ? 's' : ''}:
          </p>
          
          <div className="space-y-2 mb-8">
            {selectedTypes.map(typeId => {
              const type = ENTRY_TYPES.find(t => t.id === typeId);
              if (!type) return null;
              const IconComponent = type.icon;
              
              return (
                <div key={typeId} className="flex items-center space-x-3">
                  <IconComponent size={20} color={type.color} />
                  <span style={{ color: COLORS.text }}>{type.name}</span>
                </div>
              );
            })}
          </div>
          
          <p className="text-base mb-8" style={{ color: COLORS.textLight }}>
            You can always change these settings later in your profile.
          </p>
        </div>
        
        <button
          onClick={handleComplete}
          className="w-full h-14 rounded-2xl font-semibold text-lg"
          style={{ backgroundColor: COLORS.success, color: 'white' }}
        >
          Start Journaling
        </button>
      </div>
    </div>
  );
};

// Main Weekly Mood Bar Component
const WeeklyMoodBar: React.FC<WeeklyMoodBarProps> = ({ entries, onSave, onNavigate, isFirstTime, username, navigation, user, darkMode }) => {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInType, setCheckInType] = useState<'morning' | 'evening' | null>(null);
  // Show all journal types by default - no setup needed
  const [userPreferences] = useState<string[]>(['mood', 'symptoms', 'sleep', 'personal_notes']);
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputType, setInputType] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showComprehensiveCheckIn, setShowComprehensiveCheckIn] = useState(false);
  const [checkInStep, setCheckInStep] = useState(0);
  const [checkInData, setCheckInData] = useState<{[key: string]: any}>({});
  const [selectedEmojiValue, setSelectedEmojiValue] = useState<number | null>(null);
  const [checkInTextValue, setCheckInTextValue] = useState('');
  const [showNavMenu, setShowNavMenu] = useState(false);
  const weekDays = getWeekDays();
  const today = getCurrentDate();
  
  // All journal types are available by default - no need to load preferences

  // Get today's entry
  const todayEntry = entries.find(entry => entry.date === today);
  
  // Get mood for a specific date
  const getMoodForDate = (date: string) => {
    const entry = entries.find(e => e.date === date);
    return entry ? entry.mood : null;
  };

  // Handle check-in button click
  const handleCheckIn = (type: 'morning' | 'evening') => {
    setCheckInType(type);
    setCheckInStep(0);
    setCheckInData({});
    setSelectedEmojiValue(null);
    setCheckInTextValue('');
    setShowComprehensiveCheckIn(true);
  };

  // Handle mood entry save
  const handleMoodSave = (mood: number) => {
    const entry: MoodEntry = {
      date: today,
      mood,
      moodLabel: MOOD_LABELS[clamp(mood - 1, 0, 4)],
      triggers: todayEntry?.triggers || [],
      activities: todayEntry?.activities || [],
      notes: todayEntry?.notes || '',
      aiSummary: `Mood: ${MOOD_LABELS[clamp(mood - 1, 0, 4)]} (${mood}/5)`,
      sleepTime: todayEntry?.sleepTime,
      symptoms: todayEntry?.symptoms || [],
      energy: todayEntry?.energy,
      social: todayEntry?.social
    };
    onSave(entry);
    setShowCheckIn(false);
    setCheckInType(null);
  };

  // Handle card click to open input modal
  const handleCardClick = (typeId: string) => {
    setInputType(typeId);
    
    // Pre-fill with existing value if available
    let existingValue = '';
    if (todayEntry) {
      switch (typeId) {
        case 'mood':
          existingValue = todayEntry.mood ? todayEntry.mood.toString() : '';
          break;
        case 'energy':
          existingValue = todayEntry.energy ? todayEntry.energy.toString() : '';
          break;
        case 'sleep':
          existingValue = todayEntry.sleepTime || '';
          break;
        case 'activities':
          existingValue = todayEntry.activities?.[0] || '';
          break;
        case 'symptoms':
          existingValue = todayEntry.symptoms?.[0] || '';
          break;
        case 'gratitude':
          existingValue = todayEntry.gratitude || '';
          break;
        case 'reflection':
          existingValue = todayEntry.reflection || '';
          break;
      }
    }
    
    setInputValue(existingValue);
    setShowInputModal(true);
  };

  // Handle input modal save
  const handleInputSave = () => {
    if (!inputType || !inputValue.trim()) return;

    const entry: MoodEntry = {
      date: today,
      mood: todayEntry?.mood || 3,
      moodLabel: todayEntry?.moodLabel || "Okay",
      triggers: todayEntry?.triggers || [],
      activities: todayEntry?.activities || [],
      notes: todayEntry?.notes || '',
      aiSummary: todayEntry?.aiSummary || '',
      sleepTime: todayEntry?.sleepTime,
      symptoms: todayEntry?.symptoms || [],
      energy: todayEntry?.energy,
      social: todayEntry?.social,
      gratitude: todayEntry?.gratitude,
      reflection: todayEntry?.reflection
    };

    // Update the entry based on input type
    switch (inputType) {
      case 'mood':
        entry.mood = parseInt(inputValue);
        const moodLabels = ['', 'Very Sad', 'Sad', 'Okay', 'Happy', 'Very Happy'];
        entry.moodLabel = moodLabels[parseInt(inputValue)] || 'Okay';
        entry.aiSummary = `Mood: ${entry.moodLabel}`;
        break;
      case 'energy':
        entry.energy = parseInt(inputValue);
        entry.aiSummary = `Energy: ${inputValue}/5`;
        break;
      case 'sleep':
        entry.sleepTime = inputValue;
        entry.aiSummary = `Sleep: ${inputValue}`;
        break;
      case 'activities':
        entry.activities = [inputValue];
        entry.aiSummary = `Activity: ${inputValue}`;
        break;
      case 'symptoms':
        entry.symptoms = [inputValue];
        entry.aiSummary = `Symptom: ${inputValue}`;
        break;
      case 'gratitude':
        entry.gratitude = inputValue;
        entry.aiSummary = `Gratitude: ${inputValue}`;
        break;
      case 'reflection':
        entry.reflection = inputValue;
        entry.aiSummary = `Reflection: ${inputValue}`;
        break;
    }

    onSave(entry);
    setShowInputModal(false);
    setInputType(null);
    setInputValue('');
  };

  // Render entry type card
  const renderEntryTypeCard = (typeId: string) => {
    const type = ENTRY_TYPES.find(t => t.id === typeId);
    if (!type) return null;

    const IconComponent = type.icon;
    let displayValue = "";
    let hasValue = false;

    // Get value based on entry type
    if (todayEntry) {
      switch (typeId) {
        case 'mood':
          displayValue = todayEntry.moodLabel || '';
          hasValue = !!todayEntry.moodLabel;
          break;
        case 'energy':
          displayValue = todayEntry.energy ? `${todayEntry.energy}/5` : "";
          hasValue = !!todayEntry.energy;
          break;
        case 'sleep':
          displayValue = todayEntry.sleepTime || "";
          hasValue = !!todayEntry.sleepTime;
          break;
        case 'activities':
          displayValue = todayEntry.activities?.length ? `${todayEntry.activities.length} activities` : "";
          hasValue = (todayEntry.activities?.length || 0) > 0;
          break;
        case 'symptoms':
          displayValue = todayEntry.symptoms?.length ? `${todayEntry.symptoms.length} symptoms` : "";
          hasValue = (todayEntry.symptoms?.length || 0) > 0;
          break;
        case 'gratitude':
          displayValue = todayEntry.gratitude ? "Added" : "";
          hasValue = !!todayEntry.gratitude;
          break;
        case 'reflection':
          displayValue = todayEntry.reflection ? "Added" : "";
          hasValue = !!todayEntry.reflection;
          break;
      }
    }

    return (
      <div key={typeId} className="px-2 mb-4">
        <div 
          className="p-4 rounded-2xl border-2 border-gray-200 flex items-center space-x-4 cursor-pointer hover:border-blue-500 transition-all"
          onClick={() => handleCardClick(typeId)}
        >
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ 
              backgroundColor: hasValue ? type.color : COLORS.surface,
              color: hasValue ? 'white' : type.color
            }}
          >
            <IconComponent size={24} />
          </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1" style={{ color: COLORS.text }}>
                  {type.name}
                </h3>
                {displayValue && (
                  <p className="text-sm" style={{ color: COLORS.textLight }}>
                    {displayValue}
                  </p>
                )}
              </div>
          <button 
            className="p-2 rounded-lg hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick(typeId);
            }}
          >
            <Menu size={16} style={{ color: COLORS.textLight }} />
          </button>
        </div>
      </div>
    );
  };

  // All journal types are available by default

  // Handle comprehensive check-in step completion
  const handleCheckInStepComplete = (typeId: string, value: any) => {
    console.log(`📝 Check-in step ${checkInStep + 1}: ${typeId} = ${value}`);
    
    const newData = {
      ...checkInData,
      [typeId]: value
    };
    console.log('📊 Updated check-in data:', newData);
    
    setCheckInData(newData);
    
    // Move to next step
    const nextStep = checkInStep + 1;
    if (nextStep < userPreferences.length) {
      console.log(`➡️ Moving to step ${nextStep + 1}`);
      setCheckInStep(nextStep);
      setSelectedEmojiValue(null); // Reset emoji selection for next step
      setCheckInTextValue(''); // Reset text input for next step
    } else {
      // All steps completed, save the entry with the updated data
      console.log('✅ All steps completed, saving entry');
      handleCheckInComplete(newData);
    }
  };

  // Handle comprehensive check-in completion
  const handleCheckInComplete = (finalData = checkInData) => {
    console.log('💾 Final check-in data to save:', finalData);
    console.log('🔍 Reflection specifically:', finalData.reflection);
    
    const entry: MoodEntry = {
      id: Date.now().toString(),
      date: today,
      mood: finalData.mood || todayEntry?.mood || 3,
      moodLabel: finalData.mood ? 
        ['', 'Very Sad', 'Sad', 'Okay', 'Happy', 'Very Happy'][finalData.mood] || 'Okay' :
        todayEntry?.moodLabel || "Okay",
      triggers: todayEntry?.triggers || [],
      activities: finalData.activities ? [finalData.activities] : (todayEntry?.activities || []),
      notes: todayEntry?.notes || '',
      aiSummary: `Check-in: ${checkInType} - ${Object.keys(finalData).map(key => `${key}: ${finalData[key]}`).join(', ')}`,
      sleepTime: finalData.sleep || todayEntry?.sleepTime,
      symptoms: finalData.symptoms ? [finalData.symptoms] : (todayEntry?.symptoms || []),
      energy: finalData.energy || todayEntry?.energy,
      social: todayEntry?.social,
      gratitude: finalData.gratitude || todayEntry?.gratitude,
      reflection: finalData.reflection || todayEntry?.reflection,
      timestamp: Date.now()
    };

    console.log('💾 Saving entry:', entry);
    console.log('🔍 Reflection data check:', {
      'finalData.reflection': finalData.reflection,
      'todayEntry?.reflection': todayEntry?.reflection,
      'final reflection': entry.reflection
    });
    console.log('🔍 Complete finalData at save time:', finalData);
    console.log('📤 Full entry being sent to backend:', JSON.stringify(entry, null, 2));
    onSave(entry);
    setShowComprehensiveCheckIn(false);
    setCheckInStep(0);
    setCheckInData({});
    setCheckInType(null);
  };

  // Handle check-in skip
  const handleCheckInSkip = () => {
    const nextStep = checkInStep + 1;
    if (nextStep < userPreferences.length) {
      setCheckInStep(nextStep);
    } else {
      handleCheckInComplete();
    }
  };

  // All journal types are available by default - no setup needed

  // Debug log
  console.log('🔍 WeeklyMoodBar rendering with userPreferences:', userPreferences);

  // Show comprehensive check-in modal
  if (showComprehensiveCheckIn && checkInType && userPreferences.length > 0) {
    const currentTypeId = userPreferences[checkInStep];
    const currentType = ENTRY_TYPES.find(t => t.id === currentTypeId);
    
    if (!currentType) return null;

    const getEmojiOptions = () => {
      if (currentTypeId === 'mood') {
        return [
          { value: 1, emoji: '😢', label: 'Very Sad' },
          { value: 2, emoji: '😔', label: 'Sad' },
          { value: 3, emoji: '😐', label: 'Okay' },
          { value: 4, emoji: '😊', label: 'Happy' },
          { value: 5, emoji: '😄', label: 'Very Happy' }
        ];
      } else if (currentTypeId === 'energy') {
        return [
          { value: 1, emoji: '🪫', label: 'Very Low' },
          { value: 2, emoji: '🔋', label: 'Low' },
          { value: 3, emoji: '🔋', label: 'Medium' },
          { value: 4, emoji: '🔋', label: 'High' },
          { value: 5, emoji: '🔋', label: 'Very High' }
        ];
      }
      return [];
    };

    const getInputPlaceholder = () => {
      switch (currentTypeId) {
        case 'sleep': return 'Enter sleep duration (e.g., 8 hours)';
        case 'activities': return 'Enter an activity you did today';
        case 'symptoms': return 'Enter any symptoms you experienced';
        case 'gratitude': return 'What are you grateful for today?';
        case 'reflection': return 'How are you feeling? Any thoughts?';
        default: return 'Enter your response...';
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md" style={{ fontFamily: FONT_FAMILY }}>
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              {checkInType === 'morning' ? (
                <Sun size={32} style={{ color: '#f59e0b' }} />
              ) : (
                <Sunset size={32} style={{ color: '#8b5cf6' }} />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>
              {checkInType === 'morning' ? 'Morning' : 'Evening'} Check-in
            </h2>
            <p className="text-base" style={{ color: COLORS.textLight }}>
              Step {checkInStep + 1} of {userPreferences.length}
            </p>
          </div>

          {/* Current Step */}
          <div className="text-center mb-6">
            <div 
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: currentType.color }}
            >
              <currentType.icon size={32} color="white" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.text }}>
              {currentType.name}
            </h3>
            <p className="text-base" style={{ color: COLORS.textLight }}>
              {currentType.description}
            </p>
          </div>

          {/* Input Section */}
          <div className="mb-6">
            {(currentTypeId === 'mood' || currentTypeId === 'energy') ? (
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-3">
                  {getEmojiOptions().map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        console.log(`🎯 Selected ${currentTypeId}: ${option.value}`);
                        setSelectedEmojiValue(option.value);
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-center ${
                        selectedEmojiValue === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl">{option.emoji}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  value={checkInTextValue}
                  onChange={(e) => setCheckInTextValue(e.target.value)}
                  placeholder={getInputPlaceholder()}
                  className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg"
                  style={{ fontFamily: FONT_FAMILY }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && checkInTextValue.trim()) {
                      console.log(`📝 Text input for ${currentTypeId}:`, checkInTextValue);
                      handleCheckInStepComplete(currentTypeId, checkInTextValue);
                      setCheckInTextValue('');
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (checkInTextValue.trim()) {
                      console.log(`📝 Button click for ${currentTypeId}:`, checkInTextValue);
                      handleCheckInStepComplete(currentTypeId, checkInTextValue);
                      setCheckInTextValue('');
                    }
                  }}
                  className="w-full h-12 rounded-2xl font-semibold transition-all"
                  style={{ 
                    backgroundColor: currentType.color,
                    color: 'white'
                  }}
                >
                  Continue
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex space-x-4">
            <button
              onClick={() => setShowComprehensiveCheckIn(false)}
              className="flex-1 h-12 rounded-2xl border-2 border-gray-300 font-semibold"
              style={{ color: COLORS.textLight }}
            >
              Cancel
            </button>
            {(currentTypeId === 'mood' || currentTypeId === 'energy') ? (
              <button
                onClick={() => {
                  if (selectedEmojiValue !== null) {
                    handleCheckInStepComplete(currentTypeId, selectedEmojiValue);
                    setSelectedEmojiValue(null);
                  }
                }}
                disabled={selectedEmojiValue === null}
                className="flex-1 h-12 rounded-2xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: selectedEmojiValue !== null ? currentType.color : COLORS.border,
                  color: 'white'
                }}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleCheckInSkip}
                className="flex-1 h-12 rounded-2xl border-2 border-gray-300 font-semibold"
                style={{ color: COLORS.textLight }}
              >
                Skip
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show check-in modal
  if (showCheckIn && checkInType) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md" style={{ fontFamily: FONT_FAMILY }}>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>
              {checkInType === 'morning' ? 'Morning Check-in' : 'Evening Check-in'}
            </h2>
            <p className="text-base" style={{ color: COLORS.textLight }}>
              How are you feeling right now?
            </p>
          </div>
          
          <div className="space-y-4 mb-8">
            {MOOD_LABELS.map((_, index) => {
              const mood = index + 1;
              const IconComponent = MOOD_ICONS[index];
              const color = COLORS.mood[mood as keyof typeof COLORS.mood];
              
              return (
                <button
                  key={mood}
                  onClick={() => handleMoodSave(mood)}
                  className="w-full p-4 rounded-2xl border-2 border-gray-200 hover:border-blue-500 transition-all flex items-center justify-center"
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: color, color: 'white' }}
                  >
                    <IconComponent size={24} />
                  </div>
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setShowCheckIn(false)}
            className="w-full h-12 rounded-2xl border-2 border-gray-300 font-semibold"
            style={{ color: COLORS.textLight }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Show input modal
  if (showInputModal && inputType) {
    const type = ENTRY_TYPES.find(t => t.id === inputType);
    if (!type) return null;

    const getInputPlaceholder = () => {
      switch (inputType) {
        case 'energy': return 'Enter energy level (1-5)';
        case 'sleep': return 'Enter sleep duration (e.g., 8 hours)';
        case 'activities': return 'Enter an activity you did today';
        case 'symptoms': return 'Enter any symptoms you experienced';
        case 'gratitude': return 'What are you grateful for today?';
        case 'reflection': return 'How are you feeling? Any thoughts?';
        default: return 'Enter your response...';
      }
    };

    const getInputType = () => {
      if (inputType === 'energy' || inputType === 'mood') {
        return 'emoji';
      }
      return 'text';
    };

    const getEmojiOptions = () => {
      if (inputType === 'mood') {
        return [
          { value: 1, emoji: '😢', label: 'Very Sad' },
          { value: 2, emoji: '😔', label: 'Sad' },
          { value: 3, emoji: '😐', label: 'Okay' },
          { value: 4, emoji: '😊', label: 'Happy' },
          { value: 5, emoji: '😄', label: 'Very Happy' }
        ];
      } else if (inputType === 'energy') {
        return [
          { value: 1, emoji: '🪫', label: 'Very Low' },
          { value: 2, emoji: '🔋', label: 'Low' },
          { value: 3, emoji: '🔋', label: 'Medium' },
          { value: 4, emoji: '🔋', label: 'High' },
          { value: 5, emoji: '🔋', label: 'Very High' }
        ];
      }
      return [];
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md" style={{ fontFamily: FONT_FAMILY }}>
          <div className="text-center mb-6">
            <div 
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: type.color }}
            >
              <type.icon size={32} color="white" />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>
              {inputValue ? 'Edit' : 'Add'} {type.name}
            </h2>
            <p className="text-base" style={{ color: COLORS.textLight }}>
              {type.description}
            </p>
          </div>
          
          <div className="mb-6">
            {getInputType() === 'emoji' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-3">
                  {getEmojiOptions().map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setInputValue(option.value.toString())}
                      className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-center ${
                        inputValue === option.value.toString()
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl">{option.emoji}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={getInputPlaceholder()}
                className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg"
                style={{ fontFamily: FONT_FAMILY }}
                autoFocus
              />
            )}
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => setShowInputModal(false)}
              className="flex-1 h-12 rounded-2xl border-2 border-gray-300 font-semibold"
              style={{ color: COLORS.textLight }}
            >
              Cancel
            </button>
            <button
              onClick={handleInputSave}
              disabled={!inputValue}
              className="flex-1 h-12 rounded-2xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: inputValue ? type.color : COLORS.border,
                color: 'white'
              }}
            >
              {inputValue ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: FONT_FAMILY }}>
      {/* Header with Background */}
      <div 
        className="relative"
        style={{
          backgroundImage: `url(${BackgroundHeaderJournal})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="px-6 py-4">
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center space-x-2">
              <Calendar size={20} style={{ color: 'white' }} />
              <span className="font-semibold" style={{ color: 'white' }}>
                Today, {formatDate(today)}
              </span>
            </div>
            
            <button 
              onClick={() => setShowNavMenu(true)}
              className="p-2 rounded-lg transition-all duration-300 hover:bg-white hover:bg-opacity-20"
              title="Show Navigation"
            >
              <Menu className="w-4 h-4" style={{ color: 'white' }} />
            </button>
          </div>
        </div>
        
        {/* Weekdays Section - Now part of the background */}
        <div className="px-2 sm:px-4 md:px-6 pb-4">
          <div className="flex justify-between gap-1 sm:gap-2">
            {weekDays.map((day) => {
              const mood = getMoodForDate(day.date);
              const isToday = day.isToday;
              const isFuture = new Date(day.date) > new Date();
              
              return (
                <div key={day.date} className="flex flex-col items-center flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-medium mb-1 sm:mb-2" style={{ color: 'white' }}>
                    {day.day}
                  </div>
                  <div 
                    className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center border-2 ${
                      isToday ? 'border-blue-500 bg-blue-50' : 'border-white border-opacity-30'
                    }`}
                  >
                    <div className="relative flex flex-col items-center justify-between h-full py-1">
                      <div className="flex-1 flex items-center justify-center">
                        {mood && (
                          <MoodIcon mood={mood} size={16} />
                        )}
                      </div>
                      {!isFuture && (
                        <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
                          {day.number}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Slide-out Navigation - Same as main app */}
      {showNavMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
            onClick={() => setShowNavMenu(false)}
          />
          
          {/* Slide-out Menu */}
          <div className={`fixed top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out ${
            showNavMenu ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className={`h-full ${
              darkMode 
                ? 'bg-slate-800 border-l border-slate-700' 
                : 'bg-white border-l border-gray-200'
            } shadow-2xl`}>
              {/* Menu Header */}
              <div className={`p-6 border-b ${
                darkMode ? 'border-slate-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">.AI</span>
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        KAI
                      </h2>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-slate-500'
                      }`}>
                        Navigation
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNavMenu(false)}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      darkMode 
                        ? 'hover:bg-slate-700 text-gray-400' 
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="p-4">
                <div className="space-y-2">
                  {navigation.map(({ id, label, icon: Icon, description }) => (
                    <button
                      key={id}
                      onClick={() => {
                        onNavigate(id);
                        setShowNavMenu(false);
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                        id === 'mood'
                          ? darkMode
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-blue-500 text-white shadow-lg'
                          : darkMode
                            ? 'hover:bg-slate-700 text-gray-300'
                            : 'hover:bg-gray-100 text-slate-700'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <div className="flex-1 text-left">
                        <div className="font-semibold">{label}</div>
                        <div className={`text-sm ${
                          id === 'mood'
                            ? 'text-white/80'
                            : darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </nav>

              {/* User Info */}
              <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${
                darkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    darkMode ? 'bg-slate-600' : 'bg-gray-200'
                  }`}>
                    <User className={`w-5 h-5 ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {user?.username}
                    </div>
                    <div className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-slate-500'
                    }`}>
                      {user?.accountType}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // Handle logout - you might want to pass this as a prop
                      console.log('Logout clicked');
                    }}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      darkMode 
                        ? 'hover:bg-slate-700 text-red-400' 
                        : 'hover:bg-gray-100 text-red-600'
                    }`}
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="px-2 pt-6 pb-6">
        {/* Welcome Message and Character */}
        <div className="mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
            <img 
              src={JournalEmo} 
              alt="Journal Character" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1" style={{ color: COLORS.text }}>
              👋 Welcome!
            </h2>
            <p className="text-base" style={{ color: COLORS.textLight }}>
              Tap below to make your first health entry and start <span className="font-semibold text-green-600">powering up your insights!</span>
            </p>
          </div>
        </div>
      </div>

      {/* Check-in Buttons */}
      <div className="px-2 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleCheckIn('morning')}
            className="p-4 rounded-2xl border-2 border-gray-200 hover:border-blue-500 transition-all flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <Sun size={24} style={{ color: COLORS.accent }} />
              <div className="text-left">
                <h3 className="font-semibold" style={{ color: COLORS.text }}>
                  Morning check-in
                </h3>
              </div>
            </div>
            <div className="text-gray-400">
              <span className="text-2xl">›</span>
            </div>
          </button>
          
          <button
            onClick={() => handleCheckIn('evening')}
            className="p-4 rounded-2xl border-2 border-gray-200 hover:border-blue-500 transition-all flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <Sunset size={24} style={{ color: COLORS.secondary }} />
              <div className="text-left">
                <h3 className="font-semibold" style={{ color: COLORS.text }}>
                  Evening check-in
                </h3>
              </div>
            </div>
            <div className="text-gray-400">
              <span className="text-2xl">›</span>
            </div>
          </button>
        </div>
      </div>

      {/* Dynamic Entry Type Sections */}
      <div className="space-y-4">
        {userPreferences.length > 0 ? (
          userPreferences.map(typeId => renderEntryTypeCard(typeId))
        ) : (
          <div className="px-2 mb-4">
            <div className="p-4 rounded-2xl border-2 border-gray-200 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Smile size={24} style={{ color: COLORS.textLight }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1" style={{ color: COLORS.text }}>
                  Mood
                </h3>
                {todayEntry?.moodLabel && (
                  <p className="text-sm" style={{ color: COLORS.textLight }}>
                    {todayEntry.moodLabel}
                  </p>
                )}
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Menu size={16} style={{ color: COLORS.textLight }} />
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

// Main export component
const MoodBar: React.FC<WeeklyMoodBarProps> = (props) => {
  return <WeeklyMoodBar {...props} />;
};

export default MoodBar;
