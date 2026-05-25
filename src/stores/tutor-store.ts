import { create } from 'zustand';
import { TutorSession, ChatMessage } from '@/types';
import { getStorageItem, setStorageItem } from '@/lib/storage';
import { generateTutorReply } from '@/lib/ai-mock';

const DEFAULT_SESSION: TutorSession = {
  id: 'session-default',
  mode: 'teacher',
  messages: [
    { id: 'm-init', sender: 'tutor', content: 'Halo! Saya adalah Tutor AI Academy OS. Pilih mode mengajar di sebelah kiri dan ajukan pertanyaan apa pun untuk memulai sesi belajar kita!', timestamp: new Date().toISOString() }
  ]
};

interface TutorState {
  session: TutorSession;
  isResponding: boolean;
  setMode: (mode: TutorSession['mode']) => void;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => void;
}

export const useTutorStore = create<TutorState>((set, get) => {
  const initialSession = getStorageItem<TutorSession>('academy_os_tutor_session', DEFAULT_SESSION);

  return {
    session: initialSession,
    isResponding: false,

    setMode: (mode) => set((state) => {
      const updated = { ...state.session, mode };
      setStorageItem('academy_os_tutor_session', updated);
      return { session: updated };
    }),

    sendMessage: async (content) => {
      const userMsg: ChatMessage = {
        id: `msg-user-${Date.now()}`,
        sender: 'user',
        content,
        timestamp: new Date().toISOString()
      };

      set((state) => {
        const updated = {
          ...state.session,
          messages: [...state.session.messages, userMsg]
        };
        setStorageItem('academy_os_tutor_session', updated);
        return { session: updated, isResponding: true };
      });

      try {
        const tutorReplyText = await generateTutorReply(
          get().session.mode,
          content,
          get().session.messages
        );

        const tutorMsg: ChatMessage = {
          id: `msg-tutor-${Date.now()}`,
          sender: 'tutor',
          content: tutorReplyText,
          timestamp: new Date().toISOString()
        };

        set((state) => {
          const updated = {
            ...state.session,
            messages: [...state.session.messages, tutorMsg]
          };
          setStorageItem('academy_os_tutor_session', updated);
          return { session: updated, isResponding: false };
        });
      } catch (error) {
        set({ isResponding: false });
        console.error('Error generating AI Tutor reply:', error);
      }
    },

    clearHistory: () => set((state) => {
      const cleared: TutorSession = {
        ...state.session,
        messages: [
          { id: `m-init-${Date.now()}`, sender: 'tutor', content: `Sesi direset. Lingkungan belajar diinisialisasi dalam mode: "${state.session.mode}". Bagaimana saya bisa membantu Anda hari ini?`, timestamp: new Date().toISOString() }
        ]
      };
      setStorageItem('academy_os_tutor_session', cleared);
      return { session: cleared };
    })
  };
});
