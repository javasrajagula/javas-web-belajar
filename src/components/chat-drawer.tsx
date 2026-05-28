'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, MessageSquare, Cpu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  materiTitle: string;
  materiContent: string;
  jurusan: string;
  kelas: number;
}

export default function ChatDrawer({
  isOpen,
  onClose,
  materiTitle,
  materiContent,
  jurusan,
  kelas,
}: ChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message when drawer is opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Halo! Saya adalah **Tutor AI BelajarKU** khusus jurusan **${jurusan}**. Saya siap membantu Anda mendiskusikan materi **"${materiTitle}"**. Ada bagian dari teori atau praktik kejuruan ini yang ingin Anda tanyakan?`,
        },
      ]);
    }
  }, [isOpen, messages.length, materiTitle, jurusan]);

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      // Fetch response from tutor API
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userText },
          ],
          mode: 'teacher',
          jurusan,
          kelas,
          context: {
            selectedPathway: jurusan,
            grade: kelas,
            schoolType: 'smk',
            lessonTitle: materiTitle,
            contentPreview: materiContent.slice(0, 4000),
          },
        }),
      });

      if (!res.ok) throw new Error('API request failed');

      // Check if streaming
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No reader available');

      // Add a blank placeholder message for assistant
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      let chunkText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunkText += decoder.decode(value, { stream: true });

        // Update assistant's typing message
        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            lastMsg.content = chunkText;
          }
          return updated;
        });
      }

      if (!chunkText.trim()) {
        throw new Error('AI_EMPTY_RESPONSE');
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal mendapatkan respons Tutor AI.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Respons AI kosong atau gagal diproses. Untuk production, pastikan `GEMINI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, atau `ANTHROPIC_API_KEY` aktif di environment server.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Drawer Container */}
      <div className="relative w-full max-w-[800px] h-[65vh] bg-bg-secondary border-t border-x border-border rounded-t-2xl shadow-xl flex flex-col overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="px-5 py-3 border-b border-border bg-bg-primary flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-primary animate-pulse" />
            <div>
              <h3 className="text-xs font-extrabold flex items-center space-x-1.5">
                <span>Tanya AI Materi</span>
                <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 px-1 py-0.2 rounded uppercase">
                  Claude 3.5
                </span>
              </h3>
              <p className="text-[10px] text-text-tertiary truncate max-w-[200px] sm:max-w-sm">
                Topik: {materiTitle}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-bg-hover text-text-secondary hover:text-text-primary rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-bg-primary/30">
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed shadow-sm ${
                  m.role === 'user'
                    ? 'bg-primary text-white border border-primary/30'
                    : 'bg-bg-secondary border border-border text-text-primary'
                }`}
              >
                <div className="prose prose-invert prose-neutral max-w-none">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-bg-secondary border border-border rounded-xl p-3.5 text-xs flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={scrollRef}></div>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-border bg-bg-primary flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan bagian materi kejuruan ini yang membingungkan..."
            className="flex-1 bg-bg-secondary border border-border focus:border-primary text-text-primary text-xs rounded-lg px-4 py-2.5 outline-none transition-all placeholder:text-text-muted"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-primary hover:bg-primary-hover text-white disabled:opacity-40 disabled:hover:bg-primary rounded-lg transition-colors flex items-center justify-center shadow"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
