'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Sparkles, 
  HelpCircle, 
  BookOpen, 
  Settings, 
  Plus, 
  Filter,
  CheckCircle,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Brain,
  Tag,
  BookMarked,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { useUserStore } from '@/stores/user-store';
import { resolveJurusanKode } from '@/lib/data/jurusan';

interface Jurusan {
  id: string;
  kode: string;
  nama: string;
  bidang: string;
}

interface MataPelajaran {
  id: string;
  kode: string;
  nama: string;
  kelas: number;
  semester: number;
}

interface Soal {
  id: string;
  mataPelajaranId: string;
  pertanyaan: string;
  tipe: string;
  pilihan: string[];
  jawabanBenar: string;
  pembahasan: string;
  tingkat: string;
  kelas: number;
  sumber: string | null;
  tags: string[];
}

export default function BankSoalPage() {
  const { profile } = useUserStore();
  const profileJurusanKode = resolveJurusanKode(profile.selectedPathway);
  // Data lists
  const [jurusans, setJurusans] = useState<Jurusan[]>([]);
  const [mapels, setMapels] = useState<MataPelajaran[]>([]);
  const [soalList, setSoalList] = useState<Soal[]>([]);
  
  // Loading states
  const [loadingJurusans, setLoadingJurusans] = useState(true);
  const [loadingMapels, setLoadingMapels] = useState(false);
  const [loadingSoal, setLoadingSoal] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  // Filters state
  const [selectedJurusanKode, setSelectedJurusanKode] = useState<string>(profileJurusanKode);
  const [selectedMapelId, setSelectedMapelId] = useState<string>('');
  const [selectedKelas, setSelectedKelas] = useState<string>('Semua');
  const [selectedTingkat, setSelectedTingkat] = useState<string>('Semua');
  const [selectedTipe, setSelectedTipe] = useState<string>('Semua');
  const [selectedTopik, setSelectedTopik] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewedSoalIds, setViewedSoalIds] = useState<string[]>([]);

  // Expand states for questions
  const [expandedSoalId, setExpandedSoalId] = useState<string | null>(null);

  // Modal generate AI states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiTopik, setAiTopik] = useState('');
  const [aiJumlah, setAiJumlah] = useState(5);
  const [aiTingkat, setAiTingkat] = useState<'mudah' | 'sedang' | 'sukar'>('sedang');
  const [aiKelas, setAiKelas] = useState(11);

  useEffect(() => {
    const stored = window.localStorage.getItem('academy_os_viewed_bank_soal');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setViewedSoalIds(parsed);
      } catch {
        setViewedSoalIds([]);
      }
    }
  }, []);

  // Load Jurusans
  useEffect(() => {
    async function loadJurusans() {
      try {
        const res = await fetch('/api/jurusan');
        if (!res.ok) throw new Error();
        const data = await res.json();
        setJurusans(data);
        if (data.length > 0) {
          const defaultJurusan = data.find((j: any) => j.kode === profileJurusanKode) || data[0];
          setSelectedJurusanKode(defaultJurusan.kode);
        }
      } catch (err) {
        toast.error('Gagal memuat daftar jurusan.');
      } finally {
        setLoadingJurusans(false);
      }
    }
    loadJurusans();
  }, [profileJurusanKode]);

  // Load Mata Pelajaran based on Jurusan
  useEffect(() => {
    if (!selectedJurusanKode) return;
    async function loadMapels() {
      setLoadingMapels(true);
      try {
        const res = await fetch(`/api/jurusan/${selectedJurusanKode}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setMapels(data.mataPelajaran || []);
        if (data.mataPelajaran && data.mataPelajaran.length > 0) {
          setSelectedMapelId(data.mataPelajaran[0].id);
        } else {
          setSelectedMapelId('');
          setSoalList([]);
        }
      } catch (err) {
        toast.error('Gagal memuat mata pelajaran.');
      } finally {
        setLoadingMapels(false);
      }
    }
    loadMapels();
  }, [selectedJurusanKode]);

  // Load Soal list based on Mapel & filters
  useEffect(() => {
    if (!selectedMapelId) return;
    async function loadSoal() {
      setLoadingSoal(true);
      try {
        const params = new URLSearchParams();
        if (selectedKelas !== 'Semua') params.append('kelas', selectedKelas);
        if (selectedTingkat !== 'Semua') params.append('tingkat', selectedTingkat);
        if (selectedTipe !== 'Semua') params.append('tipe', selectedTipe);

        params.append('includeAnswers', 'true');
        const res = await fetch(`/api/jurusan/${selectedJurusanKode}/mapel/${selectedMapelId}/bank-soal?${params.toString()}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSoalList(data);
      } catch (err) {
        toast.error('Gagal memuat bank soal.');
      } finally {
        setLoadingSoal(false);
      }
    }
    loadSoal();
  }, [selectedJurusanKode, selectedMapelId, selectedKelas, selectedTingkat, selectedTipe]);

  // Handle AI generate form submit
  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (generatingAI) return;
    if (!aiTopik.trim()) {
      toast.error('Topik materi harus diisi!');
      return;
    }
    if (!selectedMapelId) {
      toast.error('Pilih mata pelajaran terlebih dahulu!');
      return;
    }

    setGeneratingAI(true);
    const toastId = toast.loading('AI sedang merancang soal kejuruan...');

    try {
      const res = await fetch('/api/ai/generate-soal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mataPelajaranId: selectedMapelId,
          topik: aiTopik.trim(),
          jumlah: aiJumlah,
          tingkat: aiTingkat,
          kelas: aiKelas
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal generate soal AI');
      }

      const result = await res.json();
      
      // Reload current soal list
      const params = new URLSearchParams();
      if (selectedKelas !== 'Semua') params.append('kelas', selectedKelas);
      if (selectedTingkat !== 'Semua') params.append('tingkat', selectedTingkat);
      if (selectedTipe !== 'Semua') params.append('tipe', selectedTipe);

      params.append('includeAnswers', 'true');
      const refetchRes = await fetch(`/api/jurusan/${selectedJurusanKode}/mapel/${selectedMapelId}/bank-soal?${params.toString()}`);
      if (refetchRes.ok) {
        const data = await refetchRes.json();
        setSoalList(data);
      }

      setIsModalOpen(false);
      setAiTopik('');
      toast.success(`${result.data.length} soal berhasil digenerate dan dimasukkan ke DB!`, { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(`Error: ${err.message || 'Gagal memproses soal'}`, { id: toastId });
    } finally {
      setGeneratingAI(false);
    }
  };

  // Search filter
  const topicOptions = Array.from(new Set(soalList.flatMap(s => s.tags || []))).sort();
  const markSoalViewed = (id: string) => {
    setViewedSoalIds((current) => {
      if (current.includes(id)) return current;
      const next = [...current, id];
      window.localStorage.setItem('academy_os_viewed_bank_soal', JSON.stringify(next));
      return next;
    });
  };

  const filteredSoal = soalList.filter((s) => {
    const matchesSearch =
      s.pertanyaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.sumber && s.sumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTopic = selectedTopik === 'Semua' || s.tags.includes(selectedTopik);
    const isViewed = viewedSoalIds.includes(s.id);
    const matchesStatus =
      selectedStatus === 'Semua' ||
      (selectedStatus === 'Belum Dibuka' && !isViewed) ||
      (selectedStatus === 'Sudah Dibuka' && isViewed);

    return matchesSearch && matchesTopic && matchesStatus;
  });

  return (
    <div className="contrast-safe flex flex-col gap-6 animate-fade-in text-text-primary">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-secondary/40 border border-border p-5 rounded-lg backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookMarked className="text-primary w-5 h-5" />
            Bank Soal Kejuruan <span className="text-secondary font-mono text-xs px-2 py-0.5 border border-secondary/20 bg-secondary/10 rounded-full">Merdeka Belajar</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Arsip soal latihan produktif SMK terstruktur berdasarkan standar asesmen industri. Dukungan Generator AI terintegrasi.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={selectedMapelId ? `/ujian/${selectedMapelId}?mode=latihan_santai` : '#'} aria-disabled={!selectedMapelId}>
            <Button
              disabled={!selectedMapelId}
              variant="secondary"
              className="text-xs flex items-center gap-1.5 h-10 px-4"
            >
              <CheckCircle size={14} /> Mulai Latihan
            </Button>
          </Link>
          <Link href={selectedMapelId ? `/ujian/${selectedMapelId}?mode=ujian_bab` : '#'} aria-disabled={!selectedMapelId}>
            <Button
              disabled={!selectedMapelId}
              className="text-xs bg-accent hover:bg-accent-hover text-black flex items-center gap-1.5 h-10 px-4"
            >
              <AlertCircle size={14} /> Mode Ujian
            </Button>
          </Link>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="text-xs bg-primary hover:bg-primary-hover text-white flex items-center gap-1.5 h-10 px-4"
          >
            <Sparkles size={14} /> Generate Soal AI
          </Button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* SIDEBAR FILTER (col-span-1) */}
        <Card className="lg:col-span-1 p-5 flex flex-col gap-5 border border-border bg-bg-secondary/20">
          <div className="flex items-center gap-1.5 border-b border-border/40 pb-2">
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Penyaringan Soal</span>
          </div>

          {/* Jurusan selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-text-secondary uppercase">Kompetensi Keahlian (Jurusan)</label>
            <select
              value={selectedJurusanKode}
              onChange={(e) => setSelectedJurusanKode(e.target.value)}
              className="w-full h-9 px-2 bg-bg-tertiary border border-border rounded text-xs text-white focus:outline-none focus:border-primary"
            >
              {loadingJurusans ? (
                <option>Memuat...</option>
              ) : (
                jurusans.map((j) => (
                  <option key={j.id} value={j.kode}>
                    {j.kode} - {j.nama}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Mata Pelajaran selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-text-secondary uppercase">Mata Pelajaran</label>
            <select
              value={selectedMapelId}
              disabled={loadingMapels || mapels.length === 0}
              onChange={(e) => setSelectedMapelId(e.target.value)}
              className="w-full h-9 px-2 bg-bg-tertiary border border-border rounded text-xs text-white focus:outline-none focus:border-primary disabled:opacity-50"
            >
              {loadingMapels ? (
                <option>Memuat mapel...</option>
              ) : mapels.length === 0 ? (
                <option>Tidak ada mapel</option>
              ) : (
                mapels.map((m) => (
                  <option key={m.id} value={m.id}>
                    Kelas {m.kelas} - {m.nama}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Kelas selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-text-secondary uppercase">Tingkat Kelas</label>
            <div className="grid grid-cols-4 gap-1.5">
              {['Semua', '10', '11', '12'].map((k) => (
                <button
                  key={k}
                  onClick={() => setSelectedKelas(k)}
                  className={`h-7 rounded text-[11px] font-semibold transition-all border cursor-pointer ${
                    selectedKelas === k
                      ? 'bg-primary border-primary text-white'
                      : 'bg-bg-tertiary border-border text-text-secondary hover:text-white'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Kesulitan selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-text-secondary uppercase">Tingkat Kesulitan</label>
            <div className="grid grid-cols-2 gap-1.5">
              {['Semua', 'mudah', 'sedang', 'sukar'].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTingkat(t)}
                  className={`h-7 rounded text-[11px] font-semibold transition-all border capitalize cursor-pointer ${
                    selectedTingkat === t
                      ? 'bg-primary border-primary text-white'
                      : 'bg-bg-tertiary border-border text-text-secondary hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Tipe selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-text-secondary uppercase">Tipe Evaluasi</label>
            <select
              value={selectedTipe}
              onChange={(e) => setSelectedTipe(e.target.value)}
              className="w-full h-9 px-2 bg-bg-tertiary border border-border rounded text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value="Semua">Semua Tipe</option>
              <option value="pilihan_ganda">Pilihan Ganda</option>
              <option value="benar_salah">Benar / Salah</option>
              <option value="essay">Essay / Uraian</option>
              <option value="isian">Isian Singkat</option>
            </select>
          </div>

          {/* Topik selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-text-secondary uppercase">Topik / Tag</label>
            <select
              value={selectedTopik}
              onChange={(e) => setSelectedTopik(e.target.value)}
              className="w-full h-9 px-2 bg-bg-tertiary border border-border rounded text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value="Semua">Semua Topik</option>
              {topicOptions.map((topic) => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>

          {/* Review status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-text-secondary uppercase">Status Latihan</label>
            <div className="grid grid-cols-1 gap-1.5">
              {['Semua', 'Belum Dibuka', 'Sudah Dibuka'].map((status) => {
                const Icon = status === 'Sudah Dibuka' ? Eye : EyeOff;
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`h-8 rounded text-[11px] font-semibold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedStatus === status
                        ? 'bg-accent border-border text-black shadow-[2px_2px_0_#1a1c1c]'
                        : 'bg-bg-tertiary border-border text-text-secondary hover:text-white'
                    }`}
                  >
                    <Icon size={12} /> {status}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* LIST SOAL PREVIEW (col-span-3) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Search bar */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-3 text-text-tertiary w-4 h-4" />
            <input
              type="text"
              placeholder="Cari kata kunci dalam pertanyaan, tags, atau sumber soal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-bg-secondary border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-primary transition-all placeholder:text-text-muted"
            />
          </div>

          {/* List content */}
          <div className="space-y-4">
            {loadingSoal ? (
              <div className="text-center py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-text-secondary">Memuat bank soal...</span>
              </div>
            ) : filteredSoal.length > 0 ? (
              filteredSoal.map((soal, idx) => {
                const isExpanded = expandedSoalId === soal.id;
                return (
                  <Card key={soal.id} className="p-5 border border-border bg-bg-secondary/20 hover:border-border-subtle hover:bg-bg-secondary/30 transition-all flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs font-mono font-bold text-primary">PERTANYAAN {idx + 1}</span>
                        <Badge variant="primary" className="text-[8px] bg-primary-subtle text-primary border-primary/20 capitalize">
                          {soal.tipe.replace('_', ' ')}
                        </Badge>
                        <Badge variant={soal.tingkat === 'mudah' ? 'success' : soal.tingkat === 'sedang' ? 'warning' : 'danger'} className="text-[8px] capitalize">
                          {soal.tingkat}
                        </Badge>
                        <Badge variant="secondary" className="text-[8px]">
                          Kelas {soal.kelas}
                        </Badge>
                      </div>
                      
                      <button
                        onClick={() => {
                          setExpandedSoalId(isExpanded ? null : soal.id);
                          if (!isExpanded) markSoalViewed(soal.id);
                        }}
                        className="text-text-tertiary hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {isExpanded ? (
                          <>Sembunyikan Pembahasan <ChevronUp size={14} /></>
                        ) : (
                          <>Lihat Pembahasan <ChevronDown size={14} /></>
                        )}
                      </button>
                    </div>

                    <p className="text-xs font-medium text-white leading-relaxed whitespace-pre-line">
                      {soal.pertanyaan}
                    </p>

                    {/* Options list if PG */}
                    {soal.tipe === 'pilihan_ganda' && soal.pilihan && soal.pilihan.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                        {soal.pilihan.map((opt, oIdx) => {
                          const optLetter = String.fromCharCode(65 + oIdx); // 'A', 'B', etc.
                          const isCorrect = soal.jawabanBenar.trim().startsWith(optLetter) || soal.jawabanBenar.trim() === optLetter;
                          
                          return (
                            <div
                              key={oIdx}
                              className={`p-2.5 border rounded text-xs flex items-center gap-2 ${
                                isExpanded && isCorrect
                                  ? 'bg-success-subtle border-success/30 text-success font-semibold'
                                  : 'bg-bg-tertiary/20 border-border/50 text-text-secondary'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isExpanded && isCorrect
                                  ? 'bg-success text-white'
                                  : 'bg-bg-hover text-text-tertiary'
                              }`}>
                                {optLetter}
                              </span>
                              <span>{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-2 border-t border-border/40 pt-4 flex flex-col gap-3">
                        <div className="p-3 bg-bg-tertiary/30 rounded border border-border/80 text-[11px] text-text-secondary leading-relaxed">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <CheckCircle2 size={13} className="text-success" />
                            <strong className="text-white text-xs font-semibold">Kunci Jawaban Benar:</strong>
                            <Badge variant="success" className="text-[9px]">{soal.jawabanBenar}</Badge>
                          </div>
                          <p className="mt-1">
                            <strong className="text-white block mb-0.5">Penjelasan & Pembahasan:</strong>
                            {soal.pembahasan}
                          </p>
                        </div>

                        {soal.sumber && (
                          <div className="text-[10px] text-text-tertiary flex items-center justify-between">
                            <span>Sumber: <span className="text-text-secondary font-mono">{soal.sumber}</span></span>
                            <span>Sistem Asesmen BelajarKU</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tags row */}
                    {soal.tags && soal.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 border-t border-border/10 pt-2.5">
                        {soal.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="inline-flex items-center gap-1 text-[9px] bg-bg-tertiary/40 border border-border px-2 py-0.5 rounded text-text-tertiary">
                            <Tag size={8} /> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-16 border border-dashed border-border rounded-lg p-6 bg-bg-secondary/10">
                <HelpCircle className="w-12 h-12 text-text-tertiary mb-3 mx-auto" />
                <h3 className="text-sm font-bold text-white">Soal Tidak Ditemukan</h3>
                <p className="text-xs text-text-secondary max-w-md mx-auto mt-1 leading-relaxed">
                  Tidak ada soal yang cocok dengan filter aktif. Coba ubah saringan atau gunakan tombol <strong>Generate Soal AI</strong> di kanan atas untuk merancang soal baru.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* GENERATE SOAL AI MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <Card className="w-full max-w-md p-6 bg-bg-secondary border border-border flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Brain className="text-primary w-4 h-4" />
                Generator Soal AI (Claude 3.5)
              </h3>
              <button 
                onClick={() => !generatingAI && setIsModalOpen(false)}
                className="text-text-tertiary hover:text-white font-bold cursor-pointer disabled:opacity-50 text-xs"
                disabled={generatingAI}
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleGenerateAI} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-text-secondary uppercase">Topik Materi Spesifik</label>
                <input
                  type="text"
                  required
                  disabled={generatingAI}
                  placeholder="Contoh: Subnetting IP Klas C, OOP Inheritansi, dll."
                  value={aiTopik}
                  onChange={(e) => setAiTopik(e.target.value)}
                  className="w-full h-9 px-3 bg-bg-tertiary border border-border rounded text-xs text-white focus:outline-none focus:border-primary disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-text-secondary uppercase">Jumlah Soal</label>
                  <select
                    disabled={generatingAI}
                    value={aiJumlah}
                    onChange={(e) => setAiJumlah(parseInt(e.target.value))}
                    className="w-full h-9 px-2 bg-bg-tertiary border border-border rounded text-xs text-white focus:outline-none focus:border-primary disabled:opacity-50"
                  >
                    {[3, 5, 8, 10].map((n) => (
                      <option key={n} value={n}>{n} Soal</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-text-secondary uppercase">Tingkat Kesulitan</label>
                  <select
                    disabled={generatingAI}
                    value={aiTingkat}
                    onChange={(e) => setAiTingkat(e.target.value as any)}
                    className="w-full h-9 px-2 bg-bg-tertiary border border-border rounded text-xs text-white focus:outline-none focus:border-primary disabled:opacity-50 animate-fade-in"
                  >
                    <option value="mudah">Mudah</option>
                    <option value="sedang">Sedang (HOTS)</option>
                    <option value="sukar">Sukar (Analitis)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-text-secondary uppercase">Sasaran Kelas</label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 11, 12].map((kls) => (
                    <button
                      key={kls}
                      type="button"
                      disabled={generatingAI}
                      onClick={() => setAiKelas(kls)}
                      className={`h-8 rounded text-xs font-semibold transition-all border cursor-pointer ${
                        aiKelas === kls
                          ? 'bg-primary border-primary text-white font-bold'
                          : 'bg-bg-tertiary border-border text-text-secondary hover:text-white'
                      }`}
                    >
                      Kelas {kls}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/40 pt-4 mt-2">
                <Button 
                  type="submit" 
                  disabled={generatingAI} 
                  className="w-full h-10 text-xs flex items-center justify-center gap-1.5 font-bold"
                >
                  {generatingAI ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Menyusun Soal & Pembahasan AI...
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      Rancang Soal AI Sekarang
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
