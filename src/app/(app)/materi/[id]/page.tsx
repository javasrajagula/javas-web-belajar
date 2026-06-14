'use client';

import React, { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import {
  ArrowLeft,
  BookMarked,
  BookOpen,
  CheckCircle,
  ExternalLink,
  FileText,
  MessageSquare,
  Play,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUserStore } from '@/stores/user-store';

type MateriDetail = {
  id: string;
  judul: string;
  tipe: string;
  konten: string;
  urutan: number;
  selesai?: boolean;
  bab: {
    id: string;
    nomor: number;
    judul: string;
    deskripsi: string;
    estimasiMenit: number;
    mataPelajaran: {
      id: string;
      kode: string;
      nama: string;
      kelas: number;
      semester: number;
      jurusan: {
        kode: string;
        nama: string;
        warna: string;
      };
    };
  };
};

function extractTerms(text: string) {
  const matches = text.match(/\b[A-Z][A-Za-z0-9+/#-]{2,}\b/g) || [];
  return Array.from(new Set(matches)).slice(0, 6);
}

function parseStructuredResource(konten: string) {
  try {
    return JSON.parse(konten);
  } catch {
    return null;
  }
}

export default function MateriDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { addXp } = useUserStore();
  const [materi, setMateri] = useState<MateriDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDetail() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/materi/${id}`, { signal: controller.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Materi tidak ditemukan');
        setMateri(data);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError(err instanceof Error ? err.message : 'Gagal memuat materi');
        }
      } finally {
        setLoading(false);
      }
    }

    loadDetail();
    return () => controller.abort();
  }, [id]);

  const keyTerms = useMemo(() => {
    if (!materi) return [];
    let textToExtract = materi.konten;
    if (materi.tipe === 'video' || materi.tipe === 'pdf') {
      try {
        const parsed = JSON.parse(materi.konten);
        if (Array.isArray(parsed.keyConcepts) && parsed.keyConcepts.length > 0) {
          return parsed.keyConcepts.slice(0, 6);
        }
        textToExtract = parsed.completeMaterial || parsed.description || parsed.title || '';
      } catch {
        // fallback to raw extraction
      }
    }
    return extractTerms(textToExtract);
  }, [materi]);

  async function markCompleted() {
    if (!materi || materi.selesai) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/materi/${materi.id}/selesai`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan progres');
      setMateri({ ...materi, selesai: true });
      addXp(data.xpEarned || 0);
      toast.success(data.message || 'Materi ditandai selesai.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan progres');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="contrast-safe flex min-h-[60vh] items-center justify-center text-text-primary">
        <Card className="flex items-center gap-3 bg-white">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-bold text-text-secondary">Memuat detail materi...</span>
        </Card>
      </div>
    );
  }

  if (error || !materi) {
    return (
      <div className="contrast-safe flex min-h-[60vh] items-center justify-center p-4 text-text-primary">
        <Card className="max-w-lg bg-white text-center">
          <h1 className="text-lg font-black text-danger">Materi Tidak Ditemukan</h1>
          <p className="mt-2 text-sm font-semibold text-text-secondary">{error || 'Data materi tidak tersedia.'}</p>
          <Link href="/materi" className="mt-4 inline-flex">
            <Button variant="outline">Kembali ke Daftar Materi</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const mapel = materi.bab.mataPelajaran;
  const readerUrl = `/belajar/${mapel.jurusan.kode}/${mapel.id}/${materi.bab.id}`;
  const latihanUrl = `/ujian/${mapel.id}?mode=latihan_santai`;
  const structuredResource = parseStructuredResource(materi.konten);

  return (
    <div className="contrast-safe grid gap-5 text-text-primary xl:grid-cols-[minmax(0,1fr)_320px]">
      <main className="space-y-5">
        <section className="border-[3px] border-border bg-white p-5 shadow-sm">
          <Link href="/materi" className="inline-flex items-center gap-1 text-xs font-black uppercase text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Daftar Materi
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge className="bg-accent text-black border-border">{mapel.jurusan.kode}</Badge>
            <Badge variant="secondary">Kelas {mapel.kelas}</Badge>
            <Badge variant={materi.selesai ? 'success' : 'warning'}>{materi.selesai ? 'Selesai' : 'Belum selesai'}</Badge>
          </div>

          <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight text-text-primary lg:text-3xl">
            {materi.judul}
          </h1>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-text-secondary">
            {mapel.nama} - Bab {materi.bab.nomor}: {materi.bab.judul.replace(`Bab ${materi.bab.nomor}: `, '')}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={markCompleted} disabled={materi.selesai || submitting}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {materi.selesai ? 'Sudah Selesai' : submitting ? 'Menyimpan...' : 'Tandai Selesai'}
            </Button>
            <Link href={readerUrl}>
              <Button variant="outline">
                <BookOpen className="mr-2 h-4 w-4" />
                Buka Reader Bab
              </Button>
            </Link>
            <Link href={latihanUrl}>
              <Button variant="secondary">
                <BookMarked className="mr-2 h-4 w-4" />
                Latihan Soal
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-[3px] border-border bg-white p-5 shadow-sm">
          {materi.tipe === 'video' ? (
            <div className="space-y-4">
              {structuredResource?.embedUrl || (!structuredResource && materi.konten.startsWith('http')) ? (
                <div className="aspect-video overflow-hidden border-[3px] border-border bg-black">
                  <iframe
                    src={structuredResource?.embedUrl || materi.konten}
                    title={materi.judul}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <Card className="bg-bg-primary">
                  <h2 className="text-base font-black text-text-primary">{structuredResource?.title || materi.judul}</h2>
                  <p className="mt-2 text-xs font-semibold text-text-secondary">
                    {structuredResource?.description || structuredResource?.unavailableReason || 'Video eksternal belum tersedia untuk materi ini.'}
                  </p>
                  {(structuredResource?.youtubeUrl || structuredResource?.externalUrl) && (
                    <a href={structuredResource.youtubeUrl || structuredResource.externalUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {structuredResource?.youtubeVideoId ? 'Buka di YouTube' : 'Cari Video Relevan di YouTube'}
                      </Button>
                    </a>
                  )}
                  {Array.isArray(structuredResource?.transcript) && (
                    <ol className="mt-4 list-decimal space-y-2 pl-5 text-xs font-semibold text-text-secondary">
                      {structuredResource.transcript.map((step: string) => <li key={step}>{step}</li>)}
                    </ol>
                  )}
                </Card>
              )}
            </div>
          ) : materi.tipe === 'pdf' ? (
            <div className="space-y-4">
              <Card className="bg-bg-primary text-center">
                <FileText className="mx-auto h-10 w-10 text-primary" />
                <h2 className="mt-3 text-base font-black text-text-primary">{structuredResource?.title || 'Modul PDF'}</h2>
                <p className="mx-auto mt-1 max-w-lg text-xs font-semibold text-text-secondary">
                  {structuredResource?.description || 'Dokumen PDF dibuka dari sumber materi. Untuk membuat ringkasan berbasis isi PDF, unggah file ke Otak Kedua.'}
                </p>
                {Array.isArray(structuredResource?.topics) && (
                  <ul className="mx-auto mt-4 max-w-md list-disc space-y-1 pl-5 text-left text-xs font-semibold text-text-secondary">
                    {structuredResource.topics.map((topic: string) => <li key={topic}>{topic}</li>)}
                  </ul>
                )}
                {Array.isArray(structuredResource?.objectives) && structuredResource.objectives.length > 0 && (
                  <div className="mx-auto mt-4 max-w-2xl text-left">
                    <h3 className="text-xs font-black uppercase text-text-primary">Tujuan Pembelajaran</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-xs font-semibold text-text-secondary">
                      {structuredResource.objectives.map((objective: string) => <li key={objective}>{objective}</li>)}
                    </ul>
                  </div>
                )}
                {structuredResource?.completeMaterial && (
                  <div className="mx-auto mt-4 max-w-2xl border-[2px] border-border bg-white p-4 text-left">
                    <h3 className="text-xs font-black uppercase text-text-primary">Materi Lengkap</h3>
                    <p className="mt-2 whitespace-pre-line text-xs font-semibold leading-relaxed text-text-secondary">
                      {structuredResource.completeMaterial}
                    </p>
                  </div>
                )}
                {structuredResource?.workedExample?.question && (
                  <div className="mx-auto mt-4 max-w-2xl border-[2px] border-border bg-white p-4 text-left">
                    <h3 className="text-xs font-black uppercase text-text-primary">Contoh Soal dan Pembahasan</h3>
                    <p className="mt-2 text-xs font-black text-text-primary">Soal: {structuredResource.workedExample.question}</p>
                    <p className="mt-2 text-xs font-semibold leading-relaxed text-text-secondary">
                      Pembahasan: {structuredResource.workedExample.answer}
                    </p>
                  </div>
                )}
                {Array.isArray(structuredResource?.chapters) && structuredResource.chapters.length > 0 && (
                  <div className="mx-auto mt-4 grid max-w-3xl gap-3 text-left md:grid-cols-3">
                    {structuredResource.chapters.map((chapter: { title: string; summary: string; topics?: string[] }) => (
                      <div key={chapter.title} className="border-[2px] border-border bg-white p-3">
                        <h3 className="text-xs font-black text-text-primary">{chapter.title}</h3>
                        <p className="mt-2 text-xs font-semibold leading-relaxed text-text-secondary">{chapter.summary}</p>
                        {Array.isArray(chapter.topics) && (
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] font-semibold text-text-secondary">
                            {chapter.topics.map((topic) => <li key={topic}>{topic}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {Array.isArray(structuredResource?.examples) && structuredResource.examples.length > 0 && (
                  <div className="mx-auto mt-4 max-w-2xl text-left">
                    <h3 className="text-xs font-black uppercase text-text-primary">Contoh dan Studi Kasus</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-xs font-semibold text-text-secondary">
                      {structuredResource.examples.map((example: string) => <li key={example}>{example}</li>)}
                    </ul>
                  </div>
                )}
                {structuredResource?.summary && (
                  <p className="mx-auto mt-4 max-w-2xl border-[2px] border-border bg-white p-3 text-left text-xs font-semibold text-text-secondary">
                    {structuredResource.summary}
                  </p>
                )}
                {Array.isArray(structuredResource?.evaluation) && structuredResource.evaluation.length > 0 && (
                  <div className="mx-auto mt-4 max-w-2xl text-left">
                    <h3 className="text-xs font-black uppercase text-text-primary">Latihan/Evaluasi</h3>
                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs font-semibold text-text-secondary">
                      {structuredResource.evaluation.map((item: string) => <li key={item}>{item}</li>)}
                    </ol>
                  </div>
                )}
                {Array.isArray(structuredResource?.checklist) && structuredResource.checklist.length > 0 && (
                  <div className="mx-auto mt-4 max-w-2xl text-left">
                    <h3 className="text-xs font-black uppercase text-text-primary">Checklist Pemahaman</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-xs font-semibold text-text-secondary">
                      {structuredResource.checklist.map((item: string) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                )}
                {Array.isArray(structuredResource?.references) && structuredResource.references.length > 0 && (
                  <div className="mx-auto mt-4 max-w-2xl text-left">
                    <h3 className="text-xs font-black uppercase text-text-primary">Referensi</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-xs font-semibold text-primary">
                      {structuredResource.references.map((reference: { title: string; url: string }) => (
                        <li key={reference.url}>
                          <a href={reference.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {reference.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {!structuredResource?.pdfUrl && structuredResource?.unavailableReason && (
                  <p className="mx-auto mt-4 max-w-lg border-[2px] border-dashed border-border bg-white p-3 text-xs font-semibold text-text-secondary">
                    {structuredResource.unavailableReason}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {(structuredResource?.pdfUrl || (!structuredResource && materi.konten.startsWith('http'))) && (
                    <a href={structuredResource?.pdfUrl || materi.konten} target="_blank" rel="noopener noreferrer">
                      <Button>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Buka PDF
                      </Button>
                    </a>
                  )}
                  <Link href="/brain">
                    <Button variant="outline">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Ringkas PDF
                    </Button>
                  </Link>
                </div>
              </Card>
              {(structuredResource?.pdfUrl || (!structuredResource && materi.konten.startsWith('http'))) && (
                <iframe title={materi.judul} src={structuredResource?.pdfUrl || materi.konten} className="h-[640px] w-full border-[3px] border-border bg-bg-secondary" />
              )}
            </div>
          ) : (
            <article className="prose prose-neutral max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-li:text-text-secondary prose-strong:text-text-primary prose-a:text-primary">
              <ReactMarkdown>{materi.konten}</ReactMarkdown>
            </article>
          )}
        </section>
      </main>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <Card className="bg-white">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase text-text-primary">
            <BookOpen className="h-4 w-4 text-primary" />
            Navigasi
          </h2>
          <div className="mt-3 space-y-2 text-xs font-semibold text-text-secondary">
            <p>Jurusan: {mapel.jurusan.nama}</p>
            <p>Mata pelajaran: {mapel.nama}</p>
            <p>Bab: {materi.bab.judul}</p>
            <p>Estimasi: {materi.bab.estimasiMenit} menit</p>
          </div>
        </Card>

        <Card className="bg-white">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase text-text-primary">
            <Sparkles className="h-4 w-4 text-primary" />
            Konsep Kunci
          </h2>
          {keyTerms.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {keyTerms.map((term) => (
                <Badge key={term} variant="secondary" className="text-[10px]">
                  {term}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs font-semibold text-text-secondary">
              Baca isi materi untuk menemukan istilah penting dan konsep yang harus dikuasai.
            </p>
          )}
        </Card>

        <Card className="bg-white">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase text-text-primary">
            <MessageSquare className="h-4 w-4 text-primary" />
            Butuh Bantuan?
          </h2>
          <p className="mt-2 text-xs font-semibold leading-relaxed text-text-secondary">
            Gunakan Tutor AI untuk bertanya bagian materi yang belum jelas. Tutor memanggil endpoint server-side sehingga API key tidak masuk ke browser.
          </p>
          <Link href="/tutor" className="mt-3 inline-flex">
            <Button size="sm" variant="outline">Tanya Tutor AI</Button>
          </Link>
        </Card>
      </aside>
    </div>
  );
}
