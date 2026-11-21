import { 
  UserProfile, 
  SupportedLanguage, 
  ThemeMode,
  HealthRecordEntry, 
  ChatMessage, 
  ChatSession,
  DailyDietPlan, 
  EmotionSentimentCheck 
} from '../types';
import { SAMPLE_DIET_PLANS } from '../data/mockData';

const LANG_KEY = 'healthassist_language';
const THEME_KEY = 'healthassist_theme';
const USERS_KEY = 'healthassist_users';
const CURRENT_USER_KEY = 'healthassist_current_user';

export const getStoredTheme = (): ThemeMode => {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    return (raw === 'dark' || raw === 'warm' || raw === 'light') ? raw : 'light';
  } catch {
    return 'light';
  }
};

export const setStoredTheme = (theme: ThemeMode): void => {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Failed to save theme', e);
  }
};

export const getStoredLanguage = (): SupportedLanguage | null => {
  try {
    const lang = localStorage.getItem(LANG_KEY);
    return lang ? (lang as SupportedLanguage) : null;
  } catch {
    return null;
  }
};

export const setStoredLanguage = (lang: SupportedLanguage): void => {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch (e) {
    console.error('Failed to save language', e);
  }
};

export const getUsers = (): UserProfile[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveUser = (user: UserProfile): void => {
  try {
    const users = getUsers();
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save user', e);
  }
};

export const findUserByEmail = (email: string): UserProfile | undefined => {
  const users = getUsers();
  return users.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
};

export const getCurrentUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setCurrentUser = (user: UserProfile | null): void => {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (e) {
    console.error('Failed to update active user', e);
  }
};

// PER-USER DATA ISOLATION:
// "if one user gets a particular recordings it should not be same to the other user they should get their related things"

export const getHealthRecords = (userId: string): HealthRecordEntry[] => {
  try {
    if (!userId) return [];
    const raw = localStorage.getItem(`healthassist_records_${userId}`);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const addHealthRecord = (userId: string, record: HealthRecordEntry): void => {
  try {
    if (!userId) return;
    const existing = getHealthRecords(userId);
    const updated = [record, ...existing];
    localStorage.setItem(`healthassist_records_${userId}`, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save record', e);
  }
};

export const deleteHealthRecord = (userId: string, recordId: string): HealthRecordEntry[] => {
  try {
    if (!userId) return [];
    const existing = getHealthRecords(userId);
    const updated = existing.filter((r) => r.id !== recordId);
    localStorage.setItem(`healthassist_records_${userId}`, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete record', e);
    return getHealthRecords(userId);
  }
};

export const getChatHistory = (userId: string, userName: string = 'User'): ChatMessage[] => {
  try {
    if (!userId) return [];
    const raw = localStorage.getItem(`healthassist_chat_${userId}`);
    if (!raw) {
      return [
        {
          id: 'welcome-msg',
          sender: 'bot',
          text: `Hello ${userName}! I am your personal HealthAssist assistant. How can I help you today? You can ask about symptoms, nutrition, or general wellness.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveChatHistory = (userId: string, messages: ChatMessage[]): void => {
  try {
    if (!userId) return;
    localStorage.setItem(`healthassist_chat_${userId}`, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save chat', e);
  }
};

export const getChatSessions = (userId: string): ChatSession[] => {
  try {
    if (!userId) return [];
    const sessionsKey = `healthassist_chat_sessions_${userId}`;
    const raw = localStorage.getItem(sessionsKey);
    if (raw) {
      const parsed: ChatSession[] = JSON.parse(raw);
      return parsed.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    // One-time migration from legacy single chat key if it had user messages
    const legacyRaw = localStorage.getItem(`healthassist_chat_${userId}`);
    if (legacyRaw) {
      const legacyMessages: ChatMessage[] = JSON.parse(legacyRaw);
      const firstUserMsg = legacyMessages.find(m => m.sender === 'user');
      if (firstUserMsg) {
        const nowIso = new Date().toISOString();
        const migrated: ChatSession = {
          id: `session_migrated_${Date.now()}`,
          title: firstUserMsg.text.slice(0, 48) + (firstUserMsg.text.length > 48 ? '...' : ''),
          createdAt: nowIso,
          updatedAt: nowIso,
          messages: legacyMessages,
        };
        localStorage.setItem(sessionsKey, JSON.stringify([migrated]));
        localStorage.removeItem(`healthassist_chat_${userId}`);
        return [migrated];
      }
      localStorage.removeItem(`healthassist_chat_${userId}`);
    }

    return [];
  } catch {
    return [];
  }
};

export const saveChatSessions = (userId: string, sessions: ChatSession[]): void => {
  if (!userId) return;
  const sessionsKey = `healthassist_chat_sessions_${userId}`;
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  try {
    localStorage.setItem(sessionsKey, JSON.stringify(sorted));
  } catch {
    // Handle localStorage quota overflow by pruning heavy base64 dataUrls from older sessions
    try {
      const compacted = sorted.map((s, idx) => {
        if (idx === 0) return s;
        return {
          ...s,
          messages: s.messages.map(m =>
            m.attachment && m.attachment.dataUrl.length > 1000
              ? {
                  ...m,
                  attachment: {
                    ...m.attachment,
                    dataUrl: '',
                  },
                }
              : m
          ),
        };
      });
      localStorage.setItem(sessionsKey, JSON.stringify(compacted));
    } catch (err) {
      console.error('Failed to save chat sessions', err);
    }
  }
};

export const upsertChatSession = (userId: string, session: ChatSession): ChatSession[] => {
  const existing = getChatSessions(userId);
  const idx = existing.findIndex(s => s.id === session.id);
  const updated = idx >= 0
    ? existing.map(s => (s.id === session.id ? session : s))
    : [session, ...existing];
  saveChatSessions(userId, updated);
  return getChatSessions(userId);
};

export const deleteChatSession = (userId: string, sessionId: string): ChatSession[] => {
  const existing = getChatSessions(userId);
  const updated = existing.filter(s => s.id !== sessionId);
  saveChatSessions(userId, updated);
  return updated;
};

export const getDietPlan = (userId: string, goal: string = 'Balanced Maintenance'): DailyDietPlan => {
  try {
    if (!userId) return SAMPLE_DIET_PLANS['Balanced Maintenance'];
    const raw = localStorage.getItem(`healthassist_diet_${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
    return SAMPLE_DIET_PLANS[goal] || SAMPLE_DIET_PLANS['Balanced Maintenance'];
  } catch {
    return SAMPLE_DIET_PLANS['Balanced Maintenance'];
  }
};

export const saveDietPlan = (userId: string, plan: DailyDietPlan): void => {
  try {
    if (!userId) return;
    localStorage.setItem(`healthassist_diet_${userId}`, JSON.stringify(plan));
  } catch (e) {
    console.error('Failed to save diet plan', e);
  }
};

export const getEmotionHistory = (userId: string): EmotionSentimentCheck[] => {
  try {
    if (!userId) return [];
    const raw = localStorage.getItem(`healthassist_emotions_${userId}`);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveEmotionCheck = (userId: string, item: EmotionSentimentCheck): void => {
  try {
    if (!userId) return;
    const list = getEmotionHistory(userId);
    localStorage.setItem(`healthassist_emotions_${userId}`, JSON.stringify([item, ...list]));
  } catch (e) {
    console.error('Failed to save emotion record', e);
  }
};

export const calculateBMI = (heightCm: number, weightKg: number): number => {
  if (!heightCm || !weightKg || heightCm <= 0) return 22.0;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return parseFloat(bmi.toFixed(1));
};

export const getBMICategory = (bmi: number): { label: string; color: string } => {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  if (bmi < 25.0) return { label: 'Healthy Normal', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (bmi < 30.0) return { label: 'Overweight', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  return { label: 'Obese', color: 'text-rose-700 bg-rose-50 border-rose-200' };
};

// Calculate physiological targets based on person's metrics
export const calculatePersonalTargets = (user: UserProfile) => {
  const weight = user.weightKg || 65;
  const height = user.heightCm || 170;
  const age = user.age || 30;

  // Mifflin-St Jeor Equation for BMR
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  if (user.gender === 'female') {
    bmr -= 161;
  } else {
    bmr += 5;
  }
  const dailyCalories = Math.round(bmr * 1.35); // Moderate lifestyle multiplier
  const dailyWaterLiters = parseFloat(((weight * 35) / 1000).toFixed(1)); // 35ml per kg

  return {
    dailyCalories,
    dailyWaterLiters,
    targetBP: '< 120 / 80 mmHg',
    targetRestingHR: '60 - 100 BPM',
    targetFastingSugar: '70 - 99 mg/dL',
  };
};
