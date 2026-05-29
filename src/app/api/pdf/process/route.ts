import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { PDFParse } from 'pdf-parse';
import { auth } from '@/auth';
import { AI_ENV_ERROR, canUseDevelopmentFallback, getServerAiModel, runAiWithRetry } from '@/lib/ai-provider';
import { z } from 'zod';
// @ts-ignore
import { getPath } from 'pdf-parse/worker';
import { pathToFileURL } from 'url';

export const maxDuration = 60; // Allow longer processing time for large PDFs
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

// Set worker path safely using file:// URL for Windows compatibility
try {
  const workerPath = pathToFileURL(getPath()).href;
  PDFParse.setWorker(workerPath);
} catch (e) {
  console.warn("Failed to set PDF worker path:", e);
}

function normalizeExtractedText(input: string) {
  return input
    .replace(/\u0000/g, ' ')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
    .replace(/-\s*\n\s*/g, '')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function removeRepeatedPdfNoise(text: string) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const frequency = new Map<string, number>();
  lines.forEach((line) => {
    const normalized = line.toLowerCase().replace(/\d+/g, '#').trim();
    if (normalized.length >= 6 && normalized.length <= 120) {
      frequency.set(normalized, (frequency.get(normalized) || 0) + 1);
    }
  });

  const totalLines = Math.max(lines.length, 1);
  return lines
    .filter((line) => {
      const normalized = line.toLowerCase().replace(/\d+/g, '#').trim();
      const count = frequency.get(normalized) || 0;
      const looksLikePageNumber = /^(halaman|page)?\s*\d+\s*(\/\s*\d+)?$/i.test(line);
      return !looksLikePageNumber && !(count >= 4 && count / totalLines > 0.08);
    })
    .join('\n');
}

function chunkPdfText(text: string, chunkSize = 4_000, overlap = 350) {
  const chunks: string[] = [];
  let index = 0;
  while (index < text.length) {
    const slice = text.slice(index, index + chunkSize);
    const boundary = slice.lastIndexOf('\n\n');
    const chunk = boundary > 1_500 ? slice.slice(0, boundary) : slice;
    chunks.push(chunk.trim());
    index += Math.max(1, chunk.length - overlap);
    if (chunks.length >= 6) break;
  }
  return chunks.filter((chunk) => chunk.length > 120);
}

function buildPdfContext(text: string) {
  return chunkPdfText(text)
    .map((chunk, index) => `### POTONGAN ${index + 1}\n${chunk}`)
    .join('\n\n---\n\n');
}

