import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    // Fetch user's exam records
    const exams = await prisma.hasilUjian.findMany({
      where: { userId },
      select: {
        id: true,
        judul: true,
        tipe: true,
        nilaiAkhir: true,
        totalSoal: true,
        benar: true,
        salah: true,
        jawabanDetail: true,
        createdAt: true,
      }
    });

    const totalExams = exams.length;
    const averageScore = totalExams > 0 
      ? Math.round(exams.reduce((sum, e) => sum + e.nilaiAkhir, 0) / totalExams * 10) / 10
      : 0;
    
    const totalQuestionsAnswered = exams.reduce((sum, e) => sum + e.totalSoal, 0);
    const latestExam = exams
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] || null;

    const topicBuckets: Record<string, { total: number; wrong: number }> = {};
    exams.forEach((exam) => {
      const details = exam.jawabanDetail as Record<string, { isCorrect?: boolean; tags?: string[] }> | null;
      Object.values(details || {}).forEach((detail) => {
        const topic = detail.tags?.[2] || detail.tags?.[0] || 'Topik Umum';
        if (!topicBuckets[topic]) topicBuckets[topic] = { total: 0, wrong: 0 };
        topicBuckets[topic].total += 1;
        if (!detail.isCorrect) topicBuckets[topic].wrong += 1;
      });
    });

    const weakTopics = Object.entries(topicBuckets)
      .map(([topic, data]) => ({
        topic,
        mastery: Math.max(0, Math.round(((data.total - data.wrong) / data.total) * 100)),
        wrong: data.wrong,
        total: data.total,
      }))
      .filter((topic) => topic.total > 0)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 4);

    // Fetch completed lesson progress
    const completedLessonsCount = await prisma.materiProgress.count({
      where: {
        userId,
        completed: true,
      }
    });

    return NextResponse.json({
      totalExams,
      averageScore,
      totalQuestionsAnswered,
      completedLessonsCount,
      latestExam: latestExam ? {
        id: latestExam.id,
        judul: latestExam.judul,
        tipe: latestExam.tipe,
        nilaiAkhir: latestExam.nilaiAkhir,
        benar: latestExam.benar,
        salah: latestExam.salah,
        createdAt: latestExam.createdAt,
      } : null,
      weakTopics,
    });
  } catch (error) {
    console.error('Failed to load user stats:', error);
    return NextResponse.json({ error: 'Gagal memuat statistik pengguna' }, { status: 500 });
  }
}
