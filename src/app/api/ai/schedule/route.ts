import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { generateObject } from 'ai';
import { AI_ENV_ERROR, canUseDevelopmentFallback, getServerAiModel } from '@/lib/ai-provider';
import { z } from 'zod';

export const maxDuration = 45;

const RequestSchema = z.object({
  mapelId: z.string(),
  tanggalUjian: z.string(), // YYYY-MM-DD
  weakTopics: z.array(z.object({
    topic: z.string(),
    mastery: z.number(),
  })).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = RequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Parameter input tidak valid', details: parseResult.error.format() }, { status: 400 });
    }

    const { mapelId, tanggalUjian, weakTopics = [] } = parseResult.data;

    // Fetch Subject details
    const mapel = await prisma.mataPelajaran.findUnique({
      where: { id: mapelId },
      include: { jurusan: true },
    });

    if (!mapel) {
      return NextResponse.json({ error: 'Mata pelajaran tidak ditemukan' }, { status: 404 });
    }

    const weakTopicsText = weakTopics.length > 0
      ? weakTopics.map((wt) => `${wt.topic} (tingkat pemahaman ${wt.mastery}%)`).join(', ')
      : 'Belum ada data topik lemah';

    const systemPrompt = `Kamu adalah perencana studi kecerdasan buatan khusus Kurikulum Merdeka SMK Indonesia.
Tugasmu adalah merancang jadwal belajar harian (milestone harian) yang proporsional bagi siswa agar siap menghadapi ujian semester/bab.
Model belajar harus fokus, berulang (spaced repetition), dan memprioritaskan area yang paling dikuasai dengan lemah.`;

    const promptText = `Buatlah rencana belajar harian untuk mata pelajaran '${mapel.nama}' (Jurusan ${mapel.jurusan.nama} SMK).
Siswa akan menghadapi ujian pada tanggal ${tanggalUjian}.
Hari ini adalah tanggal ${new Date().toISOString().split('T')[0]}.
Prioritaskan topik-topik lemah berikut: ${weakTopicsText}.

Rancang sesi belajar harian (maksimal 10 sesi belajar yang tersebar dari hari ini sampai H-1 sebelum tanggal ujian).
Setiap sesi harus memuat tanggal pelaksanaan, judul topik spesifik, durasi belajar dalam menit, prioritas kepentingan, dan kategori pengerjaan (study = belajar materi baru, exercise = latihan soal/bank soal, revision = mengulang ringkasan/flashcards).`;

    const modelInstance = getServerAiModel();

    let sessions: Array<{
      tanggal: string;
      topik: string;
      durasiMenit: number;
      prioritas: 'tinggi' | 'sedang' | 'rendah';
      kategori: 'study' | 'exercise' | 'revision';
    }> = [];

    if (!modelInstance) {
      if (!canUseDevelopmentFallback()) {
        return NextResponse.json({ error: AI_ENV_ERROR }, { status: 503 });
      }
      console.warn("No AI API keys configured. Generating development study schedule fallback.");
      sessions = generateMockSchedule(mapel.nama, tanggalUjian, weakTopics);
    } else {
      try {
        const result = await generateObject({
          model: modelInstance,
          system: systemPrompt,
          prompt: promptText,
          schema: z.object({
            sessions: z.array(z.object({
              tanggal: z.string().describe("Tanggal sesi belajar dalam format YYYY-MM-DD."),
              topik: z.string().describe("Topik/materi spesifik yang akan dipelajari."),
              durasiMenit: z.number().min(15).max(120).describe("Durasi belajar dalam menit."),
              prioritas: z.enum(['tinggi', 'sedang', 'rendah']).describe("Tingkat kepentingan topik."),
              kategori: z.enum(['study', 'exercise', 'revision']).describe("Kategori aktivitas belajar (study, exercise, atau revision)."),
            }))
          })
        });
        sessions = result.object.sessions;
      } catch (aiError) {
        console.error("AI schedule generation failed:", aiError);
        if (!canUseDevelopmentFallback()) {
          return NextResponse.json(
            { error: 'Provider AI gagal membuat rencana belajar. Periksa GEMINI_API_KEY di environment server.' },
            { status: 502 }
          );
        }
        sessions = generateMockSchedule(mapel.nama, tanggalUjian, weakTopics);
      }
    }

    return NextResponse.json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error('Failed to generate AI study schedule:', error);
    return NextResponse.json({ error: 'Gagal membuat rencana belajar AI', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

function generateMockSchedule(mapelNama: string, tanggalUjian: string, weakTopics: any[]) {
  const sessions = [];
  const today = new Date();
  const examDate = new Date(tanggalUjian);
  
  // Calculate difference in days
  const diffTime = Math.max(0, examDate.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const totalSessions = Math.min(10, Math.max(3, diffDays));
  const topicsPool = weakTopics.length > 0 
    ? weakTopics.map(wt => wt.topic)
    : ["Pengenalan " + mapelNama, "Konsep Utama", "Standard Operating Procedure (SOP)", "Troubleshooting Dasar", "Evaluasi Akhir"];

  for (let i = 0; i < totalSessions; i++) {
    // Distribute sessions over the available days
    const sessionDate = new Date();
    const addDays = Math.floor((diffDays / totalSessions) * i);
    sessionDate.setDate(today.getDate() + addDays);
    
    // Format YYYY-MM-DD
    const dateStr = sessionDate.toISOString().split('T')[0];
    
    const topicsIndex = i % topicsPool.length;
    const topic = topicsPool[topicsIndex];
    
    let kategori: 'study' | 'exercise' | 'revision' = 'study';
    if (i % 3 === 1) kategori = 'exercise';
    if (i % 3 === 2 || i === totalSessions - 1) kategori = 'revision';
    
    sessions.push({
      tanggal: dateStr,
      topik: `[Offline Simulation] ${topic}`,
      durasiMenit: 30 + (i % 3) * 15,
      prioritas: i % 2 === 0 ? 'tinggi' as const : 'sedang' as const,
      kategori,
    });
  }
  
  return sessions;
}
