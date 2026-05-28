import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { searchParams } = new URL(req.url);

    const jurusan = searchParams.get('jurusan')?.trim().toUpperCase();
    const kelas = Number(searchParams.get('kelas') || 0);
    const q = searchParams.get('q')?.trim();
    const tipe = searchParams.get('tipe')?.trim();
    const kategori = searchParams.get('kategori')?.trim();

    const materi = await prisma.materi.findMany({
      where: {
        bab: {
          mataPelajaran: {
            ...(jurusan ? { jurusan: { kode: jurusan } } : {}),
            ...(kelas >= 1 && kelas <= 12 ? { kelas } : {}),
            ...(kategori === 'umum'
              ? { kode: { startsWith: 'UMUM-' } }
              : kategori === 'kejuruan'
                ? { NOT: { kode: { startsWith: 'UMUM-' } } }
                : {}),
          },
        },
        ...(q
          ? {
              OR: [
                { judul: { contains: q, mode: 'insensitive' } },
                { konten: { contains: q, mode: 'insensitive' } },
                { bab: { judul: { contains: q, mode: 'insensitive' } } },
                {
                  bab: {
                    mataPelajaran: {
                      nama: { contains: q, mode: 'insensitive' },
                    },
                  },
                },
              ],
            }
          : {}),
        ...(tipe && tipe !== 'semua' ? { tipe } : {}),
      },
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
      orderBy: [{ createdAt: 'asc' }, { urutan: 'asc' }],
      take: 120,
    });

    const progress = userId
      ? await prisma.materiProgress.findMany({
          where: {
            userId,
            materiId: { in: materi.map((item) => item.id) },
          },
          select: { materiId: true, completed: true },
        })
      : [];

    const completedIds = new Set(progress.filter((item) => item.completed).map((item) => item.materiId));

    return NextResponse.json({
      data: materi.map((item) => ({
        ...item,
        selesai: completedIds.has(item.id),
      })),
      total: materi.length,
    });
  } catch (error) {
    console.error('Failed to fetch materi list:', error);
    return NextResponse.json({ error: 'Gagal memuat daftar materi' }, { status: 500 });
  }
}
