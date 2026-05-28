import { NextRequest } from "next/server";
import { generateText } from "ai";
import { auth } from "@/auth";
import { ratelimiter } from "@/lib/ratelimit";
import { searchSimilarChunks } from "@/lib/actions/rag";
import { AI_ENV_ERROR, canUseDevelopmentFallback, getServerAiModel, getServerAiProviderStatus, runAiWithRetry } from "@/lib/ai-provider";

export const maxDuration = 45;

export async function GET() {
  const status = getServerAiProviderStatus();
  return Response.json({
    ok: status.hasGeminiApiKey || status.hasAnthropicApiKey,
    ...status,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, mode = 'teacher', jurusan = 'TKJ', kelas = 11, context } = body;
    if (!Array.isArray(messages) || !messages.length) {
      return new Response("Pesan tidak boleh kosong.", { status: 400 });
    }
    const lastMessage = messages[messages.length - 1]?.content?.trim() || "";
    if (!lastMessage) {
      return new Response("Pesan tidak boleh kosong.", { status: 400 });
    }

    // Authenticate user
    const session = await auth();
    const userId = session?.user?.id || req.headers.get("x-forwarded-for") || "anonymous";

    // Rate Limit Check
    try {
      const { success, limit, remaining, reset } = await ratelimiter.limit(userId);
      if (!success) {
        return new Response(
          JSON.stringify({
            error: "Terlalu banyak permintaan.",
            message: "Batas laju terlampaui. Maksimal 15 pertanyaan per menit.",
            limit,
            remaining,
            reset,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (rateLimitError) {
      console.warn("Rate limiter failed, bypassing:", rateLimitError);
    }

    // RAG Search for school documents
    const matchedChunks = await searchSimilarChunks(lastMessage, 3);
    let ragContext = "";
    if (matchedChunks.length > 0) {
      ragContext =
        "\n\n## Referensi Materi Sekolah (Dokumen Terunggah):\n" +
        matchedChunks.map((c) => `- [Dokumen: ${c.documentTitle}] "${c.content}"`).join("\n");
    }

    // Mode guidelines
    const modeInstructions: Record<string, string> = {
      simple: `Gunakan bahasa yang sangat sederhana, analogis, dan santai. Jelaskan konsep seolah-olah siswa baru pertama kali belajar. Gunakan emoji secara kreatif.`,
      professor: `Berikan penjelasan mendalam tingkat akademis/teoritis. Gunakan terminologi profesional industri, kutip teori/standar industri, dan dorong penalaran logis.`,
      exam: `Buat soal latihan/kuis singkat untuk mengevaluasi pemahaman siswa secara interaktif. Berikan umpan balik setelah siswa merespons.`,
      debate: `Tantang argumen siswa tentang topik kejuruan ini. Ajak mereka berdiskusi tentang studi kasus industri dan pertahankan opini mereka.`,
      teacher: `Bersikaplah seperti guru produktif SMK yang sabar, membimbing langkah-demi-langkah, dan membedakan fakta, asumsi, serta saran belajar.`,
    };

    // Build pedagogical system prompt based on Vocational major (Jurusan) and Class
    const systemPrompt = `Kamu adalah **Tutor AI BelajarKU**, asisten belajar khusus siswa SMK Indonesia jurusan **${jurusan}** kelas **${kelas}**.
Kamu memahami Kurikulum Merdeka SMK secara mendalam (Fase ${kelas <= 10 ? "E" : "F"}).

## Gaya Bahasa & Komunikasi
- Gunakan Bahasa Indonesia yang baku namun santai, komunikatif, dan mudah dipahami siswa SMK usia 15-18 tahun.
- Saat menjelaskan konsep abstrak, **selalu gunakan analogi riil dari dunia kerja / industri** yang relevan dengan jurusan siswa:
  * Contoh untuk TKJ: analogikan dengan kabel LAN, router, IP address, data packet, atau bandwidth.
  * Contoh untuk RPL: analogikan dengan modular programming, class/object OOP, flow control, database record, atau debugging.
  * Contoh untuk AKL: analogikan dengan balance sheet, ledger, debit-kredit, laporan rugi-laba, atau audit transaksi.
  * Contoh untuk OTKP: analogikan dengan tata kelola persuratan, pengarsipan berkas digital, SOP kantor, atau etika pelayanan tamu.
  * Jurusan lainnya: sesuaikan secara logis dengan materi praktik bengkel/industri.

## Mode Mengajar Aktif: ${mode.toUpperCase()}
${modeInstructions[mode] || modeInstructions.teacher}

## Aturan Output
1. Gunakan format **Markdown** (headings, bold, lists, code blocks).
2. Tulis rumus matematika dengan LaTeX: $inline$ atau $$block$$.
3. Jangan pernah memberikan kode jawaban secara mentah; bantu siswa memahami alur logikanya terlebih dahulu.
4. Jangan mengarang data sekolah, standar industri, nilai, materi aplikasi, atau isi dokumen yang tidak diberikan.
5. Jika pertanyaan membutuhkan konteks materi aplikasi tetapi konteks tidak tersedia, katakan jujur: "Konteks materi khusus belum tersedia." Setelah itu boleh berikan penjelasan umum yang diberi label **Penjelasan umum**.
6. Jika ada Referensi Materi Sekolah atau Materi Aktif, jawab terutama dari konteks itu dan sebutkan keterbatasannya bila konteks tidak cukup.
7. Sisipkan komponen interaktif secara alami (terutama jika siswa meminta kuis, latihan, tes, kartu hafalan, atau flashcard):

### Kuis Pilihan Ganda (Interactive Quiz)
Format token: [QUIZ: pertanyaan | opsi_salah_1 | opsi_salah_2 | opsi_salah_3 | jawaban_benar | index_jawaban_benar_0-based | penjelasan_pembahasan]
Contoh: [QUIZ: Apa perintah Linux untuk memeriksa IP address? | ping | ipconfig | cd | ip a | 3 | Perintah 'ip a' digunakan pada sistem Linux/UNIX untuk menampilkan seluruh konfigurasi interface jaringan.]

### Kartu Hafalan (Flashcard)
Format token: [FLASHCARD: istilah_depan | definisi_belakang]
Contoh: [FLASHCARD: Apa itu encapsulation? | Konsep membungkus data (properti) dan metode di dalam kelas untuk melindunginya dari modifikasi langsung luar.]

${ragContext}
${context ? `\n## Materi Aktif Terkait:\n- Modul: ${context.lessonTitle || 'Umum'}\n- Konten: ${context.contentPreview || ''}` : ''}`;

    // Select available LLM model
    const modelInstance = getServerAiModel();

    if (!modelInstance) {
      if (!canUseDevelopmentFallback()) {
        return new Response(AI_ENV_ERROR, { status: 503 });
      }
      console.warn("No AI API keys configured. Returning development tutor fallback.");
      return generateMockTutorStream(messages, mode, jurusan, kelas);
    }

    try {
      const safeMessages = normalizeTutorMessages(messages);
      if (!safeMessages.length) {
        return new Response("Pesan tidak boleh kosong.", { status: 400 });
      }

      const result = await runAiWithRetry(
        () => generateText({
          model: modelInstance,
          system: systemPrompt,
          messages: safeMessages,
          temperature: 0.35,
        }),
        { label: 'Tutor AI' }
      );

      if (!result.text.trim()) {
        if (!canUseDevelopmentFallback()) {
          return new Response("Provider AI mengembalikan respons kosong.", { status: 502 });
        }
        console.warn("AI Tutor returned an empty response. Falling back to development mock.");
        return generateMockTutorStream(messages, mode, jurusan, kelas);
      }

      return new Response(result.text, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } catch (aiError) {
      console.error("AI Tutor generation failed:", aiError);
      if (!canUseDevelopmentFallback()) {
        return new Response("Provider AI gagal menjawab. Periksa konfigurasi Gemini/API key di Vercel.", { status: 502 });
      }
      return generateMockTutorStream(messages, mode, jurusan, kelas);
    }
  } catch (error) {
    console.error("AI Tutor API error:", error);
    return new Response("Terjadi kesalahan internal pada server.", { status: 500 });
  }
}

function normalizeTutorMessages(messages: Array<{ role?: string; content?: string }>) {
  const normalized = messages
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
      content: String(m.content || '').trim(),
    }))
    .filter((m) => {
      if (!m.content) return false;
      if (
        m.role === 'assistant' &&
        (
          m.content.startsWith('Halo! Saya adalah Tutor AI Academy OS') ||
          m.content.startsWith('Maaf, Tutor AI belum bisa menjawab sekarang') ||
          m.content.startsWith('Respons AI kosong atau gagal diproses')
        )
      ) {
        return false;
      }
      return true;
    })
    .slice(-10);

  while (normalized.length && normalized[0].role !== 'user') {
    normalized.shift();
  }

  const collapsed: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  for (const message of normalized) {
    const previous = collapsed[collapsed.length - 1];
    const content = message.content.length > 6_000 ? `${message.content.slice(0, 6_000)}\n\n[Riwayat dipotong agar tetap aman dikirim ke AI.]` : message.content;
    if (previous?.role === message.role) {
      previous.content = `${previous.content}\n\n${content}`;
    } else {
      collapsed.push({ role: message.role, content });
    }
  }

  return collapsed;
}

function generateMockTutorStream(messages: any[], mode: string, jurusan: string, kelas: number) {
  const lastMessage = messages[messages.length - 1]?.content || "";
  
  // Make the response sound like a tutor answering the user's specific text
  let response = `Halo! Saya adalah **Tutor AI BelajarKU** (Mode Offline). 

Saat ini, platform sedang berjalan dalam mode offline/simulasi karena API key belum terkonfigurasi atau bermasalah. Namun, saya siap membantu Anda mensimulasikan materi pembelajaran jurusan **${jurusan}** (Kelas **${kelas}**).

Terkait pertanyaan Anda: *"${lastMessage.slice(0, 100)}${lastMessage.length > 100 ? '...' : ''}"*

Berikut adalah konsep penting yang perlu dipahami:
1. **Konsep Dasar**: Pemahaman teori dan praktik yang sesuai dengan standar industri.
2. **Kesesuaian Kompetensi**: Selalu mengacu pada Standard Operating Procedure (SOP) yang diajarkan di kelas.
3. **Penyelesaian Masalah**: Lakukan troubleshooting secara berurutan dan terstruktur.

Apakah Anda ingin saya membuat latihan kuis singkat atau flashcard tentang topik ini? Silakan minta saya dengan mengetik "kuis" atau "flashcard".`;

  if (lastMessage.toLowerCase().includes("kuis") || lastMessage.toLowerCase().includes("latihan") || lastMessage.toLowerCase().includes("soal")) {
    response = `Tentu! Berikut adalah kuis pilihan ganda singkat untuk menguji pemahaman Anda:

[QUIZ: Apa langkah pertama dalam menyelesaikan masalah (troubleshooting) di laboratorium kejuruan? | Langsung mengganti komponen yang dicurigai | Melakukan pemeriksaan fisik dan verifikasi masalah sesuai SOP | Mengabaikan pesan error pada layar | Meminta bantuan teman tanpa menganalisis sendiri | 1 | Langkah pertama yang benar adalah mengidentifikasi dan memverifikasi masalah secara sistematis agar tidak terjadi kesalahan diagnosis.]

[QUIZ: Mengapa standardisasi kerja (SOP) sangat penting dalam dunia industri? | Agar pekerjaan selesai lebih lama | Untuk mempersulit proses audit internal | Menjaga konsistensi kualitas, efisiensi, dan keselamatan kerja | Sebagai formalitas dokumentasi administrasi saja | 2 | SOP dibuat agar proses kerja efisien, aman, dan menghasilkan kualitas produk/layanan yang konsisten.]

Silakan jawab pertanyaan di atas!`;
  } else if (lastMessage.toLowerCase().includes("flashcard") || lastMessage.toLowerCase().includes("kartu")) {
    response = `Tentu! Berikut adalah kartu hafalan (flashcard) terkait kompetensi kejuruan Anda:

[FLASHCARD: Standard Operating Procedure (SOP) | Dokumen tertulis yang memuat urutan instruksi kerja standar untuk menjamin kualitas dan keselamatan kerja.]

[FLASHCARD: Troubleshooting | Proses sistematis untuk melacak, mendiagnosis, dan menyelesaikan kerusakan atau masalah pada sistem.]

[FLASHCARD: Link and Match | Program penyelarasan kurikulum pendidikan vokasi agar sesuai dengan kebutuhan keahlian dunia industri.]`;
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Split into chunks of ~5 characters to simulate streaming speed
      const chunks = response.match(/[\s\S]{1,5}/g) || [response];
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
        await new Promise(r => setTimeout(r, 15));
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
