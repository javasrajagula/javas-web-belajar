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
  sendMessage: (content: string, context?: any) => Promise<void>;
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

    sendMessage: async (content, context) => {
      const userMsg: ChatMessage = {
        id: `msg-user-${Date.now()}`,
        sender: 'user',
        content,
        timestamp: new Date().toISOString()
      };

      // Add user message to state
      set((state) => {
        const updated = {
          ...state.session,
          messages: [...state.session.messages, userMsg]
        };
        setStorageItem('academy_os_tutor_session', updated);
        return { session: updated, isResponding: true };
      });

      // Prepare placeholder message for streaming AI response
      const tutorMsgId = `msg-tutor-${Date.now()}`;
      const initialTutorMsg: ChatMessage = {
        id: tutorMsgId,
        sender: 'tutor',
        content: '',
        timestamp: new Date().toISOString()
      };

      set((state) => ({
        session: {
          ...state.session,
          messages: [...state.session.messages, initialTutorMsg]
        }
      }));

      try {
        // Send request to streaming API route
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: get().session.messages.slice(0, -1).map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.content
            })),
            context: {
              ...context,
              mode: get().session.mode
            }
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            try {
              const errorData = await response.json();
              throw new Error(`RATE_LIMIT:${errorData.message || "Batas laju terlampaui."}`);
            } catch (jsonErr) {
              if (jsonErr instanceof Error && jsonErr.message.startsWith("RATE_LIMIT:")) {
                throw jsonErr;
              }
              throw new Error("RATE_LIMIT:Batas laju terlampaui. Maksimal 15 pertanyaan per menit.");
            }
          }
          throw new Error('API request failed');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error('No reader available');

        let chunkText = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          chunkText += decoder.decode(value, { stream: true });
          
          // Update the streaming content in state
          set((state) => {
            const updatedMessages = state.session.messages.map((m) => {
              if (m.id === tutorMsgId) {
                return { ...m, content: chunkText };
              }
              return m;
            });
            const updated = { ...state.session, messages: updatedMessages };
            setStorageItem('academy_os_tutor_session', updated);
            return { session: updated };
          });
        }
        
        set({ isResponding: false });
      } catch (error: any) {
        console.error('Error generating AI Tutor reply:', error);
        
        if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
          const limitMsg = error.message.replace('RATE_LIMIT:', '');
          set((state) => {
            const updatedMessages = state.session.messages.map((m) => {
              if (m.id === tutorMsgId) {
                return { 
                  ...m, 
                  content: `⚠️ **Batas Laju Terlampaui (429)**\n\n${limitMsg}\n\nSilakan tunggu beberapa saat sebelum mengirim pertanyaan baru.` 
                };
              }
              return m;
            });
            const updated = { ...state.session, messages: updatedMessages };
            setStorageItem('academy_os_tutor_session', updated);
            return { session: updated, isResponding: false };
          });
          return;
        }
        
        // Fallback to local mock reply
        try {
          const fallbackReplyText = await generateTutorReply(
            get().session.mode,
            content,
            get().session.messages.slice(0, -1)
          );
          
          set((state) => {
            const updatedMessages = state.session.messages.map((m) => {
              if (m.id === tutorMsgId) {
                return { ...m, content: fallbackReplyText };
              }
              return m;
            });
            const updated = { ...state.session, messages: updatedMessages };
            setStorageItem('academy_os_tutor_session', updated);
            return { session: updated, isResponding: false };
          });
        } catch (fallbackErr) {
          console.error('Mock fallback failed:', fallbackErr);
          set({ isResponding: false });
        }
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
