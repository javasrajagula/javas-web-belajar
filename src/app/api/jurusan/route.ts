import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bidang = searchParams.get('bidang');

    const filter: any = {};
    if (bidang && bidang !== 'Semua') {
      filter.bidang = bidang;
    }

    const jurusan = await prisma.jurusan.findMany({
      where: filter,
      orderBy: {
        nama: 'asc',
      },
    });

    return NextResponse.json(jurusan);
  } catch (error) {
    console.error('Failed to fetch jurusan:', error);
    return NextResponse.json({ error: 'Gagal memuat daftar jurusan' }, { status: 500 });
  }
}
