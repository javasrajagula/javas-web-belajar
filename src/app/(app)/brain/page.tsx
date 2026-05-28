'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useMaterialsStore } from '@/stores/materials-store';
import { useUserStore } from '@/stores/user-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileUp, 
  Search, 
  Trash2, 
  Sparkles, 
  ArrowRight,
  BookOpen,
  Calendar,
  Layers,
  HelpCircle,
  FileText,
  Copy,
  FolderOpen,
  CheckCircle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  RotateCw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function SecondBrainPage() {
  const { materials, isProcessing, setIsProcessing, addProcessedMaterial, deleteMaterial } = useMaterialsStore();
  const { addXp, upgradeSkill, updateQuestProgress } = useUserStore();

  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [activeCenterTab, setActiveCenterTab] = useState<'ringkasan' | 'linimasa' | 'soal'>('ringkasan');
  const [activeRightTab, setActiveRightTab] = useState<'flashcard' | 'kuis'>('flashcard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Left form toggle: 'pdf' | 'text'
  const [inputMode, setInputMode] = useState<'pdf' | 'text'>('pdf');
  const [pdfQuestion, setPdfQuestion] = useState('');
  const [pdfAnswer, setPdfAnswer] = useState('');
  const [pdfAnswerSources, setPdfAnswerSources] = useState<string[]>([]);
  const [isAskingPdf, setIsAskingPdf] = useState(false);
  
  // Paste text form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected Material Object
  const selectedMaterial = materials.find(m => m.id === selectedMaterialId) || materials[0] || null;

  useEffect(() => {
    if (selectedMaterial && !selectedMaterialId) {
      setSelectedMaterialId(selectedMaterial.id);
    }
  }, [selectedMaterial, selectedMaterialId]);

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Interactive quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

  // Reset index states when material changes
  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setQuizSubmitted(false);
    setQuizScore({ correct: 0, total: 0 });
  }, [selectedMaterialId]);

  // PDF processing upload handler
  const handlePdfUpload = async (file: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Berkas harus berupa dokumen PDF!');
      return;
    }

    const toastId = toast.loading('Mengunggah dan mengekstrak teks PDF...');
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/pdf/process', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal memproses PDF');
      }

      const result = await res.json();

      const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      
      // Construct a new Material object matching the local store types
      const newMaterial = {
        id: `m-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""), // remove extension
        fileName: file.name,
        fileType: 'pdf',
        fileSize: sizeStr,
        uploadedAt: new Date().toISOString(),
        content: `Konten PDF diringkas oleh AI. Terdeteksi ${result.kataTerdeteksi} kata.`,
        summary: result.ringkasan,
        quizzes: result.kuis.map((q: any, idx: number) => ({
          id: `q-${Date.now()}-${idx}`,
          question: q.pertanyaan,
          options: q.pilihan || ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D', 'Opsi E'],
          correctOptionIndex: typeof q.jawabanBenar === 'string' 
            ? (q.jawabanBenar.charCodeAt(0) - 65) 
            : (q.jawabanBenar || 0),
          explanation: q.pembahasan
        })),
        flashcards: result.flashcard.map((f: any, idx: number) => ({
          id: `fc-${Date.now()}-${idx}`,
          front: f.depan,
          back: f.belakang,
          mastered: false
        })),
        mindmap: [],
        timeline: result.timeline || []
      };

      addProcessedMaterial(newMaterial);
      setSelectedMaterialId(newMaterial.id);
      
      // Update XP & stats
      addXp(100);
      upgradeSkill('creativity', 5);
      updateQuestProgress('planner', 1);

      toast.success('PDF berhasil diringkas dan ditambahkan ke Otak Kedua! (+100 XP)', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(`Error: ${err.message || 'Gagal memproses PDF'}`, { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  // Text pasting upload handler
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Judul dan konten materi harus diisi!');
      return;
    }

    const toastId = toast.loading('Menganalisis teks materi dengan AI...');
    setIsProcessing(true);

    try {
      const sizeStr = `${(content.length / 1024).toFixed(1)} KB`;
      
      const response = await fetch('/api/pdf/process', {
        method: 'POST',
        body: (() => {
          const blob = new Blob([content], { type: 'text/plain' });
          const file = new File([blob], fileName || 'teks_catatan.txt', { type: 'text/plain' });
          const fd = new FormData();
          fd.append('file', file);
          return fd;
        })()
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Gagal menganalisis teks. AI tidak dipanggil bila teks tidak valid.');
      }

      const newMaterial = {
        id: `m-${Date.now()}`,
        title: title.trim(),
        fileName: fileName || 'Catatan Tempel',
        fileType: 'text',
        fileSize: sizeStr,
        uploadedAt: new Date().toISOString(),
        content: content,
        summary: result.ringkasan,
        quizzes: result.kuis.map((q: any, idx: number) => ({
          id: `q-${Date.now()}-${idx}`,
          question: q.pertanyaan,
          options: q.pilihan || ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D', 'Opsi E'],
          correctOptionIndex: typeof q.jawabanBenar === 'string' 
            ? (q.jawabanBenar.charCodeAt(0) - 65) 
            : (q.jawabanBenar || 0),
          explanation: q.pembahasan
        })),
        flashcards: result.flashcard.map((f: any, idx: number) => ({
          id: `fc-${Date.now()}-${idx}`,
          front: f.depan,
          back: f.belakang,
          mastered: false
        })),
        mindmap: [],
        timeline: result.timeline || []
      };

      addProcessedMaterial(newMaterial);
      setSelectedMaterialId(newMaterial.id);

      addXp(50);
      upgradeSkill('creativity', 3);
      updateQuestProgress('planner', 1);

      setTitle('');
      setContent('');
      setFileName('');
      
      toast.success('Materi teks berhasil diproses dan disimpan! (+50 XP)', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error('Gagal memproses materi teks', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  // Drag and drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePdfUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handlePdfUpload(e.target.files[0]);
    }
  };

  const handleAskPdfTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfQuestion.trim()) {
      toast.error('Pertanyaan dokumen tidak boleh kosong.');
      return;
    }
    if (!materials.length) {
      toast.error('Belum ada PDF/catatan di Otak Kedua.');
      return;
    }

    setIsAskingPdf(true);
    setPdfAnswer('');
    setPdfAnswerSources([]);
    const toastId = toast.loading('Tutor PDF mencari jawaban dari konteks dokumen...');

    try {
      const notes = materials.map((mat) => ({
        title: mat.title,
        content: mat.content,
        summary: mat.summary,
      }));
      const response = await fetch('/api/second-brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: pdfQuestion.trim(), notes }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Tutor PDF gagal menjawab dari dokumen.');
      }
      setPdfAnswer(result.answer || 'Gemini tidak mengembalikan jawaban.');
      setPdfAnswerSources(Array.isArray(result.sources) ? result.sources : []);
      toast.success('Jawaban Tutor PDF selesai dibuat dari konteks dokumen.', { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Tutor PDF gagal menjawab.', { id: toastId });
    } finally {
      setIsAskingPdf(false);
    }
  };

  // Filter history based on search
  const filteredMaterials = materials.filter(
    (mat) =>
      mat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mat.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mat.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mat.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle flashcard master action
  const handleMasterFlashcard = (cardId: string) => {
    if (!selectedMaterial) return;
    toast.success('Flashcard ditandai dikuasai! +15 XP');
    addXp(15);
    upgradeSkill('focus', 1);
  };

  // Quiz submission
  const handleQuizSubmit = (correctIdx: number) => {
    if (selectedOption === null || quizSubmitted) return;
    setQuizSubmitted(true);
    
    const isCorrect = selectedOption === correctIdx;
    if (isCorrect) {
      setQuizScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      toast.success('Jawaban Benar! +30 XP');
      addXp(30);
      upgradeSkill('logic', 2);
      updateQuestProgress('quiz', 1);
    } else {
      toast.error('Jawaban Kurang Tepat. Pelajari pembahasannya!');
      addXp(5);
    }
  };

  const handleNextQuiz = () => {
    if (!selectedMaterial) return;
    setSelectedOption(null);
    setQuizSubmitted(false);
    if (currentQuizIndex < selectedMaterial.quizzes.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      // Finished all quizzes, reset to start
      setCurrentQuizIndex(0);
      setQuizScore({ correct: 0, total: 0 });
    }
  };

  return (
    <div className="contrast-safe flex flex-col gap-6 h-full min-h-[calc(100vh-120px)] animate-fade-in text-text-primary">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-secondary/40 border border-border p-5 rounded-lg backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="text-primary w-5 h-5" />
            Otak Kedua <span className="text-primary font-mono text-xs px-2 py-0.5 border border-primary/20 bg-primary/10 rounded-full">SMK Edition</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Unggah dokumen LKS, modul PDF, atau catatan untuk diekstrak AI menjadi ringkasan, timeline belajar, dan kuis.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <span className="text-[10px] text-text-tertiary font-mono uppercase tracking-wider block">Indeks Dokumen</span>
            <span className="text-sm font-bold text-primary font-mono">{materials.length} berkas aktif</span>
          </div>
          <div className="h-8 w-[1px] bg-border hidden md:block"></div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-text-tertiary w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Cari materi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-52 h-9 pl-9 pr-4 bg-bg-secondary border border-border rounded-md text-xs text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted"
            />
          </div>
        </div>
      </div>

      {/* Main 3-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-grow">
        
        {/* PANEL KIRI: UPLOAD & HISTORY (col-span-3) */}
        <div className="lg:col-span-3 flex flex-col gap-6 h-full">
          {/* Upload panel */}
          <Card className="flex flex-col gap-4 p-4 border border-border bg-bg-secondary/20 relative overflow-hidden">
            <div className="flex bg-bg-tertiary/40 border border-border p-1 rounded-md">
              <button
                onClick={() => setInputMode('pdf')}
                className={`flex-1 text-center py-1 rounded text-xs font-semibold cursor-pointer transition-all duration-150 ${
                  inputMode === 'pdf' ? 'bg-primary text-white shadow-xs' : 'text-text-secondary hover:text-white'
                }`}
              >
                Unggah PDF
              </button>
              <button
                onClick={() => setInputMode('text')}
                className={`flex-1 text-center py-1 rounded text-xs font-semibold cursor-pointer transition-all duration-150 ${
                  inputMode === 'text' ? 'bg-primary text-white shadow-xs' : 'text-text-secondary hover:text-white'
                }`}
              >
                Salin Teks
              </button>
            </div>

            {inputMode === 'pdf' ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-36 ${
                  isDragging 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-bg-tertiary/10 hover:border-primary/50 hover:bg-bg-tertiary/20'
                } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                />
                <FileUp className={`w-8 h-8 ${isDragging ? 'text-primary animate-bounce' : 'text-text-tertiary'} mb-2`} />
                <span className="text-xs font-bold text-white block">Seret & Lepas PDF</span>
                <span className="text-[10px] text-text-secondary mt-1 block">Atau klik untuk menelusuri file</span>
                <span className="text-[9px] text-text-muted mt-2 block font-mono">Batas ukuran: 10MB</span>
              </div>
            ) : (
              <form onSubmit={handleTextSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-text-secondary uppercase">Judul Materi</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sel Volta Elektrokimia"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-8 px-2.5 bg-bg-tertiary/50 border border-border rounded text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-text-secondary uppercase">Nama Sumber (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: modul_kimia_12.txt"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full h-8 px-2.5 bg-bg-tertiary/50 border border-border rounded text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-text-secondary uppercase">Isi Catatan / Teks</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tempel ringkasan materi, catatan kelas, atau salinan pelajaran di sini..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-2.5 bg-bg-tertiary/50 border border-border rounded text-xs text-white focus:outline-none focus:border-primary resize-none placeholder:text-text-muted text-[11px]"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isProcessing} 
                  className="w-full h-9 text-xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={12} /> Proses Materi
                </Button>
              </form>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-bg-secondary/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
                <RefreshCw size={24} className="text-primary animate-spin mb-3" />
                <span className="text-xs font-bold text-white">AI Sedang Bekerja...</span>
                <span className="text-[10px] text-text-secondary mt-1">
                  Membaca berkas & menstrukturkan materi ringkasan, kuis, dan timeline.
                </span>
              </div>
            )}
          </Card>

          {/* History Library */}
          <Card className="flex-1 flex flex-col gap-4 p-4 border border-border bg-bg-secondary/20 min-h-[300px]">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-primary" /> Riwayat Dokumen
              </span>
              <span className="text-[10px] text-text-tertiary font-mono">{filteredMaterials.length} berkas</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[40vh] lg:max-h-none pr-1">
              {filteredMaterials.length > 0 ? (
                filteredMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    onClick={() => setSelectedMaterialId(mat.id)}
                    className={`p-3 border rounded-lg transition-all duration-200 cursor-pointer flex flex-col gap-1.5 ${
                      selectedMaterialId === mat.id
                        ? 'border-primary/50 bg-primary-subtle text-white'
                        : 'border-border bg-bg-tertiary/10 hover:border-border-subtle hover:bg-bg-tertiary/20 text-text-secondary hover:text-white'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                        mat.fileType === 'pdf' 
                          ? 'bg-danger-subtle text-danger border-danger/20' 
                          : 'bg-info-subtle text-info border-info/20'
                      }`}>
                        {mat.fileType}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMaterial(mat.id);
                          if (selectedMaterialId === mat.id) {
                            setSelectedMaterialId(null);
                          }
                          toast.success('Materi berhasil dihapus.');
                        }}
                        className="text-text-tertiary hover:text-danger p-0.5 hover:bg-danger-subtle/10 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <h4 className="text-xs font-bold leading-tight truncate-2-lines line-clamp-2">
                      {mat.title}
                    </h4>

                    <div className="flex justify-between items-center text-[9px] text-text-tertiary font-mono border-t border-border/20 pt-1.5 mt-1">
                      <span>{mat.fileSize}</span>
                      <span>{new Date(mat.uploadedAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-[11px] text-text-muted border border-dashed border-border/50 rounded-lg">
                  Tidak ada dokumen di perpustakaan.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* PANEL TENGAH: DETIL RINGKASAN & TIMELINE (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col h-full min-h-[400px]">
          {selectedMaterial ? (
            <Card className="flex-1 flex flex-col gap-4 p-5 border border-border bg-bg-secondary/20 h-full relative">
              {/* Header material */}
              <div className="flex justify-between items-start border-b border-border/40 pb-3 gap-3">
                <div>
                  <h2 className="text-sm font-bold text-white">{selectedMaterial.title}</h2>
                  <p className="text-[10px] text-text-secondary mt-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-text-tertiary" /> {selectedMaterial.fileName} • {selectedMaterial.fileSize}
                  </p>
                </div>
              </div>

              {/* Tabs selector */}
              <div className="flex bg-bg-tertiary/40 border border-border p-1 rounded-md self-start">
                {[
                  { id: 'ringkasan', label: 'Ringkasan Teoretis', icon: BookOpen },
                  { id: 'linimasa', label: 'Linimasa Belajar', icon: Calendar },
                  { id: 'soal', label: 'Daftar Soal', icon: HelpCircle }
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveCenterTab(t.id as any)}
                      className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-all duration-150 flex items-center gap-1.5 ${
                        activeCenterTab === t.id
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-text-secondary hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleAskPdfTutor} className="rounded-lg border border-border bg-bg-tertiary/20 p-3">
                <label className="text-[10px] font-mono font-bold uppercase text-text-secondary">
                  Tanya Tutor PDF berdasarkan dokumen tersimpan
                </label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={pdfQuestion}
                    onChange={(event) => setPdfQuestion(event.target.value)}
                    placeholder="Contoh: Apa kesimpulan utama dokumen ini?"
                    className="min-w-0 flex-1 rounded border border-border bg-bg-primary px-3 py-2 text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary sm:text-xs"
                  />
                  <Button type="submit" disabled={isAskingPdf || !pdfQuestion.trim()} className="h-10 text-xs">
                    {isAskingPdf ? 'Mencari...' : 'Tanya'}
                  </Button>
                </div>
                {pdfAnswer && (
                  <div className="mt-3 rounded border border-border bg-bg-primary p-3">
                    <div className="prose prose-neutral prose-sm max-w-none text-xs prose-headings:text-text-primary prose-p:text-text-secondary prose-li:text-text-secondary">
                      <ReactMarkdown>{pdfAnswer}</ReactMarkdown>
                    </div>
                    {pdfAnswerSources.length > 0 && (
                      <p className="mt-2 text-[10px] font-semibold text-text-tertiary">
                        Sumber konteks: {pdfAnswerSources.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </form>

              {/* Scrollable content container */}
              <div className="flex-grow overflow-y-auto max-h-[50vh] lg:max-h-[60vh] pr-1">
                {activeCenterTab === 'ringkasan' && (
                  <div className="prose prose-invert prose-sm max-w-none text-xs leading-relaxed text-text-secondary prose-headings:text-white prose-a:text-primary">
                    <ReactMarkdown>{selectedMaterial.summary}</ReactMarkdown>
                  </div>
                )}

                {activeCenterTab === 'linimasa' && (
                  <div className="space-y-5 pl-4 border-l border-border relative ml-2 py-2">
                    {selectedMaterial.timeline && selectedMaterial.timeline.length > 0 ? (
                      selectedMaterial.timeline.map((event, idx) => (
                        <div key={event.id || idx} className="relative group">
                          {/* Dotted indicator */}
                          <div className="absolute -left-[23px] top-1.5 bg-bg-primary border-2 border-primary w-3.5 h-3.5 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full group-hover:scale-125 transition-transform"></div>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-mono font-bold text-primary">{event.date}</span>
                            <h4 className="text-xs font-bold text-white">{event.title}</h4>
                            <p className="text-[11px] text-text-secondary leading-relaxed">{event.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-xs text-text-muted border border-dashed border-border/50 rounded-lg">
                        Tidak ada linimasa yang terdeteksi untuk materi ini.
                      </div>
                    )}
                  </div>
                )}

                {activeCenterTab === 'soal' && (
                  <div className="space-y-4">
                    {selectedMaterial.quizzes && selectedMaterial.quizzes.length > 0 ? (
                      selectedMaterial.quizzes.map((q, idx) => (
                        <div key={q.id || idx} className="p-3.5 border border-border bg-bg-tertiary/10 rounded-lg flex flex-col gap-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono font-bold text-primary">SOAL {idx + 1}</span>
                            <Badge variant="primary" className="text-[8px] bg-primary-subtle text-primary border-primary/20">
                              Pilihan Ganda
                            </Badge>
                          </div>
                          <p className="font-semibold text-white leading-relaxed">{q.question}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                            {q.options.map((opt, oIdx) => (
                              <div 
                                key={oIdx} 
                                className={`p-2 border rounded text-[11px] ${
                                  oIdx === q.correctOptionIndex 
                                    ? 'bg-success-subtle text-success border-success/30 font-semibold' 
                                    : 'bg-bg-tertiary/20 text-text-secondary border-border/50'
                                }`}
                              >
                                {opt}
                              </div>
                            ))}
                          </div>
                          <div className="p-2.5 bg-bg-tertiary/30 rounded border border-border/60 text-[10px] text-text-secondary mt-1">
                            <strong className="text-white block mb-0.5 font-semibold">Penjelasan Jawaban:</strong>
                            {q.explanation}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-xs text-text-muted border border-dashed border-border/50 rounded-lg">
                        Tidak ada bank soal terdeteksi untuk materi ini.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="flex-grow flex flex-col items-center justify-center text-center p-8 border border-border bg-bg-secondary/10">
              <BookOpen className="w-12 h-12 text-text-tertiary mb-3 animate-pulse" />
              <h3 className="text-sm font-bold text-white">Otak Kedua Kosong</h3>
              <p className="text-xs text-text-secondary max-w-sm mt-1 leading-relaxed">
                Silakan unggah dokumen PDF baru di panel kiri atau salin materi untuk memicu analisis AI.
              </p>
            </Card>
          )}
        </div>

        {/* PANEL KANAN: FLASHCARD & KUIS INTERAKTIF (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col h-full min-h-[400px]">
          {selectedMaterial ? (
            <Card className="flex-1 flex flex-col gap-4 p-5 border border-border bg-bg-secondary/20 h-full relative justify-between">
              <div>
                {/* Header panel */}
                <div className="flex justify-between items-center border-b border-border/40 pb-2">
                  <span className="text-xs font-bold text-white">Ruang Latihan</span>
                  <div className="flex bg-bg-tertiary/40 border border-border p-1 rounded-md">
                    <button
                      onClick={() => setActiveRightTab('flashcard')}
                      className={`px-3 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-all duration-150 ${
                        activeRightTab === 'flashcard' ? 'bg-primary text-white shadow-xs' : 'text-text-secondary hover:text-white'
                      }`}
                    >
                      Kartu Hafalan
                    </button>
                    <button
                      onClick={() => setActiveRightTab('kuis')}
                      className={`px-3 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-all duration-150 ${
                        activeRightTab === 'kuis' ? 'bg-primary text-white shadow-xs' : 'text-text-secondary hover:text-white'
                      }`}
                    >
                      Kuis Interaktif
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="mt-4">
                  {/* FLASHCARDS */}
                  {activeRightTab === 'flashcard' && (
                    <div className="flex flex-col gap-4">
                      {selectedMaterial.flashcards && selectedMaterial.flashcards.length > 0 ? (
                        <>
                          <div className="flex justify-between items-center text-[10px] text-text-secondary font-mono">
                            <span>KARTU {currentCardIndex + 1} DARI {selectedMaterial.flashcards.length}</span>
                            <span className="text-accent flex items-center gap-1">
                              <RotateCw size={10} /> Klik kartu untuk membalik
                            </span>
                          </div>

                          {/* FlipCard Component */}
                          <div 
                            className="perspective-1000 h-48 cursor-pointer w-full select-none" 
                            onClick={() => setIsFlipped(!isFlipped)}
                          >
                            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                              isFlipped ? 'rotate-y-180' : ''
                            }`}>
                              {/* Front */}
                              <div className="absolute inset-0 bg-bg-tertiary border border-border rounded-xl flex flex-col justify-between p-4 backface-hidden shadow-md">
                                <span className="text-[9px] font-mono font-bold text-text-tertiary uppercase tracking-wider">ISTILAH / PERTANYAAN</span>
                                <p className="text-center text-xs font-bold text-white px-2 leading-relaxed flex-1 flex items-center justify-center">
                                  {selectedMaterial.flashcards[currentCardIndex].front}
                                </p>
                                <span className="text-[8px] text-text-muted text-center font-mono uppercase tracking-widest">TAP UNTUK MELIHAT DEFINISI</span>
                              </div>
                              {/* Back */}
                              <div className="absolute inset-0 bg-primary-subtle border border-primary/30 rounded-xl flex flex-col justify-between p-4 rotate-y-180 backface-hidden shadow-md">
                                <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-wider">DEFINISI / JAWABAN</span>
                                <p className="text-center text-xs font-medium text-white px-2 leading-relaxed flex-1 flex items-center justify-center">
                                  {selectedMaterial.flashcards[currentCardIndex].back}
                                </p>
                                <span className="text-[8px] text-primary text-center font-mono uppercase tracking-widest">TAP UNTUK KEMBALI</span>
                              </div>
                            </div>
                          </div>

                          {/* Nav & mark buttons */}
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                handleMasterFlashcard(selectedMaterial.flashcards[currentCardIndex].id);
                              }}
                              className="flex-1 h-8 text-xs font-semibold bg-success hover:bg-success/90 text-white"
                            >
                              Paham! (+15 XP)
                            </Button>
                          </div>
                          
                          <div className="flex justify-between items-center border-t border-border/40 pt-3 mt-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={currentCardIndex === 0}
                              onClick={() => {
                                setIsFlipped(false);
                                setCurrentCardIndex(prev => prev - 1);
                              }}
                              className="text-[11px] h-7 px-2.5"
                            >
                              ← Mundur
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={currentCardIndex === selectedMaterial.flashcards.length - 1}
                              onClick={() => {
                                setIsFlipped(false);
                                setCurrentCardIndex(prev => prev + 1);
                              }}
                              className="text-[11px] h-7 px-2.5"
                            >
                              Maju →
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-10 text-xs text-text-muted border border-dashed border-border/50 rounded-lg">
                          Tidak ada kartu hafalan untuk materi ini.
                        </div>
                      )}
                    </div>
                  )}

                  {/* INTERACTIVE QUIZ */}
                  {activeRightTab === 'kuis' && (
                    <div className="flex flex-col gap-4">
                      {selectedMaterial.quizzes && selectedMaterial.quizzes.length > 0 ? (
                        <>
                          <div className="flex justify-between items-center text-[10px] text-text-secondary font-mono">
                            <span>SOAL {currentQuizIndex + 1} DARI {selectedMaterial.quizzes.length}</span>
                            <span className="text-primary font-bold">Skor: {quizScore.correct}/{quizScore.total}</span>
                          </div>

                          <div className="flex flex-col gap-3">
                            <p className="text-xs font-bold text-white leading-relaxed">
                              {selectedMaterial.quizzes[currentQuizIndex].question}
                            </p>

                            <div className="space-y-2">
                              {selectedMaterial.quizzes[currentQuizIndex].options.map((opt, idx) => {
                                const isSelected = selectedOption === idx;
                                const isCorrectAnswer = idx === selectedMaterial.quizzes[currentQuizIndex].correctOptionIndex;
                                
                                let btnClass = 'border-border bg-bg-tertiary/30 hover:bg-bg-tertiary text-text-secondary hover:text-white';
                                
                                if (isSelected) {
                                  btnClass = 'border-primary bg-primary/15 text-white font-semibold';
                                }

                                if (quizSubmitted) {
                                  if (isCorrectAnswer) {
                                    btnClass = 'border-success bg-success-subtle text-success font-semibold';
                                  } else if (isSelected) {
                                    btnClass = 'border-danger bg-danger-subtle text-danger font-semibold';
                                  } else {
                                    btnClass = 'border-border/30 bg-bg-tertiary/10 text-text-tertiary cursor-not-allowed opacity-50';
                                  }
                                }

                                return (
                                  <button
                                    key={idx}
                                    disabled={quizSubmitted}
                                    onClick={() => setSelectedOption(idx)}
                                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all duration-150 flex items-center justify-between cursor-pointer ${btnClass}`}
                                  >
                                    <span>{opt}</span>
                                    {quizSubmitted && isCorrectAnswer && <CheckCircle2 size={13} className="text-success flex-shrink-0 ml-2" />}
                                    {quizSubmitted && isSelected && !isCorrectAnswer && <AlertCircle size={13} className="text-danger flex-shrink-0 ml-2" />}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Actions & Explanations */}
                            {!quizSubmitted ? (
                              <Button
                                onClick={() => {
                                  setQuizScore(prev => ({ ...prev, total: prev.total + 1 }));
                                  handleQuizSubmit(selectedMaterial.quizzes[currentQuizIndex].correctOptionIndex);
                                }}
                                disabled={selectedOption === null}
                                className="w-full h-8 text-[11px] font-semibold mt-1"
                              >
                                Kirim Jawaban
                              </Button>
                            ) : (
                              <div className="flex flex-col gap-3">
                                <div className={`p-2.5 rounded border text-[10px] leading-relaxed ${
                                  selectedOption === selectedMaterial.quizzes[currentQuizIndex].correctOptionIndex
                                    ? 'border-success/30 bg-success/5 text-success'
                                    : 'border-danger/30 bg-danger/5 text-text-secondary'
                                }`}>
                                  <span className="font-bold block mb-0.5"> Pembahasan:</span>
                                  {selectedMaterial.quizzes[currentQuizIndex].explanation}
                                </div>
                                <Button
                                  onClick={handleNextQuiz}
                                  className="w-full h-8 text-[11px] font-semibold bg-bg-tertiary border border-border hover:bg-bg-hover text-white flex items-center justify-center gap-1"
                                >
                                  {currentQuizIndex < selectedMaterial.quizzes.length - 1 ? 'Soal Selanjutnya →' : 'Ulangi Kuis ↺'}
                                </Button>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-10 text-xs text-text-muted border border-dashed border-border/50 rounded-lg">
                          Tidak ada kuis untuk materi ini.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Floating study helper advice */}
              <div className="border-t border-border/40 pt-3 mt-4 text-[10px] text-text-tertiary leading-relaxed bg-bg-tertiary/20 p-2.5 rounded-lg border border-border/30">
                <span className="font-bold text-white flex items-center gap-1 mb-0.5">
                  <Sparkles size={11} className="text-accent" /> Tips Belajar Aktif:
                </span>
                Lakukan pengulangan berkala (Spaced Repetition) dengan Kartu Hafalan di atas. Gunakan Kuis Interaktif untuk menguji pemahaman konsep sebelum UTS/UAS.
              </div>
            </Card>
          ) : (
            <Card className="flex-grow flex flex-col items-center justify-center text-center p-8 border border-border bg-bg-secondary/10">
              <Layers className="w-10 h-10 text-text-tertiary mb-2" />
              <p className="text-[11px] text-text-muted">Pilih dokumen di sebelah kiri untuk membuka ruang latihan.</p>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
