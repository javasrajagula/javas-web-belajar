import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { ratelimiter } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, context } = body;
    const lastMessage = messages[messages.length - 1]?.content || "";

    // Authenticate user
    const session = await auth();
    const userId = session?.user?.id || req.headers.get("x-forwarded-for") || "anonymous";

    // Rate Limit Check (max 15 requests per minute)
    const { success, limit, remaining, reset } = await ratelimiter.limit(userId);

    if (!success) {
      return new Response(
        JSON.stringify({
          error: "Terlalu banyak permintaan.",
          message: "Batas laju terlampaui. Anda hanya diperbolehkan mengirim maksimal 15 pertanyaan per menit.",
          limit,
          remaining,
          reset
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


    // Extract context details
    const studentName = context?.studentName || "Alex Mercer";
    const grade = context?.grade || 10;
    const schoolType = context?.schoolType || "sma";
    const selectedPathway = context?.selectedPathway || "Umum";
    const lessonTitle = context?.lessonTitle || "Persamaan Eksponen";
    const subjectTitle = context?.subjectTitle || "Matematika";
    const cpStatement = context?.cpStatement || "";
    const mode = context?.mode || "teacher";

    // Generate pedagogical response based on context & mode
    let responseText = "";

    if (mode === "simple") {
      responseText = `Halo ${studentName}! Mari kita sederhanakan topik **${lessonTitle}** dari kelas **${subjectTitle}** ini. Bayangkan eksponen seperti sebuah mesin pengganda cepat. Jika kita punya basis 2 dan eksponen 3 ($2^3$), itu artinya mesin menduplikasi angka 2 sebanyak 3 kali: $2 \\times 2 \\times 2 = 8$. Logaritma adalah cara kita bertanya balik: 'Mesin harus menduplikasi 2 berapa kali agar jadi 8?' Jawabannya adalah 3! Apakah penjelasan sederhana ini membantumu?`;
    } else if (mode === "professor") {
      responseText = `Selamat belajar, ${studentName}. Mari kita analisis topik **${lessonTitle}** secara mendalam. Dalam domain kurikulum Fase ${grade === 10 ? 'E' : 'F'} ${schoolType.toUpperCase()} untuk mata pelajaran **${subjectTitle}**, materi ini dirancang untuk mewujudkan Capaian Pembelajaran: *"${cpStatement}"*. \n\nSecara teoritis, kita sedang mengeksplorasi sifat pemetaan transendental $f(x) = a^x$. Mari kita bedah pembuktian sifat-sifat eksponensial di bawah syarat basis $a > 0$ dan $a \\neq 1$. Bagian pembuktian mana yang paling menarik perhatian akademismu?`;
    } else if (mode === "exam") {
      responseText = `Halo ${studentName}, saatnya menguji pemahamanmu untuk topik **${lessonTitle}**! Coba pecahkan persoalan kognitif berikut:\n\n**Soal:** \nJika diketahui persamaan eksponen $5^{2x - 4} = 125$, berapakah nilai $x$ yang memenuhi persamaan tersebut?\n\nKetik jawabanmu beserta langkah penyelesaiannya di sini, dan saya akan mengevaluasi logika berfikirmu!`;
    } else if (mode === "debate") {
      responseText = `Menarik sekali kamu ingin mendiskusikan **${lessonTitle}**, ${studentName}. Banyak siswa langsung menerima rumus ini secara mentah-mentah. Namun, mari kita bersikap skeptis: apakah menurutmu logaritma dan eksponen memiliki relevansi nyata pada konsentrasi studi kejuruanmu di **${selectedPathway}**, ataukah ini hanya sekadar prasyarat kurikuler formalitas? Bagaimana sudut pandangmu?`;
    } else {
      // Default: teacher
      responseText = `Halo ${studentName}! Sebagai gurumu untuk mata pelajaran **${subjectTitle}** Kelas **${grade} ${schoolType.toUpperCase()}**, mari kita bahas topik **${lessonTitle}**. Berdasarkan Capaian Pembelajaran (CP) kita, tujuan pembelajaran hari ini adalah agar kamu mahir memecahkan studi kasus terkait topik ini.\n\nApakah ada bagian dari ringkasan, rumus, atau kuis mandiri di modul ini yang terasa membingungkan bagi kamu?`;
    }

    // Append context-aware response details based on search text
    const query = lastMessage.toLowerCase();
    if (query.includes("contoh") || query.includes("soal") || query.includes("latihan")) {
      responseText += `\n\n**Contoh Tambahan:**\nJika kita memiliki persamaan eksponensial $3^{x} = 81$, karena basisnya adalah 3, kita ubah 81 menjadi basis yang sama: $81 = 3^4$. Dengan demikian, kita peroleh $x = 4$.`;
    } else if (query.includes("pkl") || query.includes("magang") || query.includes("industri")) {
      responseText += `\n\n*Catatan Kejuruan:* Topik ini juga sangat berguna untuk menganalisis pertumbuhan data di server atau memetakan performa database saat kamu melakukan PKL nanti!`;
    }

    // Convert responseText to a ReadableStream to stream word-by-word
    const encoder = new TextEncoder();
    const words = responseText.split(" ");

    const stream = new ReadableStream({
      async start(controller) {
        for (const word of words) {
          controller.enqueue(encoder.encode(word + " "));
          // Simulate latency
          await new Promise((resolve) => setTimeout(resolve, 60));
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
