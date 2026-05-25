import { create } from 'zustand';
import { getStorageItem, setStorageItem } from '@/lib/storage';
import { PortfolioProject, PKLJournalEntry } from '@/types';

interface CurriculumState {
  completedLessons: Record<string, boolean>;
  lessonScores: Record<string, number>;
  portfolios: PortfolioProject[];
  pklLogs: PKLJournalEntry[];
  
  markLessonComplete: (lessonId: string, score?: number) => void;
  addPortfolio: (project: Omit<PortfolioProject, 'id' | 'createdAt'>) => void;
  addPklEntry: (entry: Omit<PKLJournalEntry, 'id' | 'approved'>) => void;
  deletePortfolio: (id: string) => void;
  deletePklEntry: (id: string) => void;
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

    markLessonComplete: (lessonId, score) => set((state) => {
      const updatedCompleted = { ...state.completedLessons, [lessonId]: true };
      const updatedScores = score !== undefined 
        ? { ...state.lessonScores, [lessonId]: Math.max(state.lessonScores[lessonId] || 0, score) }
        : state.lessonScores;
      
      setStorageItem('academy_os_completed_lessons', updatedCompleted);
      setStorageItem('academy_os_lesson_scores', updatedScores);
      return { completedLessons: updatedCompleted, lessonScores: updatedScores };
    }),

    addPortfolio: (project) => set((state) => {
      const newProject: PortfolioProject = {
        ...project,
        id: `project-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      const updated = [newProject, ...state.portfolios];
      setStorageItem('academy_os_portfolios', updated);
      return { portfolios: updated };
    }),

    addPklEntry: (entry) => set((state) => {
      const newEntry: PKLJournalEntry = {
        ...entry,
        id: `pkl-${Date.now()}`,
        approved: false
      };
      const updated = [newEntry, ...state.pklLogs];
      setStorageItem('academy_os_pkl_logs', updated);
      return { pklLogs: updated };
    }),

    deletePortfolio: (id) => set((state) => {
      const updated = state.portfolios.filter(p => p.id !== id);
      setStorageItem('academy_os_portfolios', updated);
      return { portfolios: updated };
    }),

    deletePklEntry: (id) => set((state) => {
      const updated = state.pklLogs.filter(p => p.id !== id);
      setStorageItem('academy_os_pkl_logs', updated);
      return { pklLogs: updated };
    })
  };
});
