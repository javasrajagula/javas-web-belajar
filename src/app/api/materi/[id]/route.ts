import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = session?.user?.id;

    const materi = await prisma.materi.findUnique({
      where: { id },
      include: {
        bab: {
          include: {
            mataPelajaran: {
              include: {
                jurusan: true,
              },
            },
          },
        },
      },
    });

    if (!materi) {
      return NextResponse.json({ error: 'Materi tidak ditemukan' }, { status: 404 });
    }

    const progress = userId
      ? await prisma.materiProgress.findUnique({
          where: {
            userId_materiId: {
              userId,
              materiId: id,
            },
          },
        })
      : null;

    return NextResponse.json({
      ...materi,
      selesai: !!progress?.completed,
    });
  } catch (error) {
    console.error('Failed to fetch materi detail:', error);
    return NextResponse.json({ error: 'Gagal memuat materi' }, { status: 500 });
  }
}
