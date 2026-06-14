'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { useUserStore } from '@/stores/user-store';
import { 
  ArrowLeft, ArrowRight, Play, BookOpen, FileText, CheckCircle, 
  ChevronRight, ChevronDown, Sparkles, MessageSquare, BookMarked, 
  HelpCircle, ExternalLink, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import ChatDrawer from '@/components/chat-drawer';

interface Materi {
  id: string;
  babId: string;
  judul: string;
  tipe: string; // teks, video, pdf, ringkasan
  konten: string;
  urutan: number;
  selesai?: boolean;
}

interface Bab {
  id: string;
  mataPelajaranId: string;
  nomor: number;
  judul: string;
  deskripsi: string;
  estimasiMenit: number;
  materi: Materi[];
}

interface MapelDetail {
  id: string;
  jurusanId: string;
  kode: string;
  nama: string;
  kelas: number;
  semester: number;
  deskripsi: string;
  bab: Bab[];
}

function parseStructuredResource(konten: string) {
  try {
    return JSON.parse(konten);
  } catch {
    return null;
  }
}

export default function BelajarPage({
  params,
}: {
  params: Promise<{ jurusan: string; mapel: string; bab: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { jurusan: jurusanKode, mapel: mapelId, bab: babId } = resolvedParams;

  const [mapel, setMapel] = useState<MapelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMateri, setActiveMateri] = useState<Materi | null>(null);
  const [expandedBabs, setExpandedBabs] = useState<Record<string, boolean>>({});
  const [materiProgress, setMateriProgress] = useState<Record<string, boolean>>({});
  const [submittingProgress, setSubmittingProgress] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { addXp, profile } = useUserStore();
  const contentAreaRef = useRef<HTMLDivElement>(null);

  // Load Mapel details when mapelId or jurusanKode changes
  useEffect(() => {
    let active = true;
    async function loadMapelData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/jurusan/${jurusanKode}/mapel/${mapelId}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data: MapelDetail = await response.json();
        if (!active) return;
        setMapel(data);

        // Map progress state
        const progressMap: Record<string, boolean> = {};
        data.bab.forEach((b) => {
          b.materi.forEach((m) => {
            progressMap[m.id] = !!m.selesai;
          });
        });
        setMateriProgress(progressMap);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat materi pembelajaran.');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadMapelData();
    return () => {
      active = false;
    };
  }, [jurusanKode, mapelId]);

  // Set active materi when babId or mapel changes
  useEffect(() => {
    if (!mapel) return;

    // Expand current bab by default
    setExpandedBabs((prev) => ({
      ...prev,
      [babId]: true,
    }));

    // If activeMateri is already set and belongs to this bab, don't reset it
    if (activeMateri && activeMateri.babId === babId) {
      return;
    }

    // Find current bab and set first materi
    const currentBab = mapel.bab.find((b) => b.id === babId);
    if (currentBab && currentBab.materi.length > 0) {
      setActiveMateri(currentBab.materi[0]);
    }
  }, [babId, mapel, activeMateri]);

  // Flattened materi list for navigation
  const flatMateriList = React.useMemo(() => {
    if (!mapel) return [];
    const list: { materi: Materi; babId: string; mapelName: string }[] = [];
    mapel.bab.forEach((b) => {
      b.materi.forEach((m) => {
        list.push({ materi: m, babId: b.id, mapelName: mapel.nama });
      });
    });
    return list;
  }, [mapel]);

  const activeIndex = flatMateriList.findIndex((item) => item.materi.id === activeMateri?.id);

  const goToNextMateri = React.useCallback(() => {
    if (activeIndex !== -1 && activeIndex < flatMateriList.length - 1) {
      const nextItem = flatMateriList[activeIndex + 1];
      setActiveMateri(nextItem.materi);
      if (nextItem.babId !== babId) {
        // Expand next bab
        setExpandedBabs((prev) => ({ ...prev, [nextItem.babId]: true }));
        router.push(`/belajar/${jurusanKode}/${mapelId}/${nextItem.babId}`);
      }
      contentAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeIndex, flatMateriList, babId, jurusanKode, mapelId, router]);

  const goToPrevMateri = React.useCallback(() => {
    if (activeIndex > 0) {
      const prevItem = flatMateriList[activeIndex - 1];
      setActiveMateri(prevItem.materi);
      if (prevItem.babId !== babId) {
        // Expand prev bab
        setExpandedBabs((prev) => ({ ...prev, [prevItem.babId]: true }));
        router.push(`/belajar/${jurusanKode}/${mapelId}/${prevItem.babId}`);
      }
      contentAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeIndex, flatMateriList, babId, jurusanKode, mapelId, router]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'ArrowRight') {
        goToNextMateri();
      } else if (e.key === 'ArrowLeft') {
        goToPrevMateri();
      } else if (e.key === 'ArrowDown') {
        contentAreaRef.current?.scrollBy({ top: 150, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextMateri, goToPrevMateri]);

  // Mark Materi as completed
  const handleMarkCompleted = async (materiId: string) => {
    if (materiProgress[materiId]) return;
    setSubmittingProgress(materiId);
    try {
      const res = await fetch(`/api/materi/${materiId}/selesai`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to save progress');
      const data = await res.json();

      setMateriProgress((prev) => ({
        ...prev,
        [materiId]: true,
      }));

      // Add XP locally to Zustand store
      addXp(data.xpEarned || 20);
      toast.success(data.message || 'Materi selesai! +20 XP');
    } catch (e) {
      console.error(e);
      toast.error('Gagal menyimpan kemajuan belajar.');
    } finally {
      setSubmittingProgress(null);
    }
  };

  // Calculate Progress in this Bab
  const currentBab = mapel?.bab.find((b) => b.id === babId);
  const { completedCount, totalCount, percentage } = React.useMemo(() => {
    if (!currentBab) return { completedCount: 0, totalCount: 0, percentage: 0 };
    const total = currentBab.materi.length;
    let completed = 0;
    currentBab.materi.forEach((m) => {
      if (materiProgress[m.id]) completed++;
    });
    return {
      completedCount: completed,
      totalCount: total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [currentBab, materiProgress]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg-primary text-text-secondary space-y-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-medium">Memuat modul belajar kejuruan...</p>
      </div>
    );
  }

  if (!mapel || !activeMateri) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg-primary text-text-secondary p-4 text-center">
        <h2 className="text-lg font-bold text-danger">Modul Tidak Ditemukan</h2>
        <p className="text-xs text-text-tertiary mt-2">Materi yang Anda minta tidak dapat dimuat.</p>
        <Link href="/dashboard" className="mt-4">
          <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-xs font-semibold">
            Kembali ke Beranda
          </button>
        </Link>
      </div>
    );
  }

  const getMateriIcon = (tipe: string) => {
    switch (tipe) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'ringkasan':
        return <BookMarked className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const structuredResource = activeMateri ? parseStructuredResource(activeMateri.konten) : null;

  return (
    <div className="contrast-safe min-h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] bg-bg-primary text-text-primary">
      
      {/* PANEL KIRI: DAFTAR BAB & MATERI */}
      <div className="border-r border-border bg-bg-secondary p-4 flex flex-col overflow-y-auto max-h-[calc(100vh-64px)]">
        <div className="mb-4">
          <Link href="/dashboard" className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Beranda Belajar</span>
          </Link>
          <h2 className="text-base font-bold leading-tight mt-1">{mapel.nama}</h2>
          <div className="flex items-center space-x-2 mt-1.5">
            <span className="text-[10px] bg-primary-subtle text-primary border border-primary/20 px-1.5 py-0.5 rounded font-bold">
              Kelas {mapel.kelas}
            </span>
            <span className="text-[10px] bg-bg-hover text-text-secondary px-1.5 py-0.5 rounded border border-border">
              Semester {mapel.semester}
            </span>
          </div>
        </div>

        <div className="space-y-3 flex-1">
          {mapel.bab.map((b) => {
            const isExpanded = expandedBabs[b.id];
            const isCurrentBab = b.id === babId;

            return (
              <div key={b.id} className="border border-border/80 rounded-lg overflow-hidden bg-bg-primary">
                <button
                  onClick={() => setExpandedBabs((prev) => ({ ...prev, [b.id]: !isExpanded }))}
                  className={`w-full p-3 text-left flex items-start justify-between transition-colors ${
                    isCurrentBab ? 'bg-primary-subtle/30 border-b border-primary/10' : 'hover:bg-bg-hover/30'
                  }`}
                >
                  <div className="pr-2">
                    <p className="text-[10px] font-bold text-primary/80 uppercase tracking-wider">Bab {b.nomor}</p>
                    <p className="text-xs font-bold leading-snug mt-0.5">{b.judul.replace(`Bab ${b.nomor}: `, '')}</p>
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4 shrink-0 text-text-tertiary" /> : <ChevronRight className="w-4 h-4 shrink-0 text-text-tertiary" />}
                </button>

                {isExpanded && (
                  <div className="p-2 space-y-1 bg-bg-secondary/40">
                    {b.materi.map((m) => {
                      const isActive = activeMateri?.id === m.id;
                      const isCompleted = materiProgress[m.id];
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            setActiveMateri(m);
                            if (b.id !== babId) {
                              router.push(`/belajar/${jurusanKode}/${mapelId}/${b.id}`);
                            }
                          }}
                          className={`w-full p-2 rounded flex items-center justify-between text-left transition-colors text-xs ${
                            isActive
                              ? 'bg-primary text-white font-semibold'
                              : 'hover:bg-bg-hover/50 text-text-secondary'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <span className={isActive ? 'text-white' : 'text-primary'}>
                              {getMateriIcon(m.tipe)}
                            </span>
                            <span className="truncate">{m.judul}</span>
                          </div>
                          {isCompleted ? (
                            <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-success'}`} />
                          ) : (
                            isActive && <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* PANEL TENGAH: AREA BACA UTAMA */}
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        
        {/* HEADER PROGRESS BAR */}
        <div className="bg-bg-secondary border-b border-border px-6 py-3 flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="flex items-center justify-between text-[11px] font-bold text-text-secondary mb-1">
              <span>Kemajuan Bab {currentBab?.nomor || 1}</span>
              <span className="text-primary">{percentage}% Selesai</span>
            </div>
            <div className="w-full h-1.5 bg-bg-hover rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center space-x-2 pl-4">
            <button
              onClick={() => handleMarkCompleted(activeMateri.id)}
              disabled={materiProgress[activeMateri.id] || submittingProgress === activeMateri.id}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center space-x-1.5 border transition-all ${
                materiProgress[activeMateri.id]
                  ? 'bg-success/10 border-success/20 text-success cursor-default'
                  : 'bg-primary hover:bg-primary-hover border-primary text-white hover:scale-[1.02]'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{materiProgress[activeMateri.id] ? 'Selesai ✓' : 'Tandai Selesai'}</span>
            </button>
          </div>
        </div>

        {/* AREA KONTEN */}
        <div 
          ref={contentAreaRef} 
          className="flex-1 overflow-y-auto p-6 lg:p-8 bg-bg-primary"
        >
          <div className="max-w-[720px] mx-auto">
            <div className="mb-6 border-b border-border pb-4">
              <span className="text-xs bg-primary-subtle text-primary border border-primary/20 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                {activeMateri.tipe}
              </span>
              <h1 className="text-2xl lg:text-3xl font-extrabold leading-tight mt-2 text-text-primary">
                {activeMateri.judul}
              </h1>
            </div>

            {/* RENDERING BERDASARKAN TIPE MATERI */}
            <div className="mb-12">
              {activeMateri.tipe === 'video' ? (
                <div className="space-y-4">
                  {structuredResource?.embedUrl || (!structuredResource && activeMateri.konten.startsWith('http')) ? (
                    <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg border border-border bg-black">
                      <iframe
                        src={structuredResource?.embedUrl || activeMateri.konten}
                        title={activeMateri.judul}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="bg-bg-secondary p-4 rounded-xl border border-border">
                      <h3 className="text-xs font-bold mb-2 flex items-center space-x-2 text-primary">
                        <Play className="w-4 h-4" />
                        <span>{structuredResource?.title || 'Panduan Praktik Tertulis'}</span>
                      </h3>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {structuredResource?.description || structuredResource?.unavailableReason || 'Video eksternal belum tersedia untuk materi ini.'}
                      </p>
                      {Array.isArray(structuredResource?.transcript) && (
                        <ol className="mt-3 list-decimal space-y-1 pl-4 text-xs text-text-secondary">
                          {structuredResource.transcript.map((step: string) => <li key={step}>{step}</li>)}
                        </ol>
                      )}
                      {(structuredResource?.youtubeUrl || structuredResource?.externalUrl) && (
                        <a
                          href={structuredResource.youtubeUrl || structuredResource.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-primary px-3 py-2 text-xs font-bold text-primary hover:bg-bg-hover"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          {structuredResource?.youtubeVideoId ? 'Buka di YouTube' : 'Cari Video Relevan di YouTube'}
                        </a>
                      )}
                    </div>
                  )}
                  <div className="bg-bg-secondary p-4 rounded-xl border border-border">
                    <h3 className="text-xs font-bold mb-2 flex items-center space-x-2 text-primary">
                      <Play className="w-4 h-4" />
                      <span>Transkrip Praktik Industri</span>
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Panduan ini disusun dari materi tertulis dan konteks bab. Jika sekolah belum menautkan video terverifikasi, gunakan daftar langkah di atas sebagai naskah belajar, lalu pilih video YouTube yang relevan secara manual dari tautan pencarian.
                    </p>
                  </div>
                </div>
              ) : activeMateri.tipe === 'pdf' ? (
                <div className="space-y-4">
                  <div className="w-full bg-bg-secondary border border-border rounded-xl p-6 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[300px]">
                    <FileText className="w-12 h-12 text-primary animate-pulse" />
                    <div>
                      <h3 className="text-sm font-bold">{structuredResource?.title || 'Buku & Modul Panduan Praktis Kejuruan'}</h3>
                      <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
                        {structuredResource?.description || 'Modul standar belajar kejuruan terintegrasi. Anda dapat membuka atau mengunduh berkas PDF dokumen secara lengkap jika file tersedia.'}
                      </p>
                    </div>
                    {!structuredResource?.pdfUrl && structuredResource?.unavailableReason && (
                      <p className="max-w-md border border-border bg-bg-primary p-3 text-xs text-text-secondary">
                        {structuredResource.unavailableReason}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {(structuredResource?.pdfUrl || (!structuredResource && activeMateri.konten.startsWith('http'))) && (
                        <a 
                          href={structuredResource?.pdfUrl || activeMateri.konten} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-primary hover:bg-primary-hover border border-primary text-white text-xs font-semibold rounded-md flex items-center space-x-1.5 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Unduh PDF Modul</span>
                        </a>
                      )}
                      <Link href="/brain">
                        <button className="px-4 py-2 bg-bg-hover hover:bg-border text-text-primary border border-border text-xs font-semibold rounded-md flex items-center space-x-1.5 transition-colors">
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                          <span>Unggah ke Second Brain AI</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                  
                  {/* PDF viewer fallback/embed */}
                  {(structuredResource?.pdfUrl || (!structuredResource && activeMateri.konten.startsWith('http'))) && (
                    <div className="w-full h-[600px] border border-border rounded-xl overflow-hidden shadow-sm bg-bg-secondary">
                      <iframe src={structuredResource?.pdfUrl || activeMateri.konten} className="w-full h-full"></iframe>
                    </div>
                  )}
                </div>
              ) : (
                /* RENDERING TEKS & RINGKASAN MENGGUNAKAN MARKDOWN */
                <article className="prose prose-invert prose-neutral max-w-none prose-headings:font-bold prose-p:text-text-secondary prose-p:leading-relaxed prose-a:text-primary prose-blockquote:border-l-primary prose-blockquote:bg-bg-secondary/40 prose-blockquote:py-1 prose-blockquote:pr-4">
                  <ReactMarkdown>{activeMateri.konten}</ReactMarkdown>
                </article>
              )}
            </div>

            {/* FOOTER NAVIGASI MATERI */}
            <div className="border-t border-border pt-6 flex items-center justify-between mb-12">
              <button
                onClick={goToPrevMateri}
                disabled={activeIndex === 0}
                className="px-3 py-2 bg-bg-secondary hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed border border-border text-text-primary rounded-md text-xs font-bold flex items-center space-x-1 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <div className="hidden sm:block text-xs text-text-tertiary">
                Materi {activeIndex + 1} dari {flatMateriList.length}
              </div>

              {activeIndex < flatMateriList.length - 1 ? (
                <button
                  onClick={goToNextMateri}
                  className="px-3 py-2 bg-primary hover:bg-primary-hover border border-primary text-white rounded-md text-xs font-bold flex items-center space-x-1 transition-all"
                >
                  <span>Selanjutnya</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <Link href="/ujian/mulai">
                  <button className="px-4 py-2 bg-success hover:bg-success/90 border border-success text-white rounded-md text-xs font-bold flex items-center space-x-1 transition-all animate-bounce">
                    <span>Uji Kompetensi Bab 🎉</span>
                  </button>
                </Link>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* PANEL KANAN: GLOSARIUM & TANYA AI */}
      <div className="hidden lg:flex border-l border-border bg-bg-secondary p-5 flex-col max-h-[calc(100vh-64px)] overflow-y-auto space-y-5">
        
        {/* POIN UTAMA */}
        <div className="bg-bg-primary border border-border p-4 rounded-xl space-y-2.5">
          <h3 className="text-xs font-bold flex items-center space-x-2 text-primary">
            <Sparkles className="w-4 h-4" />
            <span>Poin Utama Materi</span>
          </h3>
          <ul className="text-xs text-text-secondary space-y-1.5 list-disc pl-4 leading-relaxed">
            <li>Menitikberatkan pada fondasi teoretis keahlian praktis.</li>
            <li>Menggunakan standar operasional yang teruji di dunia industri.</li>
            <li>Mencakup poin kunci persiapan ujian nasional kompetensi (UKK).</li>
          </ul>
        </div>

        {/* ISTILAH PENTING / GLOSARIUM */}
        <div className="bg-bg-primary border border-border p-4 rounded-xl space-y-2.5">
          <h3 className="text-xs font-bold flex items-center space-x-2 text-secondary">
            <BookMarked className="w-4 h-4" />
            <span>Glosarium Istilah</span>
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-bold text-text-primary">SOP Industri</p>
              <p className="text-[10px] text-text-tertiary leading-normal mt-0.5">
                Prosedur tertulis yang ditaati untuk menjamin mutu produk dan keselamatan operasional.
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-text-primary">Kompetensi Keahlian</p>
              <p className="text-[10px] text-text-tertiary leading-normal mt-0.5">
                Spesifikasi keahlian khusus kejuruan yang wajib dikuasai secara profesional.
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-text-primary">Troubleshoot</p>
              <p className="text-[10px] text-text-tertiary leading-normal mt-0.5">
                Metode terstruktur untuk mendeteksi letak kesalahan atau malfungsi pada suatu sistem.
              </p>
            </div>
          </div>
        </div>

        {/* TANYA AI */}
        <div className="bg-gradient-to-br from-primary-subtle to-bg-primary border border-primary/20 p-4 rounded-xl flex flex-col justify-between space-y-3">
          <div>
            <h3 className="text-xs font-bold flex items-center space-x-2 text-primary">
              <MessageSquare className="w-4 h-4 animate-pulse" />
              <span>Ada Pertanyaan?</span>
            </h3>
            <p className="text-[11px] text-text-secondary mt-1.5 leading-relaxed">
              Diskusikan bagian materi yang belum Anda pahami secara langsung dengan Tutor AI BelajarKU.
            </p>
          </div>
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Tanya AI Sekarang</span>
          </button>
        </div>

      </div>

      {/* FLOAT CHAT DRAWER FOR TANYA MATERI */}
      {mapel && activeMateri && (
        <ChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          materiTitle={activeMateri.judul}
          materiContent={activeMateri.konten}
          jurusan={jurusanKode}
          kelas={mapel.kelas}
        />
      )}

    </div>
  );
}
