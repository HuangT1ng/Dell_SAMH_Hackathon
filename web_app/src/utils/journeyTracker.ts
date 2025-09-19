// Journey tracking utility for SAMH Platform
// This utility helps track user activities and achievements across the platform

import { sharedDatabase, type UserJourneyEvent, type UserAchievement } from './sharedDatabase';

export interface JourneyEventData {
  eventType: UserJourneyEvent['eventType'];
  eventTitle: string;
  eventDescription: string;
  metadata?: any;
}

class JourneyTracker {
  private userId: string | null = null;

  setUserId(userId: string) {
    this.userId = userId;
  }

  clearUserId() {
    this.userId = null;
  }

  async trackEvent(eventData: JourneyEventData): Promise<void> {
    if (!this.userId) {
      console.warn('JourneyTracker: No user ID set, cannot track event');
      return;
    }

    try {
      const event: UserJourneyEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: this.userId,
        eventType: eventData.eventType,
        eventTitle: eventData.eventTitle,
        eventDescription: eventData.eventDescription,
        timestamp: Date.now(),
        metadata: eventData.metadata
      };

      await sharedDatabase.addJourneyEvent(event);
      console.log('✅ Journey event tracked:', event.eventTitle);
    } catch (error) {
      console.error('❌ Failed to track journey event:', error);
    }
  }

  async unlockAchievement(achievementData: {
    achievementType: string;
    achievementTitle: string;
    achievementDescription: string;
    metadata?: any;
  }): Promise<void> {
    if (!this.userId) {
      console.warn('JourneyTracker: No user ID set, cannot unlock achievement');
      return;
    }

    try {
      const achievement: UserAchievement = {
        id: `achievement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: this.userId,
        achievementType: achievementData.achievementType,
        achievementTitle: achievementData.achievementTitle,
        achievementDescription: achievementData.achievementDescription,
        unlockedAt: Date.now(),
        metadata: achievementData.metadata
      };

      await sharedDatabase.addAchievement(achievement);
      
      // Also track this as a journey event
      await this.trackEvent({
        eventType: 'achievement',
        eventTitle: `Achievement Unlocked: ${achievementData.achievementTitle}`,
        eventDescription: achievementData.achievementDescription,
        metadata: achievementData.metadata
      });

      console.log('🎉 Achievement unlocked:', achievement.achievementTitle);
    } catch (error) {
      console.error('❌ Failed to unlock achievement:', error);
    }
  }

  // Convenience methods for common events
  async trackMoodEntry(moodLabel: string, notes?: string): Promise<void> {
    await this.trackEvent({
      eventType: 'mood_entry',
      eventTitle: `Mood Entry: ${moodLabel}`,
      eventDescription: notes || 'Tracked your mood',
      metadata: { moodLabel, notes }
    });
  }

  async trackChatSession(sessionType: string = 'general'): Promise<void> {
    await this.trackEvent({
      eventType: 'chat_session',
      eventTitle: 'Chat Session',
      eventDescription: `Had a ${sessionType} chat session`,
      metadata: { sessionType }
    });
  }

  async trackGamingSession(gameType: string = 'stress-relief'): Promise<void> {
    await this.trackEvent({
      eventType: 'gaming_session',
      eventTitle: 'Gaming Session',
      eventDescription: `Played ${gameType} games`,
      metadata: { gameType }
    });
  }

  async trackCommunityEvent(eventName: string): Promise<void> {
    await this.trackEvent({
      eventType: 'community_event',
      eventTitle: 'Community Event',
      eventDescription: `Participated in: ${eventName}`,
      metadata: { eventName }
    });
  }

  async trackLogin(): Promise<void> {
    await this.trackEvent({
      eventType: 'login',
      eventTitle: 'Platform Login',
      eventDescription: 'Logged into the platform',
      metadata: { loginTime: new Date().toISOString() }
    });
  }

  async trackLogout(): Promise<void> {
    await this.trackEvent({
      eventType: 'logout',
      eventTitle: 'Platform Logout',
      eventDescription: 'Logged out of the platform',
      metadata: { logoutTime: new Date().toISOString() }
    });
  }

  // Achievement checking and unlocking
  async checkAndUnlockAchievements(moodEntries: any[], journeyEvents: UserJourneyEvent[]): Promise<void> {
    if (!this.userId) return;

    const totalMoodEntries = moodEntries.length;
    const totalChatSessions = journeyEvents.filter(e => e.eventType === 'chat_session').length;
    const totalGamingSessions = journeyEvents.filter(e => e.eventType === 'gaming_session').length;
    const totalCommunityEvents = journeyEvents.filter(e => e.eventType === 'community_event').length;
    
    // Calculate streak
    let streakDays = 0;
    if (moodEntries.length > 0) {
      const sortedEntries = [...moodEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const today = new Date().toDateString();
      
      for (let i = 0; i < sortedEntries.length; i++) {
        const entryDate = new Date(sortedEntries[i].date).toDateString();
        const expectedDate = new Date(Date.now() - (streakDays * 24 * 60 * 60 * 1000)).toDateString();
        
        if (entryDate === expectedDate || (i === 0 && entryDate === today)) {
          streakDays++;
        } else {
          break;
        }
      }
    }

    // Check for achievements to unlock
    const achievementsToCheck = [
      {
        condition: totalMoodEntries >= 1,
        type: 'first_steps',
        title: 'First Steps',
        description: 'Created your first mood entry'
      },
      {
        condition: totalMoodEntries >= 5,
        type: 'consistent_tracker',
        title: 'Consistent Tracker',
        description: 'Created 5 mood entries'
      },
      {
        condition: totalMoodEntries >= 10,
        type: 'dedicated_journaler',
        title: 'Dedicated Journaler',
        description: 'Created 10 mood entries'
      },
      {
        condition: totalMoodEntries >= 25,
        type: 'mood_master',
        title: 'Mood Master',
        description: 'Created 25 mood entries'
      },
      {
        condition: streakDays >= 3,
        type: 'streak_starter',
        title: 'Streak Starter',
        description: 'Maintained a 3-day streak'
      },
      {
        condition: streakDays >= 7,
        type: 'week_warrior',
        title: 'Week Warrior',
        description: 'Maintained a 7-day streak'
      },
      {
        condition: streakDays >= 14,
        type: 'two_week_champion',
        title: 'Two Week Champion',
        description: 'Maintained a 14-day streak'
      },
      {
        condition: totalChatSessions >= 5,
        type: 'social_butterfly',
        title: 'Social Butterfly',
        description: 'Had 5 chat sessions'
      },
      {
        condition: totalGamingSessions >= 10,
        type: 'gaming_enthusiast',
        title: 'Gaming Enthusiast',
        description: 'Played 10 gaming sessions'
      },
      {
        condition: totalCommunityEvents >= 3,
        type: 'community_champion',
        title: 'Community Champion',
        description: 'Participated in 3 community events'
      }
    ];

    // Check each achievement
    for (const achievement of achievementsToCheck) {
      if (achievement.condition) {
        await this.unlockAchievement({
          achievementType: achievement.type,
          achievementTitle: achievement.title,
          achievementDescription: achievement.description
        });
      }
    }
  }
}

export const journeyTracker = new JourneyTracker();
export default journeyTracker;
