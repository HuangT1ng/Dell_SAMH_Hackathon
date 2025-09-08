import React, { useState } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';

interface AddEntryProps {
  onSave: (entry: {
    date: string;
    mood: number;
    moodLabel: string;
    triggers: string[];
    activities: string[];
    notes: string;
  }) => void;
  onCancel: () => void;
}

const AddEntry: React.FC<AddEntryProps> = ({ onSave, onCancel }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState(3);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [newTrigger, setNewTrigger] = useState('');
  const [newActivity, setNewActivity] = useState('');

  const moodOptions = [
    { value: 1, label: 'Very Bad', emoji: '😢', color: 'bg-red-100 text-red-700 border-red-200' },
    { value: 2, label: 'Bad', emoji: '😟', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    { value: 3, label: 'Okay', emoji: '😐', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { value: 4, label: 'Good', emoji: '🙂', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 5, label: 'Excellent', emoji: '😊', color: 'bg-green-100 text-green-700 border-green-200' },
  ];

  const commonTriggers = ['Work stress', 'Lack of sleep', 'Social situations', 'Financial worries', 'Health concerns', 'Relationship issues'];
  const commonActivities = ['Exercise', 'Meditation', 'Reading', 'Socializing', 'Work', 'Relaxation', 'Hobbies', 'Outdoor time'];

  const addTrigger = (trigger: string) => {
    if (trigger.trim() && !triggers.includes(trigger.trim())) {
      setTriggers([...triggers, trigger.trim()]);
    }
    setNewTrigger('');
  };

  const addActivity = (activity: string) => {
    if (activity.trim() && !activities.includes(activity.trim())) {
      setActivities([...activities, activity.trim()]);
    }
    setNewActivity('');
  };

  const removeTrigger = (trigger: string) => {
    setTriggers(triggers.filter(t => t !== trigger));
  };

  const removeActivity = (activity: string) => {
    setActivities(activities.filter(a => a !== activity));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedMood = moodOptions.find(m => m.value === mood);
    onSave({
      date,
      mood,
      moodLabel: selectedMood?.label || 'Okay',
      triggers,
      activities,
      notes,
    });
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-blue-100 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Add Journal Entry</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-2">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 bg-white/90 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        {/* Mood */}
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-3">How are you feeling?</label>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {moodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMood(option.value)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                  mood === option.value
                    ? `${option.color} border-opacity-100 scale-105 shadow-lg`
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-2">{option.emoji}</div>
                <div className="text-sm font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Triggers */}
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-3">Stress Triggers</label>
          
          {/* Common triggers */}
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-2">Quick add:</p>
            <div className="flex flex-wrap gap-2">
              {commonTriggers.map((trigger) => (
                <button
                  key={trigger}
                  type="button"
                  onClick={() => addTrigger(trigger)}
                  disabled={triggers.includes(trigger)}
                  className={`text-xs px-3 py-1 rounded-full transition-all duration-200 ${
                    triggers.includes(trigger)
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:scale-105'
                  }`}
                >
                  {trigger}
                </button>
              ))}
            </div>
          </div>

          {/* Custom trigger input */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newTrigger}
              onChange={(e) => setNewTrigger(e.target.value)}
              placeholder="Add custom trigger..."
              className="flex-1 px-4 py-2 bg-white/90 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTrigger(newTrigger))}
            />
            <button
              type="button"
              onClick={() => addTrigger(newTrigger)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Selected triggers */}
          {triggers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {triggers.map((trigger) => (
                <span
                  key={trigger}
                  className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {trigger}
                  <button
                    type="button"
                    onClick={() => removeTrigger(trigger)}
                    className="hover:text-red-900 transition-colors duration-200"
                  >
                    <Trash2 size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Activities */}
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-3">Activities</label>
          
          {/* Common activities */}
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-2">Quick add:</p>
            <div className="flex flex-wrap gap-2">
              {commonActivities.map((activity) => (
                <button
                  key={activity}
                  type="button"
                  onClick={() => addActivity(activity)}
                  disabled={activities.includes(activity)}
                  className={`text-xs px-3 py-1 rounded-full transition-all duration-200 ${
                    activities.includes(activity)
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-green-50 text-green-700 hover:bg-green-100 hover:scale-105'
                  }`}
                >
                  {activity}
                </button>
              ))}
            </div>
          </div>

          {/* Custom activity input */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              placeholder="Add custom activity..."
              className="flex-1 px-4 py-2 bg-white/90 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addActivity(newActivity))}
            />
            <button
              type="button"
              onClick={() => addActivity(newActivity)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Selected activities */}
          {activities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activities.map((activity) => (
                <span
                  key={activity}
                  className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {activity}
                  <button
                    type="button"
                    onClick={() => removeActivity(activity)}
                    className="hover:text-green-900 transition-colors duration-200"
                  >
                    <Trash2 size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-2">Additional Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How was your day? Any additional thoughts or reflections..."
            rows={4}
            className="w-full px-4 py-3 bg-white/90 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
          />
        </div>

        {/* Submit buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save Entry
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEntry;