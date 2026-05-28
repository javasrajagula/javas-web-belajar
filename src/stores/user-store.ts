import { create } from 'zustand';
import { UserProfile, Achievement, DailyQuest } from '@/types';
import { getStorageItem, setStorageItem } from '@/lib/storage';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Mercer',
  email: 'alex@academy.os',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  role: 'student',
  schoolType: 'sma',
  grade: 10,
  selectedPathway: 'Umum',
  goals: ['Kuasai kalkulus sebelum semester baru', 'Menyelesaikan 3 kuis berturut-turut', 'Konsisten Pomodoro harian'],
  streak: 5,
  lastActive: new Date().toISOString(),
  xp: 1250,
  level: 4,
  studyTimeToday: 35,
  dailyGoalMinutes: 45,
  dailyGoalXp: 200,
  weeklyProgress: [
    { day: 'Sen', minutes: 40, xp: 180 },
    { day: 'Sel', minutes: 50, xp: 220 },
    { day: 'Rab', minutes: 30, xp: 140 },
    { day: 'Kam', minutes: 60, xp: 250 },
    { day: 'Jum', minutes: 35, xp: 160 },
    { day: 'Sab', minutes: 0, xp: 0 },
    { day: 'Min', minutes: 0, xp: 0 }
  ],
  weakTopics: [
    { topic: 'Persamaan Eksponen', mastery: 42 },
    { topic: 'Pilar Enkapsulasi', mastery: 58 },
    { topic: 'Routing Statis', mastery: 65 }
  ],
  skills: {
    focus: 64,
    logic: 72,
    creativity: 55,
    discipline: 80
  },
  achievements: [
    { id: 'a1', title: 'Unggahan Pertama', description: 'Berhasil mengunggah bahan belajar pertama Anda ke Second Brain', icon: 'FileUp', category: 'general', unlockedAt: new Date().toISOString() },
    { id: 'a2', title: 'Master Fokus', description: 'Menyelesaikan sesi fokus belajar selama 45 menit tanpa terputus', icon: 'Clock', category: 'focus' },
    { id: 'a3', title: 'Kuis Sempurna', description: 'Mendapat nilai 100% pada kuis pilihan ganda yang dihasilkan AI', icon: 'Award', category: 'logic' },
    { id: 'a4', title: 'Pembangun Kebiasaan', description: 'Mempertahankan beruntun (streak) belajar selama 7 hari berturut-turut', icon: 'Zap', category: 'discipline' }
  ],
  dailyQuests: [
    { id: 'q1', title: 'Belajar 45 Menit Hari Ini', xpReward: 100, completed: false, target: 45, current: 35, type: 'study' },
    { id: 'q2', title: 'Selesaikan Satu Kuis AI', xpReward: 50, completed: false, target: 1, current: 0, type: 'quiz' },
    { id: 'q3', title: 'Bertanya Pada Tutor AI', xpReward: 50, completed: false, target: 3, current: 1, type: 'chat' }
  ],
  portfolio: [],
  pklLog: []
};

interface UserState {
  profile: UserProfile;
  loadFromDb: (email: string) => Promise<void>;
  syncLocalToDb: (email: string) => Promise<void>;
  addXp: (amount: number) => void;
  addStudyTime: (minutes: number) => void;
  completeQuest: (questId: string) => void;
  updateQuestProgress: (type: 'study' | 'quiz' | 'chat' | 'planner', amount: number) => void;
  unlockAchievement: (id: string) => void;
  upgradeSkill: (skill: 'focus' | 'logic' | 'creativity' | 'discipline', amount: number) => void;
  resetWeeklyProgress: () => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

async function fetchProfileFromApi(): Promise<UserProfile | null> {
  const response = await fetch('/api/user/profile', { cache: 'no-store' });
  if (response.status === 401) return null;
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Gagal memuat profil pengguna');
  }
  return response.json();
}

async function patchProfileToApi(updates: Partial<Omit<UserProfile, 'portfolio' | 'pklLog'>>): Promise<UserProfile | null> {
  const response = await fetch('/api/user/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (response.status === 401) return null;
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Gagal menyimpan profil pengguna');
  }
  return response.json();
}

function saveProfileInBackground(
  updates: Partial<Omit<UserProfile, 'portfolio' | 'pklLog'>>,
  label: string
) {
  patchProfileToApi(updates).catch((error) => {
    console.warn(`${label}:`, error);
  });
}

export const useUserStore = create<UserState>((set, get) => {
  return {
    profile: DEFAULT_PROFILE,

    loadFromDb: async () => {
      try {
        const dbProfile = await fetchProfileFromApi();
        if (dbProfile) {
          // Preserve local achievements if database doesn't manage them yet
          const achievements = get().profile.achievements.length > 0 
            ? get().profile.achievements 
            : DEFAULT_PROFILE.achievements;
          
          const updatedProfile = {
            ...dbProfile,
            achievements
          };
          set({ profile: updatedProfile });
          setStorageItem('academy_os_user_profile', updatedProfile);
        }
      } catch (error) {
        console.warn('Failed to load profile from API:', error);
      }
    },

    syncLocalToDb: async () => {
      try {
        const localProfile = get().profile;
        const { portfolio, pklLog, ...updates } = localProfile;
        const dbProfile = await patchProfileToApi(updates);
        if (!dbProfile) return;
        set({ 
          profile: {
            ...localProfile,
            ...dbProfile,
            portfolio: localProfile.portfolio,
            pklLog: localProfile.pklLog
          }
        });
      } catch (error) {
        console.warn('Failed to sync profile to API:', error);
      }
    },

    addXp: (amount) => {
      set((state) => {
        let newXp = state.profile.xp + amount;
        let newLevel = state.profile.level;
        
        const xpNeeded = newLevel * 500;
        if (newXp >= xpNeeded) {
          newXp -= xpNeeded;
          newLevel += 1;
        }

        const dayIndex = new Date().getDay();
        const idDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const todayName = idDays[dayIndex];

        const updatedWeeklyProgress = state.profile.weeklyProgress.map(dayObj => {
          if (dayObj.day === todayName) {
            return { ...dayObj, xp: Math.max(0, dayObj.xp + amount) };
          }
          return dayObj;
        });

        const updated = {
          ...state.profile,
          xp: Math.max(0, newXp),
          level: newLevel,
          weeklyProgress: updatedWeeklyProgress
        };
        
        // Async background save to DB
        saveProfileInBackground({
          xp: Math.max(0, newXp),
          level: newLevel,
          weeklyProgress: updatedWeeklyProgress
        }, 'Failed to sync XP');

        setStorageItem('academy_os_user_profile', updated);
        return { profile: updated };
      });
    },

    addStudyTime: (minutes) => {
      set((state) => {
        const newStudyTime = state.profile.studyTimeToday + minutes;
        
        const dayIndex = new Date().getDay();
        const idDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const todayName = idDays[dayIndex];

        const updatedWeeklyProgress = state.profile.weeklyProgress.map(dayObj => {
          if (dayObj.day === todayName) {
            return { ...dayObj, minutes: dayObj.minutes + minutes };
          }
          return dayObj;
        });

        const updatedQuests = state.profile.dailyQuests.map(q => {
          if (q.type === 'study') {
            const nextVal = Math.min(q.target, q.current + minutes);
            return {
              ...q,
              current: nextVal,
              completed: nextVal >= q.target
            };
          }
          return q;
        });

        let xpToAward = 0;
        updatedQuests.forEach((q, idx) => {
          const oldQ = state.profile.dailyQuests[idx];
          if (q.completed && !oldQ.completed) {
            xpToAward += q.xpReward;
          }
        });

        const updated = {
          ...state.profile,
          studyTimeToday: newStudyTime,
          weeklyProgress: updatedWeeklyProgress,
          dailyQuests: updatedQuests
        };

        // Async background save to DB
        saveProfileInBackground({
          studyTimeToday: newStudyTime,
          weeklyProgress: updatedWeeklyProgress,
          dailyQuests: updatedQuests
        }, 'Failed to sync study time');

        setStorageItem('academy_os_user_profile', updated);
        
        if (xpToAward > 0) {
          setTimeout(() => state.addXp(xpToAward), 0);
        }

        return { profile: updated };
      });
    },

    completeQuest: (questId) => {
      set((state) => {
        const quest = state.profile.dailyQuests.find(q => q.id === questId);
        if (!quest || quest.completed) return {};

        const updatedQuests = state.profile.dailyQuests.map(q => 
          q.id === questId ? { ...q, completed: true, current: q.target } : q
        );

        const updated = {
          ...state.profile,
          dailyQuests: updatedQuests
        };

        // Async background save to DB
        saveProfileInBackground({
          dailyQuests: updatedQuests
        }, 'Failed to sync completed quest');

        setStorageItem('academy_os_user_profile', updated);
        setTimeout(() => state.addXp(quest.xpReward), 0);
        return { profile: updated };
      });
    },

    updateQuestProgress: (type, amount) => {
      set((state) => {
        let xpToAward = 0;
        const updatedQuests = state.profile.dailyQuests.map(q => {
          if (q.type === type && !q.completed) {
            const nextVal = Math.min(q.target, q.current + amount);
            const completedNow = nextVal >= q.target;
            if (completedNow) {
              xpToAward += q.xpReward;
            }
            return {
              ...q,
              current: nextVal,
              completed: completedNow
            };
          }
          return q;
        });

        const updated = {
          ...state.profile,
          dailyQuests: updatedQuests
        };

        // Async background save to DB
        saveProfileInBackground({
          dailyQuests: updatedQuests
        }, 'Failed to sync quest progress');

        setStorageItem('academy_os_user_profile', updated);

        if (xpToAward > 0) {
          setTimeout(() => state.addXp(xpToAward), 0);
        }

        return { profile: updated };
      });
    },

    unlockAchievement: (id) => {
      set((state) => {
        const updatedAchievements = state.profile.achievements.map(a => 
          a.id === id ? { ...a, unlockedAt: new Date().toISOString() } : a
        );
        const updated = {
          ...state.profile,
          achievements: updatedAchievements
        };
        setStorageItem('academy_os_user_profile', updated);
        return { profile: updated };
      });
    },

    upgradeSkill: (skill, amount) => {
      set((state) => {
        const currentVal = state.profile.skills[skill] || 0;
        const updatedSkills = {
          ...state.profile.skills,
          [skill]: Math.min(100, currentVal + amount)
        };
        const updated = {
          ...state.profile,
          skills: updatedSkills
        };

        // Async background save to DB
        saveProfileInBackground({
          skills: updatedSkills
        }, 'Failed to sync skills');

        setStorageItem('academy_os_user_profile', updated);
        return { profile: updated };
      });
    },

    resetWeeklyProgress: () => {
      set((state) => {
        const cleanProgress = [
          { day: 'Sen', minutes: 0, xp: 0 },
          { day: 'Sel', minutes: 0, xp: 0 },
          { day: 'Rab', minutes: 0, xp: 0 },
          { day: 'Kam', minutes: 0, xp: 0 },
          { day: 'Jum', minutes: 0, xp: 0 },
          { day: 'Sab', minutes: 0, xp: 0 },
          { day: 'Min', minutes: 0, xp: 0 }
        ];
        const updated = {
          ...state.profile,
          studyTimeToday: 0,
          weeklyProgress: cleanProgress
        };

        // Async background save to DB
        saveProfileInBackground({
          studyTimeToday: 0,
          weeklyProgress: cleanProgress
        }, 'Failed to sync reset progress');

        setStorageItem('academy_os_user_profile', updated);
        return { profile: updated };
      });
    },

    updateProfile: async (profileUpdates) => {
      set((state) => {
        const updated = {
          ...state.profile,
          ...profileUpdates
        };
        setStorageItem('academy_os_user_profile', updated);
        return { profile: updated };
      });

      // Sync to PostgreSQL
      try {
        const { portfolio, pklLog, ...updates } = profileUpdates;
        if (Object.keys(updates).length > 0) {
          await patchProfileToApi(updates);
        }
      } catch (err) {
        console.warn('Failed to update user profile in API:', err);
      }
    }
  };
});