function hasEnoughReadableText(text: string) {
  const letters = (text.match(/[A-Za-zÀ-ÿ\u0100-\u024F\u1E00-\u1EFF]/g) || []).length;
  const strangeSymbols = (text.match(/[^\sA-Za-zÀ-ÿ\u0100-\u024F\u1E00-\u1EFF0-9.,;:!?()[\]{}'"“”‘’/\-–—]/g) || []).length;

  return (
    text.length >= 80 &&
    letters / Math.max(text.length, 1) > 0.35 &&
    strangeSymbols / Math.max(text.length, 1) < 0.15
  );
}

function generateMockPdfData(text: string) {
  const cleanText = normalizeExtractedText(text);
  const sentences = cleanText
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 30 && sentence.length < 260);
  const title = (sentences[0] || cleanText.split(/[.\n]/)[0] || "Materi Pembelajaran").slice(0, 90);
  const points = sentences.slice(0, 7);
  const words = cleanText
    .toLowerCase()
    .replace(/[^a-zA-ZÀ-ÿ\u0100-\u024F\u1E00-\u1EFF0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 4 && !['dengan', 'untuk', 'dalam', 'adalah', 'yang', 'pada', 'sebagai', 'karena', 'tidak', 'akan', 'atau', 'dapat'].includes(word));
  const frequency = new Map<string, number>();
  words.forEach((word) => frequency.set(word, (frequency.get(word) || 0) + 1));
  const keyTerms = Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
  const example = points.find((point) => /contoh|misal|seperti|yaitu|antara lain/i.test(point)) || points[1] || points[0] || 'Dokumen tidak memuat contoh eksplisit yang cukup panjang.';

  const ringkasan = `## Ringkasan PDF: ${title} (Mode Cadangan)

Ringkasan cadangan ini dibuat langsung dari teks yang berhasil diekstrak. Tidak ada informasi di luar dokumen yang ditambahkan.

### Identitas Materi
- Judul/topik terdeteksi: ${title}
- Jumlah kalimat terbaca: ${sentences.length}
- Sumber ringkasan: teks hasil ekstraksi PDF

### Poin Penting
${points.length > 0
  ? points.map((point, index) => `${index + 1}. ${point}`).join('\n')
  : '1. Teks dokumen terlalu pendek untuk diringkas secara spesifik.\n2. Coba unggah PDF dengan teks yang bisa diseleksi, bukan hasil scan gambar.'}

### Rumus/Konsep Utama Jika Ada
${keyTerms.length > 0 ? keyTerms.map((term) => `- ${term}`).join('\n') : '- Istilah kunci tidak cukup terdeteksi dari teks.'}

### Contoh Singkat Dari Dokumen
${example}

### Rangkuman
${points.slice(0, 3).join(' ')}

### Referensi
- Dokumen PDF yang diunggah pengguna.
- Ringkasan dibuat dari teks yang berhasil diekstrak, bukan dari pengetahuan luar.`;

  const kuis = [
    {
      pertanyaan: `Berdasarkan dokumen, apa topik utama yang paling dekat dengan "${title}"?`,
      pilihan: [
        `A. ${title}`,
        `B. ${keyTerms[0] || 'Istilah pendukung'} tanpa hubungan dengan dokumen`,
        "C. Topik yang tidak muncul pada teks",
        "D. Ringkasan dari dokumen lain",
        "E. Informasi yang tidak dapat diverifikasi"
      ],
      jawabanBenar: "A",
      pembahasan: `Pilihan A paling sesuai karena diambil dari bagian awal dan kalimat penting yang terbaca dari PDF.`
    },
    {
      pertanyaan: "Mengapa ringkasan harus dibuat dari teks yang berhasil diekstrak?",
      pilihan: [
        "A. Agar isi ringkasan tetap sesuai dokumen dan tidak mengarang",
        "B. Agar ringkasan terlihat lebih panjang",
        "C. Agar semua topik luar dapat ditambahkan",
        "D. Agar file gambar tetap bisa dianggap teks",
        "E. Agar sumber dokumen tidak diperlukan"
      ],
      jawabanBenar: "A",
      pembahasan: "Ringkasan yang baik harus setia pada teks sumber. Jika teks tidak terbaca, sistem harus menampilkan error, bukan membuat isi acak."
    },
    {
      pertanyaan: `Istilah mana yang paling sering terdeteksi dari dokumen ini?`,
      pilihan: [
        `A. ${keyTerms[0] || 'materi'}`,
        `B. ${keyTerms[1] || 'contoh'}`,
        `C. ${keyTerms[2] || 'latihan'}`,
        "D. Istilah yang tidak muncul sama sekali",
        "E. Nama file tanpa isi"
      ],
      jawabanBenar: "A",
      pembahasan: "Istilah pada pilihan A dipilih dari frekuensi kata penting yang terbaca dari dokumen."
    },
    {
      pertanyaan: "Apa yang harus dilakukan jika ringkasan terasa tidak sesuai isi PDF?",
      pilihan: [
        "A. Periksa apakah teks PDF dapat diseleksi dan terbaca",
        "B. Tetap percaya ringkasan walau teks kosong",
        "C. Tambahkan topik dari luar dokumen",
        "D. Abaikan sumber PDF",
        "E. Ubah jawaban tanpa membaca dokumen"
      ],
      jawabanBenar: "A",
      pembahasan: "Jika PDF berupa scan/gambar atau teksnya rusak, ekstraksi bisa gagal. Sistem harus memberi pesan jujur."
    },
    {
      pertanyaan: "Bagian ringkasan mana yang paling membantu belajar mandiri?",
      pilihan: [
        "A. Poin penting, konsep utama, contoh, dan rangkuman",
        "B. Judul saja tanpa isi",
        "C. Topik luar yang tidak ada dalam PDF",
        "D. Kutipan acak tanpa konteks",
        "E. Jawaban yang tidak memiliki sumber"
      ],
      jawabanBenar: "A",
      pembahasan: "Struktur itu membantu siswa memahami isi, mengingat konsep, dan mengecek kembali sumbernya."
    }
  ];

  const flashcard = [
    { depan: `Topik utama`, belakang: title },
    ...keyTerms.slice(0, 4).map((term) => ({ depan: term, belakang: `Istilah yang muncul dalam dokumen dan perlu dicek kembali pada konteks aslinya.` })),
  ];

  const timeline = [
    { date: "Langkah 1", title: "Baca Judul dan Poin Awal", description: points[0] || "Identifikasi topik utama dokumen." },
    { date: "Langkah 2", title: "Tandai Konsep Kunci", description: keyTerms.slice(0, 4).join(', ') || "Cari istilah yang sering muncul." },
    { date: "Langkah 3", title: "Cek Contoh dan Rangkuman", description: example },
  ];

  return { ringkasan, kuis, flashcard, timeline };
}

function normalizePdfAiData(aiData: any, text: string) {
  const fallback = generateMockPdfData(text);
  const fallbackQuizzes = fallback.kuis;
  const fallbackFlashcards = fallback.flashcard;
  const fallbackTimeline = fallback.timeline;

  const kuis = Array.isArray(aiData?.kuis) ? aiData.kuis : [];
  const normalizedKuis = kuis
    .filter((item: any) => item && typeof item.pertanyaan === 'string')
    .map((item: any, index: number) => {
      const fallbackItem = fallbackQuizzes[index] || fallbackQuizzes[0];
      const rawOptions = Array.isArray(item.pilihan) ? item.pilihan.filter(Boolean).map(String) : [];
      const pilihan = [...rawOptions, ...fallbackItem.pilihan].slice(0, 5);
      const jawabanBenar = ['A', 'B', 'C', 'D', 'E'].includes(item.jawabanBenar)
        ? item.jawabanBenar
        : fallbackItem.jawabanBenar;

      return {
        pertanyaan: item.pertanyaan.trim(),
        pilihan,
        jawabanBenar,
        pembahasan: typeof item.pembahasan === 'string' && item.pembahasan.trim()
          ? item.pembahasan.trim()
          : fallbackItem.pembahasan,
      };
    });

  const flashcard = Array.isArray(aiData?.flashcard) ? aiData.flashcard : [];
  const normalizedFlashcards = flashcard
    .filter((item: any) => item && typeof item.depan === 'string' && typeof item.belakang === 'string')
    .map((item: any) => ({
      depan: item.depan.trim(),
      belakang: item.belakang.trim(),
    }));

  const timeline = Array.isArray(aiData?.timeline) ? aiData.timeline : [];
  const normalizedTimeline = timeline
    .filter((item: any) => item && typeof item.title === 'string')
    .map((item: any, index: number) => ({
      date: typeof item.date === 'string' && item.date.trim() ? item.date.trim() : `Langkah ${index + 1}`,
      title: item.title.trim(),
      description: typeof item.description === 'string' && item.description.trim()
        ? item.description.trim()
        : 'Pelajari bagian ini dengan membaca kembali teks sumber PDF.',
    }));

  return {
    ringkasan: typeof aiData?.ringkasan === 'string' && aiData.ringkasan.trim()
      ? aiData.ringkasan.trim()
      : fallback.ringkasan,
    kuis: [...normalizedKuis, ...fallbackQuizzes].slice(0, 5),
    flashcard: [...normalizedFlashcards, ...fallbackFlashcards].slice(0, 7),
    timeline: [...normalizedTimeline, ...fallbackTimeline].slice(0, 5),
  };
}

function extractPartialObjectFromAiError(error: any) {
  return error?.cause?.value || error?.value || null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json({ error: 'Ukuran file maksimal 10 MB' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";
    let pageTotal = 0;

    const isPdf = buffer.length >= 4 && buffer.slice(0, 4).toString('utf-8') === '%PDF';
    try {
      // Check if buffer starts with %PDF magic bytes
      if (isPdf) {
        const parser = new PDFParse({ data: buffer });
        const textResult = await parser.getText();
        text = textResult.text;
        pageTotal = textResult.total;
      } else {
        const isTextLike =
          file.type.startsWith('text/') ||
          /\.(txt|md|csv)$/i.test(file.name);
        if (!isTextLike) {
          return NextResponse.json({ error: 'File harus berupa PDF atau teks catatan yang valid.' }, { status: 415 });
        }
        // Parse as plain text if it's not a PDF
        text = buffer.toString('utf-8');
        pageTotal = 1;
      }
    } catch (parseError) {
      console.error("Failed to parse PDF/text:", parseError);
      if (isPdf) {
        return NextResponse.json(
          { error: 'Teks PDF tidak dapat diekstrak. Kemungkinan file berupa scan/gambar, terenkripsi, atau struktur PDF rusak.' },
          { status: 400 }
        );
      }
      text = buffer.toString('utf-8');
      pageTotal = 1;
    }

    text = normalizeExtractedText(removeRepeatedPdfNoise(normalizeExtractedText(text)));

    if (!text.trim() || !hasEnoughReadableText(text)) {
      return NextResponse.json(
        { error: 'Teks PDF tidak dapat dibaca. Kemungkinan PDF berupa hasil scan/gambar atau teksnya terlalu sedikit.' },
        { status: 400 }
      );
    }

    const model = getServerAiModel();
    if (!model) {
      if (!canUseDevelopmentFallback()) {
        return NextResponse.json({ error: AI_ENV_ERROR }, { status: 503 });
      }
      console.warn("No AI model configured. Returning development summary fallback.");
      const mockData = generateMockPdfData(text);
      return NextResponse.json({
        ...mockData,
        halamanTotal: pageTotal,
        kataTerdeteksi: text.split(/\s+/).length,
        isMock: true
      });
    }

    try {
      const pdfContext = buildPdfContext(text);
      const result = await runAiWithRetry(
        () => generateObject({
          model,
          maxRetries: 0,
          schema: z.object({
            ringkasan: z.string().describe('Ringkasan markdown Bahasa Indonesia yang setia pada isi dokumen.'),
            kuis: z.array(z.object({
              pertanyaan: z.string(),
              pilihan: z.array(z.string()).min(2).max(5),
              jawabanBenar: z.enum(['A', 'B', 'C', 'D', 'E']),
              pembahasan: z.string(),
            })).min(1).max(5),
            flashcard: z.array(z.object({
              depan: z.string(),
              belakang: z.string(),
            })).min(1).max(7),
            timeline: z.array(z.object({
              date: z.string(),
              title: z.string(),
              description: z.string(),
            })).min(1).max(5),
          }),
          prompt: `Kamu adalah tutor pendidikan. Buat ringkasan yang akurat hanya berdasarkan isi PDF yang diberikan. Jangan menambahkan informasi dari luar dokumen. Jika ada bagian yang tidak jelas, tulis "bagian ini tidak terbaca jelas".

Aturan:
- Gunakan hanya potongan PDF di bawah sebagai sumber.
- Jangan mengarang topik, contoh, definisi, rumus, atau fakta yang tidak muncul di dokumen.
- Hindari pengulangan. Gabungkan ide yang sama menjadi satu poin.
- Susun berdasarkan bab/subbab jika terdeteksi dari dokumen.
- Istilah penting harus berasal dari teks PDF dan diberi definisi sesuai konteks dokumen.
- Contoh harus berasal dari dokumen; jika tidak ada contoh, tulis "Dokumen tidak memuat contoh eksplisit."
- Soal kuis harus bisa dijawab dari isi dokumen, bukan dari pengetahuan luar.
- Gunakan Bahasa Indonesia yang jelas, ringkas, dan cocok untuk siswa.

Format ringkasan markdown:
## 1. Judul/topik utama
## 2. Tujuan pembelajaran jika tersedia
## 3. Poin-poin penting
## 4. Penjelasan konsep utama
## 5. Istilah penting dan definisi
## 6. Contoh dari dokumen
## 7. Kesimpulan
## 8. Potensi materi yang sering keluar sebagai soal
## 9. Catatan keterbacaan dokumen

POTONGAN PDF:
${pdfContext}`,
        }),
        { label: 'Ringkasan PDF' }
      );
      const normalized = normalizePdfAiData(result.object, text);

      return NextResponse.json({
        ringkasan: normalized.ringkasan,
        kuis: normalized.kuis,
        flashcard: normalized.flashcard,
        timeline: normalized.timeline,
        halamanTotal: pageTotal,
        kataTerdeteksi: text.split(/\s+/).length,
      });
    } catch (aiError) {
      console.error("AI PDF summary generation failed:", aiError);
      const partialObject = extractPartialObjectFromAiError(aiError);
      if (partialObject) {
        const normalized = normalizePdfAiData(partialObject, text);
        return NextResponse.json({
          ...normalized,
          halamanTotal: pageTotal,
          kataTerdeteksi: text.split(/\s+/).length,
          isPartialAiResult: true,
        });
      }

      const mockData = normalizePdfAiData(generateMockPdfData(text), text);
      return NextResponse.json({
        ...mockData,
        halamanTotal: pageTotal,
        kataTerdeteksi: text.split(/\s+/).length,
        isMock: canUseDevelopmentFallback(),
        isFallbackSummary: true,
        warning: 'Provider AI gagal membuat ringkasan penuh, jadi sistem membuat ringkasan cadangan dari teks PDF yang berhasil diekstrak.'
      });
    }
  } catch (error) {
    console.error('PDF process error:', error);
    return NextResponse.json({ error: 'Gagal memproses PDF' }, { status: 500 });
  }
}
