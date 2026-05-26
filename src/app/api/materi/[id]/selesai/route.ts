import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const resolvedParams = await params;
    const materiId = resolvedParams.id;

    // Check if the materi exists
    const materi = await prisma.materi.findUnique({
      where: { id: materiId },
    });

    if (!materi) {
      return NextResponse.json({ error: 'Materi tidak ditemukan' }, { status: 404 });
    }

    // Check if already completed
    const existingProgress = await prisma.materiProgress.findUnique({
      where: {
        userId_materiId: {
          userId,
          materiId,
        },
      },
    });

    if (existingProgress) {
      return NextResponse.json({ 
        success: true, 
        message: 'Materi sudah ditandai selesai sebelumnya',
        xpEarned: 0 
      });
    }

    // Create progress record
    await prisma.materiProgress.create({
      data: {
        userId,
        materiId,
        completed: true,
      },
    });

    // Award +20 XP to the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true },
    });

    let xpEarned = 20;
    if (user) {
      let newXp = user.xp + xpEarned;
      let newLevel = user.level;
      
      const xpNeeded = newLevel * 500;
      if (newXp >= xpNeeded) {
        newXp -= xpNeeded;
        newLevel += 1;
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: Math.max(0, newXp),
          level: newLevel,
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      xpEarned,
      message: 'Materi ditandai selesai! +20 XP' 
    });
  } catch (error) {
    console.error('Failed to complete materi:', error);
    return NextResponse.json({ error: 'Gagal menyelesaikan materi' }, { status: 500 });
  }
}
