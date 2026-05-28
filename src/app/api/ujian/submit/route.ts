import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      mataPelajaranId, 
      judul, 
      tipe, 
      durasiDetik, 
      jawabanDetail 
    } = body;

    if (!mataPelajaranId || !judul || !tipe || !jawabanDetail || typeof jawabanDetail !== 'object') {
      return NextResponse.json({ error: 'Data hasil ujian tidak lengkap' }, { status: 400 });
    }

    const questionIds = Object.keys(jawabanDetail);
    if (questionIds.length === 0) {
      return NextResponse.json({ error: 'Tidak ada jawaban untuk dinilai' }, { status: 400 });
    }

    const questions = await prisma.bankSoal.findMany({
      where: {
        id: { in: questionIds },
        mataPelajaranId,
      },
      select: {
        id: true,
        pertanyaan: true,
        tipe: true,
        pilihan: true,
        jawabanBenar: true,
        pembahasan: true,
        tags: true,
      },
    });

    if (questions.length !== questionIds.length) {
      return NextResponse.json({ error: 'Sebagian soal tidak valid untuk mata pelajaran ini' }, { status: 400 });
    }

    let benar = 0;
    const detailTernilai: Record<string, any> = {};

    for (const q of questions) {
      const rawAnswer = jawabanDetail[q.id]?.userAnswer ?? '';
      const userAnswer = String(rawAnswer);
      let isCorrect = false;

      if (q.tipe === 'pilihan_ganda') {
        isCorrect = userAnswer.trim().charAt(0).toUpperCase() === q.jawabanBenar.trim().charAt(0).toUpperCase();
      } else if (q.tipe === 'benar_salah') {
        isCorrect = userAnswer.trim().toLowerCase() === q.jawabanBenar.trim().toLowerCase();
      } else {
        isCorrect = userAnswer.trim().toLowerCase() === q.jawabanBenar.trim().toLowerCase();
      }

      if (isCorrect) benar++;
      let options: any = q.pilihan;
      if (typeof options === 'string') {
        try {
          options = JSON.parse(options);
        } catch {
          options = [];
        }
      }

      detailTernilai[q.id] = {
        pertanyaan: q.pertanyaan,
        userAnswer,
        correctAnswer: q.jawabanBenar,
        isCorrect,
        pembahasan: q.pembahasan,
        options,
        tipe: q.tipe,
        tags: q.tags,
      };
    }

    const totalSoal = questions.length;
    const salah = totalSoal - benar;
    const nilaiAkhir = Math.round((benar / totalSoal) * 100 * 10) / 10;

    // Save exam result to DB
    const hasil = await prisma.hasilUjian.create({
      data: {
        userId,
        mataPelajaranId,
        judul,
        tipe,
        totalSoal,
        benar,
        salah,
        nilaiAkhir,
        durasiDetik: Number(durasiDetik) || 0,
        jawabanDetail: detailTernilai,
      }
    });

    // Award XP based on exam performance
    // Base XP: 100 XP for participation + (nilaiAkhir * 2) XP for accuracy
    const xpEarned = Math.round(100 + (nilaiAkhir * 2));
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: {
          increment: xpEarned
        }
      }
    });

    return NextResponse.json({
      success: true,
      id: hasil.id,
      xpReward: xpEarned,
      message: 'Hasil ujian berhasil disimpan.'
    });
  } catch (error) {
    console.error('Failed to submit exam:', error);
    return NextResponse.json({ error: 'Gagal memproses hasil ujian' }, { status: 500 });
  }
}
