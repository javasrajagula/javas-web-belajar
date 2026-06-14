import { create } from 'zustand';
import { TutorSession, ChatMessage } from '@/types';
import { getStorageItem, setStorageItem } from '@/lib/storage';
import { useUserStore } from './user-store';
import { resolveSmkPathway } from '@/lib/pathway';

const DEFAULT_SESSION: TutorSession = {
  id: 'session-default',
  mode: 'teacher',
  messages: [
    { id: 'm-init', sender: 'tutor', content: 'Halo! Saya adalah Tutor AI Web Belajar. Pilih mode mengajar di sebelah kiri dan ajukan pertanyaan apa pun untuk memulai sesi belajar kita!', timestamp: new Date().toISOString() }
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
  const initialSession = sanitizeTutorSession(
    getStorageItem<TutorSession>('academy_os_tutor_session', DEFAULT_SESSION)
  );

  return {
    session: initialSession,
    isResponding: false,

    setMode: (mode) => set((state) => {
      const updated = { ...state.session, mode };
      setStorageItem('academy_os_tutor_session', updated);
      return { session: updated };
    }),

    sendMessage: async (content, context) => {
      if (get().isResponding) return;
      const trimmedContent = content.trim();
      if (!trimmedContent) return;

      const userMsg: ChatMessage = {
        id: `msg-user-${Date.now()}`,
        sender: 'user',
        content: trimmedContent,
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
        const userProfile = useUserStore.getState().profile;
        const apiMessages = get().session.messages
          .slice(0, -1)
          .filter((m) => {
            const content = m.content.trim();
            if (!content) return false;
            if (m.sender === 'tutor' && isNonUserTutorSystemMessage(content)) {
              return false;
            }
            return true;
          })
          .slice(-10)
          .map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.content
          }));

        // Send request to streaming AI Tutor API route
        const response = await fetch('/api/ai/tutor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: apiMessages,
            mode: get().session.mode,
            jurusan: resolveSmkPathway(userProfile.selectedPathway),
            kelas: userProfile.grade,
            context
          }),
        });

        if (!response.ok) {
          const payload = await readErrorPayload(response);
          if (response.status === 429) {
            if (payload.code === 'APP_RATE_LIMIT') {
              throw new Error(`APP_RATE_LIMIT:${payload.message || "Batas laju terlampaui. Maksimal 15 pertanyaan valid per 60 detik."}`);
            }
            throw new Error(`AI_PROVIDER_429:${payload.message || payload.error || "Provider AI sedang membatasi request. Coba lagi beberapa saat."}`);
          }
          if (payload.code === 'AI_PROVIDER_QUOTA') {
            throw new Error(`AI_PROVIDER_QUOTA:${payload.message || payload.error || 'Kuota provider AI sedang habis atau terkena batas provider.'}`);
          }
          throw new Error(payload.message || payload.error || 'Tutor AI gagal menjawab. Periksa konfigurasi GEMINI_API_KEY di server.');
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

        if (!chunkText.trim()) {
          throw new Error('AI_EMPTY_RESPONSE');
        }
        
        set({ isResponding: false });
      } catch (error: any) {
        console.error('Error generating AI Tutor reply:', error);
        
        const normalizedError = normalizeTutorError(error);

        if (normalizedError.code === 'APP_RATE_LIMIT') {
          const limitMsg = normalizedError.message;
          set((state) => {
            const updatedMessages = state.session.messages.map((m) => {
              if (m.id === tutorMsgId) {
                return { 
                  ...m, 
                  content: `**Batas penggunaan Tutor AI tercapai**\n\n${limitMsg}\n\nIni hanya menghitung pertanyaan valid dari pengguna. Tunggu sampai window 60 detik selesai sebelum mengirim pertanyaan berikutnya.` 
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

        if (normalizedError.code === 'AI_PROVIDER_429') {
          const providerMsg = normalizedError.message;
          set((state) => {
            const updatedMessages = state.session.messages.map((m) => {
              if (m.id === tutorMsgId) {
                return {
                  ...m,
                  content: `**Provider AI sedang membatasi request**\n\n${providerMsg}\n\nIni bukan batas 15 pertanyaan per menit dari aplikasi. Jika memakai Gemini free-tier, tunggu quota reset atau gunakan API key dengan kuota/billing aktif.`
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

        if (normalizedError.code === 'AI_PROVIDER_QUOTA') {
          const providerMsg = normalizedError.message;
          set((state) => {
            const updatedMessages = state.session.messages.map((m) => {
              if (m.id === tutorMsgId) {
                return {
                  ...m,
                  content: `**Kuota provider AI sedang terbatas**\n\n${providerMsg}\n\nAPI key sudah dipanggil dari server, tetapi Gemini/provider menolak request karena kuota atau rate limit provider. Ini bukan batas 15 pertanyaan per menit dari aplikasi.`
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
        
        set((state) => {
          const updatedMessages = state.session.messages.map((m) => {
            if (m.id === tutorMsgId) {
              return {
                ...m,
                content: `Maaf, Tutor AI belum bisa menjawab sekarang.\n\nAlasan: ${normalizedError.message || 'koneksi atau konfigurasi AI bermasalah'}\n\nSaya tidak membuat jawaban cadangan agar tidak mengada-ada. Pastikan \`GEMINI_API_KEY\` sudah diatur di server/Vercel, lalu coba lagi.`
              };
            }
            return m;
          });
          const updated = { ...state.session, messages: updatedMessages };
          setStorageItem('academy_os_tutor_session', updated);
          return { session: updated, isResponding: false };
        });
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

async function readErrorPayload(response: Response): Promise<{ code?: string; error?: string; message?: string }> {
  const text = await response.text().catch(() => '');
  const parsed = parseMaybeJsonPayload(text);
  if (parsed) return parsed;
  return { message: text };
}

function normalizeTutorError(error: unknown): { code: string; message: string } {
  const rawMessage = error instanceof Error ? error.message : String(error || '');
  const prefixed = rawMessage.match(/^([A-Z_0-9]+):([\s\S]*)$/);
  if (prefixed) {
    const parsed = parseMaybeJsonPayload(prefixed[2].trim());
    return {
      code: prefixed[1],
      message: parsed?.message || parsed?.error || prefixed[2].trim(),
    };
  }

  const parsed = parseMaybeJsonPayload(rawMessage.trim());
  if (parsed?.code) {
    return {
      code: parsed.code,
      message: parsed.message || parsed.error || rawMessage,
    };
  }

  return { code: 'UNKNOWN', message: rawMessage };
}

function parseMaybeJsonPayload(text: string): { code?: string; error?: string; message?: string } | null {
  if (!text || (!text.startsWith('{') && !text.startsWith('['))) return null;
  try {
    const value = JSON.parse(text);
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    return {
      code: typeof value.code === 'string' ? value.code : undefined,
      error: typeof value.error === 'string' ? value.error : undefined,
      message: typeof value.message === 'string' ? value.message : undefined,
    };
  } catch {
    return null;
  }
}

function sanitizeTutorSession(session: TutorSession): TutorSession {
  const cleanedMessages = session.messages.filter((message) => {
    if (message.sender !== 'tutor') return true;
    return !isNonUserTutorSystemMessage(message.content.trim());
  });

  if (cleanedMessages.length === 0) {
    const resetSession = {
      ...session,
      messages: [
        {
          id: `m-init-${Date.now()}`,
          sender: 'tutor' as const,
          content: 'Sesi Tutor AI siap. Ajukan pertanyaan belajar, dan saya akan membedakan batas aplikasi dari batas provider AI dengan jelas.',
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setStorageItem('academy_os_tutor_session', resetSession);
    return resetSession;
  }

  if (cleanedMessages.length !== session.messages.length) {
    const cleanedSession = { ...session, messages: cleanedMessages };
    setStorageItem('academy_os_tutor_session', cleanedSession);
    return cleanedSession;
  }

  return session;
}

function isNonUserTutorSystemMessage(content: string) {
  return (
    content.startsWith('Halo! Saya adalah Tutor AI Web Belajar') ||
    content.startsWith('Maaf, Tutor AI belum bisa menjawab sekarang') ||
    content.startsWith('Respons AI kosong atau gagal diproses') ||
    content.includes('Batas Laju Terlampaui') ||
    content.includes('Batas laju terlampaui') ||
    content.includes('Batas penggunaan Tutor AI tercapai') ||
    content.includes('Provider AI sedang membatasi request') ||
    content.includes('Kuota provider AI sedang terbatas') ||
    content.includes('Kuota Gemini untuk server sedang habis')
  );
}

