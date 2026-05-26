import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  try {
    const resolvedParams = await params;
    const kode = resolvedParams.kode?.toUpperCase();

    const { searchParams } = new URL(req.url);
    const kelasStr = searchParams.get('kelas');

    const jurusan = await prisma.jurusan.findUnique({
      where: { kode },
      include: {
        mataPelajaran: {
          where: kelasStr ? { kelas: parseInt(kelasStr) } : undefined,
          orderBy: [
            { kelas: 'asc' },
            { semester: 'asc' },
            { kode: 'asc' },
          ],
        },
      },
    });

    if (!jurusan) {
      return NextResponse.json({ error: 'Jurusan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(jurusan);
  } catch (error) {
    console.error('Failed to fetch jurusan detail:', error);
    return NextResponse.json({ error: 'Gagal memuat detail jurusan' }, { status: 500 });
  }
}
