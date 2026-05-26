import { NextRequest } from "next/server";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/auth";
import { ratelimiter } from "@/lib/ratelimit";
import { searchSimilarChunks } from "@/lib/actions/rag";

// Check if Gemini API key is configured
const hasGeminiKey = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, context } = body;
    const lastMessage = messages[messages.length - 1]?.content || "";

    // Authenticate user
    const session = await auth();
    const userId =
      session?.user?.id ||
      req.headers.get("x-forwarded-for") ||
      "anonymous";

    // Rate Limit Check (max 15 requests per minute)
    // Wrapped in try-catch: if Redis/ratelimiter fails, bypass and allow request
    try {
      const { success, limit, remaining, reset } =
        await ratelimiter.limit(userId);

      if (!success) {
        return new Response(
          JSON.stringify({
            error: "Terlalu banyak permintaan.",
            message:
              "Batas laju terlampaui. Anda hanya diperbolehkan mengirim maksimal 15 pertanyaan per menit.",
            limit,
            remaining,
            reset,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            },
          }
        );
      }
    } catch (rateLimitError) {
      console.warn("Rate limiter failed, bypassing:", rateLimitError);
      // Continue processing the request without rate limiting
    }

    // RAG Search for school documents
    const matchedChunks = await searchSimilarChunks(lastMessage, 3);
    let ragContext = "";
    if (matchedChunks.length > 0) {
      ragContext =
        "\n\n## Referensi Materi Sekolah (Unggahan Guru):\n" +
        matchedChunks
          .map(
            (c) =>
              `- [Dokumen: ${c.documentTitle}] "${c.content}"`
          )
          .join("\n");
    }

    // Extract context details
    const studentName = context?.studentName || "Siswa";
    const grade = context?.grade || 10;
    const schoolType = context?.schoolType || "sma";
    const selectedPathway = context?.selectedPathway || "Umum";
    const lessonTitle = context?.lessonTitle || "";
    const subjectTitle = context?.subjectTitle || "";
    const cpStatement = context?.cpStatement || "";
    const mode = context?.mode || "teacher";

    // Build pedagogical system prompt
    const modeInstructions: Record<string, string> = {
      simple: `Gunakan bahasa yang sangat sederhana, analogis, dan ramah. Jelaskan konsep seolah-olah siswa baru pertama kali belajar. Gunakan emoji untuk membuat penjelasan lebih hidup.`,
      professor: `Berikan penjelasan mendalam tingkat akademis. Gunakan terminologi formal, kutip teori/prinsip yang relevan, dan dorong siswa berpikir kritis.`,
      exam: `Buat soal latihan dan evaluasi pemahaman siswa. Berikan soal bertahap dari mudah ke sulit. Setelah siswa menjawab, berikan koreksi dan penjelasan rinci.`,
      debate: `Ajak siswa berdiskusi dan berdebat tentang topik. Tantang asumsi mereka, berikan perspektif alternatif, dan dorong argumentasi logis.`,
      teacher: `Bersikaplah seperti guru favorit yang sabar dan inspiratif. Jelaskan dengan jelas, berikan contoh konkret, dan motivasi siswa untuk terus belajar.`,
    };

    const systemPrompt = `Kamu adalah **Tutor AI Academy OS Ω**, asisten belajar pintar untuk siswa ${schoolType.toUpperCase()} Kelas ${grade} Indonesia dengan konsentrasi **${selectedPathway}**.

## Identitas & Peran
- Nama siswa yang sedang kamu bantu: **${studentName}**
- Kurikulum: Kurikulum Merdeka (Fase ${grade <= 10 ? "E" : "F"})
${subjectTitle ? `- Mata pelajaran aktif: **${subjectTitle}**` : ""}
${lessonTitle ? `- Topik/materi aktif: **${lessonTitle}**` : ""}
${cpStatement ? `- Capaian Pembelajaran (CP): "${cpStatement}"` : ""}

## Mode Mengajar Aktif: ${mode.toUpperCase()}
${modeInstructions[mode] || modeInstructions.teacher}

## Aturan Penting
1. **Selalu jawab dalam Bahasa Indonesia** yang baik dan benar.
2. Gunakan format **Markdown** untuk struktur (heading, bold, list, kode).
3. Untuk rumus matematika, gunakan format LaTeX: $inline$ atau $$block$$.
4. Sesuaikan tingkat kesulitan dengan kelas ${grade} ${schoolType.toUpperCase()}.
5. Jika siswa bertanya di luar topik aktif, tetap jawab dengan baik namun arahkan kembali ke materi.
6. Berikan motivasi dan pujian saat siswa menunjukkan kemajuan.
7. Jika topik berkaitan dengan kejuruan (SMK), hubungkan dengan aplikasi praktis di industri.

## Fitur Generative UI
Kamu bisa menyisipkan komponen interaktif dalam jawabanmu:

### Kuis Interaktif
Gunakan format token berikut untuk membuat kuis pilihan ganda:
[QUIZ: pertanyaan | opsi_salah | opsi_salah | opsi_salah | jawaban_benar | index_jawaban_benar(0-based) | penjelasan]
Contoh: [QUIZ: Berapakah $2^5$? | 10 | 16 | 64 | 32 | 3 | $2^5 = 2×2×2×2×2 = 32$]

### Flashcard
Gunakan format token berikut untuk membuat kartu hafalan:
[FLASHCARD: pertanyaan_depan | jawaban_belakang]
Contoh: [FLASHCARD: Apa itu variabel dalam pemrograman? | Variabel adalah tempat penyimpanan data sementara di memori yang memiliki nama dan tipe data.]

Sisipkan kuis/flashcard secara natural saat relevan, terutama ketika siswa meminta latihan, kuis, tes, ujian, kartu hafalan, atau flashcard.
${ragContext}`;

    // ─── Gemini AI Streaming ───
    if (hasGeminiKey) {
      const result = streamText({
        model: google("gemini-2.0-flash"),
        system: systemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        temperature: 0.7,
      });

      return result.toTextStreamResponse();
    }

    // ─── Fallback: Mock Streaming (jika tidak ada API key) ───
    let responseText = "";

    if (mode === "simple") {
      responseText = `Halo ${studentName}! 👋 Mari kita sederhanakan topik **${lessonTitle || "ini"}**. Bayangkan eksponen seperti mesin pengganda cepat. Jika kita punya basis 2 dan eksponen 3 ($2^3$), itu artinya: $2 \\times 2 \\times 2 = 8$. Mudah kan? 😊`;
    } else if (mode === "professor") {
      responseText = `Selamat belajar, ${studentName}. Mari kita analisis topik **${lessonTitle || "ini"}** secara mendalam dalam konteks kurikulum Fase ${grade === 10 ? "E" : "F"} ${schoolType.toUpperCase()} untuk **${subjectTitle || "mata pelajaran ini"}**.`;
    } else if (mode === "exam") {
      responseText = `Halo ${studentName}! 📝 Saatnya menguji pemahamanmu! Coba kerjakan soal berikut:\n\n**Soal:** Jika $5^{2x - 4} = 125$, berapakah nilai $x$?\n\nKetik jawabanmu beserta langkah penyelesaiannya!`;
    } else if (mode === "debate") {
      responseText = `Menarik, ${studentName}! 🤔 Mari kita diskusikan — apakah menurutmu **${lessonTitle || "materi ini"}** memiliki relevansi nyata untuk konsentrasi **${selectedPathway}**, atau hanya formalitas kurikulum?`;
    } else {
      responseText = `Halo ${studentName}! 👋 Sebagai tutormu untuk **${subjectTitle || "pelajaran ini"}** Kelas ${grade} ${schoolType.toUpperCase()}, mari kita bahas **${lessonTitle || "materi hari ini"}**.\n\nApa yang ingin kamu pelajari atau yang masih membingungkan?`;
    }

    const query = lastMessage.toLowerCase();
    if (query.includes("kuis") || query.includes("tes") || query.includes("uji")) {
      responseText += `\n\n[QUIZ: Berapakah nilai dari $3^4$? | 12 | 27 | 64 | 81 | 3 | $3^4 = 3 \\times 3 \\times 3 \\times 3 = 81$]`;
    } else if (query.includes("flashcard") || query.includes("kartu")) {
      responseText += `\n\n[FLASHCARD: Apa pilar utama Object-Oriented Programming (OOP)? | Enkapsulasi, Pewarisan (Inheritance), Polimorfisme, dan Abstraksi.]`;
    }

    if (ragContext) {
      responseText += ragContext;
    }

    // Stream mock response word-by-word
    const encoder = new TextEncoder();
    const words = responseText.split(" ");

    const stream = new ReadableStream({
      async start(controller) {
        for (const word of words) {
          controller.enqueue(encoder.encode(word + " "));
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
