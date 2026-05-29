import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { generateObject } from 'ai';
import { AI_ENV_ERROR, canUseDevelopmentFallback, getGeminiModelId, getServerAiModel, runAiWithRetry } from '@/lib/ai-provider';
import { z } from 'zod';

export const maxDuration = 45; // Extend timeout for complex generation

const RequestSchema = z.object({
  mataPelajaranId: z.string(),
  topik: z.string(),
  jumlah: z.number().min(1).max(10).default(5),
  tingkat: z.enum(['mudah', 'sedang', 'sukar']),
  kelas: z.number().min(10).max(12).default(11),
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

    const { mataPelajaranId, topik, jumlah, tingkat, kelas } = parseResult.data;

    // Fetch Subject info for context
    const mapel = await prisma.mataPelajaran.findUnique({
      where: { id: mataPelajaranId },
      include: {
        jurusan: true,
        bab: {
          include: {
            materi: {
              orderBy: { urutan: 'asc' },
              take: 8,
            },
          },
          orderBy: { nomor: 'asc' },
          take: 6,
        },
        bankSoal: {
          select: { pertanyaan: true },
          orderBy: { createdAt: 'desc' },
          take: 40,
        },
      },
    });

    if (!mapel) {
      return NextResponse.json({ error: 'Mata pelajaran tidak ditemukan' }, { status: 404 });
    }

    const materialContext = mapel.bab
      .map((bab) => {
        const materi = bab.materi
          .filter((item) => item.konten && item.tipe !== 'video')
          .map((item) => `- ${item.judul}: ${item.konten.replace(/\s+/g, ' ').slice(0, 900)}`)
          .join('\n');
        return `BAB ${bab.nomor}: ${bab.judul}\n${bab.deskripsi}\n${materi}`;
      })
      .join('\n\n')
      .slice(0, 9_000);

    const existingQuestions = mapel.bankSoal
      .map((item, index) => `${index + 1}. ${item.pertanyaan.replace(/\s+/g, ' ').slice(0, 180)}`)
      .join('\n');

    const systemPrompt = `Kamu adalah penyusun soal profesional untuk siswa sekolah Indonesia.
Buat soal berdasarkan materi yang diberikan saja. Gaya soal harus mirip LKS, ujian sekolah, asesmen kompetensi, dan bank soal berkualitas.
Jangan membuat soal terlalu generik. Soal harus menguji pemahaman, penerapan, dan analisis, bukan hanya hafalan.`;

    const promptText = `Buat tepat ${jumlah} soal pilihan ganda berkualitas untuk:
- Jenjang: SMK kelas ${kelas}
- Jurusan: ${mapel.jurusan.nama} (${mapel.jurusan.kode})
- Mata pelajaran: ${mapel.nama}
- Topik fokus: ${topik}
- Tingkat kesulitan dominan: ${tingkat}

KONTEKS MATERI DATABASE:
${materialContext || 'Konteks materi detail tidak tersedia. Gunakan hanya nama mata pelajaran dan topik yang diberikan, lalu nyatakan indikator secara spesifik.'}

SOAL YANG SUDAH ADA, JANGAN DIDUPLIKASI:
${existingQuestions || 'Belum ada soal pembanding.'}

Aturan wajib:
1. Setiap soal punya 5 opsi A-E dan hanya satu jawaban benar.
2. Distraktor harus realistis, masuk akal, dan panjangnya relatif seimbang dengan jawaban benar.
3. Hindari opsi "semua benar" atau "semua salah".
4. Variasikan level kognitif C1/C2/C3/C4. Untuk tingkat sedang/sukar, prioritaskan C3-C4.
5. Gunakan variasi bentuk: studi kasus, analisis situasi, penerapan konsep, pernyataan benar-salah terarah, atau interpretasi data sederhana.
6. Pembahasan harus menjelaskan mengapa jawaban benar dan mengapa setiap opsi lain salah.
7. Soal tidak boleh ambigu, tidak boleh terlalu eksplisit menyalin satu kalimat dari materi, dan tidak boleh keluar dari konteks materi.
8. Gunakan Bahasa Indonesia baku yang jelas untuk siswa.`;

    const modelInstance = getServerAiModel();
    let modelSource = process.env.ANTHROPIC_API_KEY
      ? 'AI Generated (Claude 3.5 Sonnet)'
      : `AI Generated (Gemini ${getGeminiModelId()})`;

    let soalList: Array<{
      pertanyaan: string;
      pilihan: string[];
      jawabanBenar: 'A' | 'B' | 'C' | 'D' | 'E';
      pembahasan: string;
      levelKognitif?: string;
      indikator?: string;
      alasanOpsiSalah?: string[];
    }> = [];

    if (!modelInstance) {
      if (!canUseDevelopmentFallback()) {
        return NextResponse.json({ error: AI_ENV_ERROR }, { status: 503 });
      }
      console.warn("No AI API keys configured. Generating development mock questions.");
      soalList = generateMockSoalList(topik, jumlah, tingkat, kelas).soalList;
      modelSource = 'Development Mock Questions Generator';
    } else {
      try {
        const result = await runAiWithRetry(
          () => generateObject({
            model: modelInstance,
            system: systemPrompt,
            prompt: promptText,
            schema: z.object({
              soalList: z.array(z.object({
                pertanyaan: z.string().describe("Teks pertanyaan lengkap beserta studi kasusnya."),
                pilihan: z.array(z.string()).length(5).describe("Tepat 5 pilihan jawaban diawali dengan A., B., C., D., E."),
                jawabanBenar: z.enum(['A', 'B', 'C', 'D', 'E']).describe("Kunci jawaban yang benar (A/B/C/D/E)"),
                pembahasan: z.string().describe("Penjelasan rinci mengapa opsi tersebut benar."),
                alasanOpsiSalah: z.array(z.string()).length(4).describe("Alasan ringkas mengapa empat opsi lain salah."),
                levelKognitif: z.enum(['C1', 'C2', 'C3', 'C4']),
                indikator: z.string().describe("Indikator kompetensi yang diukur oleh soal."),
              }))
            })
          }),
          { label: 'Generate Soal AI' }
        );
        soalList = result.object.soalList;
      } catch (aiError) {
        console.error("AI question generation failed:", aiError);
        if (!canUseDevelopmentFallback()) {
          return NextResponse.json(
            { error: 'Provider AI gagal membuat soal. Periksa GEMINI_API_KEY di environment server.' },
            { status: 502 }
          );
        }
        soalList = generateMockSoalList(topik, jumlah, tingkat, kelas).soalList;
        modelSource = 'Development Mock Questions Generator (Fallback)';
      }
    }

    const createdSoalList = [];
    const acceptedSoal = sanitizeGeneratedQuestions(soalList, mapel.bankSoal.map((item) => item.pertanyaan));

    // Save questions to database
    for (const s of acceptedSoal) {
      const created = await prisma.bankSoal.create({
        data: {
          mataPelajaranId,
          pertanyaan: s.pertanyaan,
          tipe: 'pilihan_ganda',
          pilihan: s.pilihan,
          jawabanBenar: s.jawabanBenar,
          pembahasan: buildPembahasan(s),
          tingkat,
          kelas,
          tahunAjaran: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
          sumber: modelSource,
          tags: [mapel.nama, mapel.jurusan.kode, topik, tingkat, s.levelKognitif || 'C2'].filter(Boolean),
        }
      });
      createdSoalList.push(created);
    }

    return NextResponse.json({
      success: true,
      message: `${createdSoalList.length} soal berhasil digenerate dan dimasukkan ke bank soal.`,
      data: createdSoalList
    });
  } catch (error) {
    console.error('Failed to generate soal AI:', error);
    return NextResponse.json({ error: 'Gagal membuat soal AI', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

function generateMockSoalList(topik: string, jumlah: number, tingkat: string, kelas: number) {
  const list = [];
  const mockQuestions = [
    {
      pertanyaan: `Manakah dari berikut ini yang menjelaskan konsep dasar dari '${topik}' dalam konteks kejuruan?`,
      pilihan: [
        `A. Menjamin kelancaran operasi dan keselarasan dengan SOP industri`,
        `B. Melakukan bypass terhadap protokol keamanan demi kecepatan`,
        `C. Menunda proses dokumentasi hingga proyek selesai sepenuhnya`,
        `D. Menggunakan peralatan non-standar tanpa kalibrasi`,
        `E. Mengabaikan keluhan pengguna akhir`
      ],
      jawabanBenar: "A" as const,
      pembahasan: "Dalam standar industri, konsistensi operasional dan kepatuhan terhadap SOP adalah hal utama untuk menjamin kualitas dan keselamatan kerja."
    },
    {
      pertanyaan: `Jika terjadi kesalahan konfigurasi pada sistem yang berkaitan dengan '${topik}', tindakan awal apakah yang paling sesuai dengan SOP?`,
      pilihan: [
        `A. Melacak log aktivitas sistem dan mencocokkannya dengan diagram alur`,
        `B. Melakukan restart paksa pada perangkat keras berulang kali`,
        `C. Mengunduh program pihak ketiga secara acak untuk perbaikan instan`,
        `D. Membiarkan masalah berlanjut hingga shift kerja berikutnya`,
        `E. Melaporkan kerusakan total pada atasan langsung tanpa memeriksa`
      ],
      jawabanBenar: "A" as const,
      pembahasan: "Troubleshooting yang baik selalu diawali dengan analisis data (log) dan verifikasi fisik untuk menemukan akar penyebab masalah secara akurat."
    },
    {
      pertanyaan: `Bagaimanakah pengaruh K3 (Keselamatan dan Kesehatan Kerja) dalam pengerjaan praktikum '${topik}'?`,
      pilihan: [
        `A. K3 wajib diterapkan untuk meminimalkan risiko kecelakaan kerja dan kerusakan alat`,
        `B. K3 hanya formalitas dan boleh diabaikan jika waktu praktikum terbatas`,
        `C. K3 hanya berlaku untuk instruktur/guru, bukan untuk siswa`,
        `D. Penerapan K3 memperlambat produktivitas sehingga tidak disarankan`,
        `E. K3 hanya dibutuhkan jika menggunakan tegangan tinggi`
      ],
      jawabanBenar: "A" as const,
      pembahasan: "K3 adalah prioritas utama di setiap lingkungan kerja teknis untuk melindungi pekerja serta menjaga fasilitas kerja."
    },
    {
      pertanyaan: `Kompetensi kejuruan manakah yang paling erat kaitannya dengan keberhasilan penerapan '${topik}' di tempat kerja?`,
      pilihan: [
        `A. Kemampuan kolaborasi tim, disiplin diri, serta ketelitian teknis`,
        `B. Kemampuan menghafal seluruh instruksi tanpa praktik nyata`,
        `C. Kecepatan menyelesaikan tugas secara terburu-buru tanpa pemeriksaan`,
        `D. Kemampuan menghindari tugas-tugas sulit`,
        `E. Mengandalkan bantuan eksternal sepenuhnya`
      ],
      jawabanBenar: "A" as const,
      pembahasan: "Kombinasi antara keahlian teknis (hard skills) dan soft skills seperti kolaborasi dan disiplin sangat menentukan kesuksesan profesional."
    },
    {
      pertanyaan: `Di era industri 4.0 saat ini, mengapa pemahaman mengenai '${topik}' dianggap krusial bagi lulusan SMK?`,
      pilihan: [
        `A. Topik ini menjadi bagian dari integrasi teknologi digital dan otomatisasi industri`,
        `B. Kurikulum sekolah tidak pernah berubah sehingga harus dipelajari`,
        `C. Supaya siswa tidak perlu melakukan pekerjaan manual lagi`,
        `D. Agar lulusan bisa bekerja tanpa pengawasan sama sekali`,
        `E. Menghindari pembelajaran bidang keahlian lain`
      ],
      jawabanBenar: "A" as const,
      pembahasan: "Teknologi digital dan otomatisasi menuntut lulusan SMK memahami konsep modern agar tetap relevan di industri saat ini."
    }
  ];

  for (let i = 0; i < jumlah; i++) {
    const q = mockQuestions[i % mockQuestions.length];
    list.push({
      pertanyaan: `[Offline Mode] ${q.pertanyaan}`,
      pilihan: q.pilihan,
      jawabanBenar: q.jawabanBenar,
      pembahasan: q.pembahasan
    });
  }

  return { soalList: list };
}

function sanitizeGeneratedQuestions(
  soalList: Array<{
    pertanyaan: string;
    pilihan: string[];
    jawabanBenar: 'A' | 'B' | 'C' | 'D' | 'E';
    pembahasan: string;
    levelKognitif?: string;
    indikator?: string;
    alasanOpsiSalah?: string[];
  }>,
  existingQuestions: string[]
) {
  const seen = new Set(existingQuestions.map(normalizeQuestionText));
  const validLevels = new Set(['C1', 'C2', 'C3', 'C4']);

  return soalList.filter((soal) => {
    if (!soal?.pertanyaan || !Array.isArray(soal.pilihan) || soal.pilihan.length !== 5) return false;
    if (!['A', 'B', 'C', 'D', 'E'].includes(soal.jawabanBenar)) return false;
    if (!soal.pembahasan || soal.pembahasan.length < 80) return false;
    if (new Set(soal.pilihan.map((p) => normalizeQuestionText(String(p)))).size !== 5) return false;

    const normalized = normalizeQuestionText(soal.pertanyaan);
    if (normalized.length < 30 || seen.has(normalized)) return false;
    seen.add(normalized);

    soal.pilihan = soal.pilihan.map((option, index) => normalizeOptionLabel(String(option), index));
    soal.levelKognitif = validLevels.has(String(soal.levelKognitif)) ? soal.levelKognitif : 'C2';
    soal.indikator = soal.indikator?.trim() || `Mengukur pemahaman siswa terhadap ${soal.pertanyaan.slice(0, 80)}`;
    soal.alasanOpsiSalah = Array.isArray(soal.alasanOpsiSalah) ? soal.alasanOpsiSalah.slice(0, 4) : [];
    return true;
  });
}

function buildPembahasan(soal: {
  pembahasan: string;
  jawabanBenar: string;
  levelKognitif?: string;
  indikator?: string;
  alasanOpsiSalah?: string[];
}) {
  const alasanSalah = soal.alasanOpsiSalah?.length
    ? `\n\nAlasan opsi lain kurang tepat:\n${soal.alasanOpsiSalah.map((alasan, index) => `- ${index + 1}. ${alasan}`).join('\n')}`
    : '';

  return [
    `Indikator soal: ${soal.indikator || 'Indikator belum tersedia.'}`,
    `Level kognitif: ${soal.levelKognitif || 'C2'}`,
    `Jawaban benar: ${soal.jawabanBenar}`,
    `Pembahasan: ${soal.pembahasan}`,
    alasanSalah,
  ].filter(Boolean).join('\n');
}

function normalizeQuestionText(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9\u00C0-\u024F]+/gi, ' ').trim().replace(/\s+/g, ' ');
}

function normalizeOptionLabel(option: string, index: number) {
  const label = String.fromCharCode(65 + index);
  return option.replace(/^[A-E][.)]\s*/i, `${label}. `).startsWith(`${label}. `)
    ? option.replace(/^[A-E][.)]\s*/i, `${label}. `).trim()
    : `${label}. ${option.trim()}`;
}
