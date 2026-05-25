import { create } from 'zustand';
import { Task } from '@/types';
import { getStorageItem, setStorageItem } from '@/lib/storage';

const DEFAULT_TASKS: Task[] = [
  { id: 't-1', title: 'Tinjau Superposisi Kuantum', date: new Date().toISOString().split('T')[0], duration: 45, completed: false, category: 'study', topic: 'Keadaan Kuantum' },
  { id: 't-2', title: 'Latihan Soal Integrasi Kalkulus Set 1', date: new Date().toISOString().split('T')[0], duration: 30, completed: false, category: 'exercise', topic: 'Integrasi Kalkulus' },
  { id: 't-3', title: 'Selesaikan Konjugasi Kata Kerja Prancis', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], duration: 20, completed: false, category: 'revision', topic: 'Kata Kerja Prancis' }
];

interface PlannerState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  generateAISchedule: (topics: string[], days: number) => void;
}

export const usePlannerStore = create<PlannerState>((set) => {
  const initialTasks = getStorageItem<Task[]>('academy_os_tasks', DEFAULT_TASKS);

  return {
    tasks: initialTasks,

    addTask: (taskData) => set((state) => {
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`
      };
      const updated = [...state.tasks, newTask];
      setStorageItem('academy_os_tasks', updated);
      return { tasks: updated };
    }),

    toggleTask: (id) => set((state) => {
      const updated = state.tasks.map((t) => 
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      setStorageItem('academy_os_tasks', updated);
      return { tasks: updated };
    }),

    deleteTask: (id) => set((state) => {
      const updated = state.tasks.filter((t) => t.id !== id);
      setStorageItem('academy_os_tasks', updated);
      return { tasks: updated };
    }),

    generateAISchedule: (topics, days) => set((state) => {
      const newTasks: Task[] = [];
      const today = new Date();
      const categories: Task['category'][] = ['study', 'exercise', 'revision'];

      for (let i = 0; i < days; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];

        topics.forEach((topic, index) => {
          const category = categories[(index + i) % categories.length];
          const duration = 20 + ((index * 15 + i * 5) % 45); // Variasi durasi
          
          let actionLabel = 'Belajar mendalam';
          if (category === 'exercise') actionLabel = 'Latihan soal';
          if (category === 'revision') actionLabel = 'Tinjauan aktif';

          newTasks.push({
            id: `task-ai-${Date.now()}-${i}-${index}`,
            title: `Sesi AI: ${actionLabel} tentang ${topic}`,
            date: dateStr,
            duration,
            completed: false,
            category,
            topic
          });
        });
      }

      const cleanTasks = state.tasks.filter(t => !t.id.startsWith('task-ai-') || t.completed);
      const updated = [...cleanTasks, ...newTasks];
      setStorageItem('academy_os_tasks', updated);
      return { tasks: updated };
    })
  };
});
