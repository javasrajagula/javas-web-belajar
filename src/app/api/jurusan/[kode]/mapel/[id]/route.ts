import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string; id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const session = await auth();
    const userId = session?.user?.id;

    // Get subject detail with Bab and Materi
    const mapel = await prisma.mataPelajaran.findUnique({
      where: { id },
      include: {
        bab: {
          orderBy: { nomor: 'asc' },
          include: {
            materi: {
              orderBy: { urutan: 'asc' },
            },
          },
        },
      },
    });

    if (!mapel) {
      return NextResponse.json({ error: 'Mata pelajaran tidak ditemukan' }, { status: 404 });
    }

    // If user is logged in, merge completion progress
    let completedMateriIds: string[] = [];
    if (userId) {
      const progress = await prisma.materiProgress.findMany({
        where: {
          userId,
          completed: true,
        },
        select: {
          materiId: true,
        },
      });
      completedMateriIds = progress.map((p) => p.materiId);
    }

    // Attach completed flag to each materi item
    const formattedBab = mapel.bab.map((b) => ({
      ...b,
      materi: b.materi.map((m) => ({
        ...m,
        selesai: completedMateriIds.includes(m.id),
      })),
    }));

    return NextResponse.json({
      ...mapel,
      bab: formattedBab,
    });
  } catch (error) {
    console.error('Failed to fetch mapel detail:', error);
    return NextResponse.json({ error: 'Gagal memuat detail mata pelajaran' }, { status: 500 });
  }
}
