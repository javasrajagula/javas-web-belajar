import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { auth } from '@/auth';
import { AI_ENV_ERROR, canUseDevelopmentFallback, getServerAiModel, runAiWithRetry } from '@/lib/ai-provider';

export const maxDuration = 45;

function pickRelevantContext(question: string, notes: Array<{ title?: string; content?: string; summary?: string }>) {
  const terms = question
    .toLowerCase()
    .split(/\W+/)
    .filter((term) => term.length > 3);

  return notes
    .map((note) => {
      const haystack = `${note.title || ''} ${note.content || ''} ${note.summary || ''}`.toLowerCase();
      const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
      return { note, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.note);
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const body = await req.json();
    const question = String(body.question || '').trim();
    const notes = Array.isArray(body.notes) ? body.notes : [];

    if (!question) {
      return NextResponse.json({ error: 'Pertanyaan tidak boleh kosong.' }, { status: 400 });
    }

    if (!notes.length) {
      return NextResponse.json({ error: 'Belum ada data di Otak Kedua. Tambahkan catatan/PDF terlebih dahulu.' }, { status: 400 });
    }

    const relevantNotes = pickRelevantContext(question, notes);
    if (!relevantNotes.length) {
      return NextResponse.json({ error: 'Belum ada informasi yang relevan di Otak Kedua untuk pertanyaan ini.' }, { status: 404 });
    }

    const context = relevantNotes
      .map((note, index) => `Sumber ${index + 1}: ${note.title || 'Tanpa judul'}\n${note.summary || note.content || ''}`)
      .join('\n\n---\n\n')
      .slice(0, 10000);

    const model = getServerAiModel();
    if (!model) {
      if (!canUseDevelopmentFallback()) {
        return NextResponse.json({ error: AI_ENV_ERROR }, { status: 503 });
      }
      return NextResponse.json({
        answer: `Mode development: Gemini belum dikonfigurasi. Berikut konteks relevan yang ditemukan tanpa membuat jawaban baru:\n\n${context.slice(0, 1600)}`,
        sources: relevantNotes.map((note) => note.title || 'Tanpa judul'),
        isMock: true,
      });
    }

    const result = await runAiWithRetry(
      () => generateText({
        model,
        temperature: 0.2,
        system: `Kamu adalah asisten Otak Kedua. Jawab hanya berdasarkan konteks yang diberikan.
Jika konteks tidak cukup, katakan "Belum ada konteks yang cukup" dan jangan menambahkan fakta dari luar.
Selalu tampilkan bagian: Jawaban, Sumber konteks, Batasan.`,
        prompt: `Pertanyaan user:
${question}

Konteks Otak Kedua:
${context}`,
      }),
      { label: 'Otak Kedua' }
    );

    if (!result.text.trim()) {
      return NextResponse.json({ error: 'Gemini mengembalikan respons kosong.' }, { status: 502 });
    }

    return NextResponse.json({
      answer: result.text,
      sources: relevantNotes.map((note) => note.title || 'Tanpa judul'),
    });
  } catch (error) {
    console.error('Second Brain API error:', error);
    return NextResponse.json({ error: 'Gagal memproses pertanyaan Otak Kedua.' }, { status: 500 });
  }
}
