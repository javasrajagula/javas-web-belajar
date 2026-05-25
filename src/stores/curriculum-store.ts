import { create } from 'zustand';
import { getStorageItem, setStorageItem } from '@/lib/storage';
import { PortfolioProject, PKLJournalEntry } from '@/types';
import { useUserStore } from './user-store';
import { 
  markLessonCompleteAction, 
  addPortfolioAction, 
  deletePortfolioAction, 
  addPklEntryAction, 
  deletePklEntryAction,
  getCompletedLessons
} from '@/lib/actions/user';

interface CurriculumState {
  completedLessons: Record<string, boolean>;
  lessonScores: Record<string, number>;
  portfolios: PortfolioProject[];
  pklLogs: PKLJournalEntry[];
  
  loadFromDb: (email: string) => Promise<void>;
  syncLocalToDb: (email: string) => Promise<void>;
  markLessonComplete: (lessonId: string, score?: number) => Promise<void>;
  addPortfolio: (project: Omit<PortfolioProject, 'id' | 'createdAt'>) => Promise<void>;
  addPklEntry: (entry: Omit<PKLJournalEntry, 'id' | 'approved'>) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
  deletePklEntry: (id: string) => Promise<void>;
}

export const useCurriculumStore = create<CurriculumState>((set, get) => {
  const initialCompleted = getStorageItem<Record<string, boolean>>('academy_os_completed_lessons', {});
  const initialScores = getStorageItem<Record<string, number>>('academy_os_lesson_scores', {});
  const initialPortfolios = getStorageItem<PortfolioProject[]>('academy_os_portfolios', []);
  const initialPklLogs = getStorageItem<PKLJournalEntry[]>('academy_os_pkl_logs', []);

  return {
    completedLessons: initialCompleted,
    lessonScores: initialScores,
    portfolios: initialPortfolios,
    pklLogs: initialPklLogs,

    loadFromDb: async (email) => {
      try {
        const { completedLessons, lessonScores } = await getCompletedLessons(email);
        set({ completedLessons, lessonScores });
        setStorageItem('academy_os_completed_lessons', completedLessons);
        setStorageItem('academy_os_lesson_scores', lessonScores);
      } catch (err) {
        console.error('Failed to load curriculum progress from DB:', err);
      }
    },

    syncLocalToDb: async (email) => {
      try {
        // Sync completed lessons
        const completed = get().completedLessons;
        const scores = get().lessonScores;
        for (const lessonId of Object.keys(completed)) {
          await markLessonCompleteAction(email, lessonId, scores[lessonId]);
        }
        
        // Sync portfolios
        const portfolios = get().portfolios;
        for (const p of portfolios) {
          if (p.id.startsWith('project-')) {
            await addPortfolioAction(email, p);
          }
        }

        // Sync PKL
        const pklLogs = get().pklLogs;
        for (const pkl of pklLogs) {
          if (pkl.id.startsWith('pkl-')) {
            await addPklEntryAction(email, pkl);
          }
        }
        
        await get().loadFromDb(email);
      } catch (err) {
        console.error('Failed to sync local data to DB:', err);
      }
    },

    markLessonComplete: async (lessonId, score) => {
      set((state) => {
        const updatedCompleted = { ...state.completedLessons, [lessonId]: true };
        const updatedScores = score !== undefined 
          ? { ...state.lessonScores, [lessonId]: Math.max(state.lessonScores[lessonId] || 0, score) }
          : state.lessonScores;
        
        setStorageItem('academy_os_completed_lessons', updatedCompleted);
        setStorageItem('academy_os_lesson_scores', updatedScores);
        return { completedLessons: updatedCompleted, lessonScores: updatedScores };
      });

      try {
        const email = useUserStore.getState().profile.email || 'alex@academy.os';
        await markLessonCompleteAction(email, lessonId, score);
      } catch (err) {
        console.error('Failed to sync lesson completion to DB:', err);
      }
    },

    addPortfolio: async (project) => {
      const email = useUserStore.getState().profile.email || 'alex@academy.os';
      
      let newProject: PortfolioProject;
      try {
        const dbProject = await addPortfolioAction(email, project);
        newProject = {
          id: dbProject.id,
          title: dbProject.title,
          description: dbProject.description,
          projectUrl: dbProject.projectUrl,
          repositoryUrl: dbProject.repositoryUrl,
          skillsUsed: dbProject.skillsUsed,
          gradeScore: dbProject.gradeScore,
          createdAt: dbProject.createdAt
        };
      } catch (err) {
        console.error('Failed to sync portfolio to DB, generating local ID:', err);
        newProject = {
          ...project,
          id: `project-${Date.now()}`,
          createdAt: new Date().toISOString()
        };
      }

      set((state) => {
        const updated = [newProject, ...state.portfolios];
        setStorageItem('academy_os_portfolios', updated);
        
        const currentProfile = useUserStore.getState().profile;
        useUserStore.getState().updateProfile({
          portfolio: [newProject, ...currentProfile.portfolio]
        });

        return { portfolios: updated };
      });
    },

    addPklEntry: async (entry) => {
      const email = useUserStore.getState().profile.email || 'alex@academy.os';
      
      let newEntry: PKLJournalEntry;
      try {
        const dbEntry = await addPklEntryAction(email, entry);
        newEntry = {
          id: dbEntry.id,
          date: dbEntry.date,
          companyName: dbEntry.companyName,
          mentorName: dbEntry.mentorName,
          activityDescription: dbEntry.activityDescription,
          hoursWorked: dbEntry.hoursWorked,
          approved: dbEntry.approved
        };
      } catch (err) {
        console.error('Failed to sync PKL entry to DB, generating local ID:', err);
        newEntry = {
          ...entry,
          id: `pkl-${Date.now()}`,
          approved: false
        };
      }

      set((state) => {
        const updated = [newEntry, ...state.pklLogs];
        setStorageItem('academy_os_pkl_logs', updated);

        const currentProfile = useUserStore.getState().profile;
        useUserStore.getState().updateProfile({
          pklLog: [newEntry, ...currentProfile.pklLog]
        });

        return { pklLogs: updated };
      });
    },

    deletePortfolio: async (id) => {
      set((state) => {
        const updated = state.portfolios.filter(p => p.id !== id);
        setStorageItem('academy_os_portfolios', updated);
        
        const currentProfile = useUserStore.getState().profile;
        useUserStore.getState().updateProfile({
          portfolio: currentProfile.portfolio.filter(p => p.id !== id)
        });

        return { portfolios: updated };
      });

      if (!id.startsWith('project-')) {
        try {
          const email = useUserStore.getState().profile.email || 'alex@academy.os';
          await deletePortfolioAction(email, id);
        } catch (err) {
          console.error('Failed to delete portfolio from DB:', err);
        }
      }
    },

    deletePklEntry: async (id) => {
      set((state) => {
        const updated = state.pklLogs.filter(p => p.id !== id);
        setStorageItem('academy_os_pkl_logs', updated);

        const currentProfile = useUserStore.getState().profile;
        useUserStore.getState().updateProfile({
          pklLog: currentProfile.pklLog.filter(p => p.id !== id)
        });

        return { pklLogs: updated };
      });

      if (!id.startsWith('pkl-')) {
        try {
          const email = useUserStore.getState().profile.email || 'alex@academy.os';
          await deletePklEntryAction(email, id);
        } catch (err) {
          console.error('Failed to delete PKL entry from DB:', err);
        }
      }
    }
  };
});
