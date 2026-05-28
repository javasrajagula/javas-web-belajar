import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getJurusanByKode, resolveJurusanKode } from '@/lib/data/jurusan';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  try {
    const resolvedParams = await params;
    const kode = resolveJurusanKode(resolvedParams.kode);

    const { searchParams } = new URL(req.url);
    const kelasStr = searchParams.get('kelas');

    const jurusan = await prisma.jurusan.findUnique({
      where: { kode },
      include: {
        mataPelajaran: {
          where: kelasStr ? { kelas: parseInt(kelasStr) } : undefined,
          include: {
            bab: {
              orderBy: { nomor: 'asc' },
              select: { id: true, nomor: true },
            },
          },
          orderBy: [
            { kelas: 'asc' },
            { semester: 'asc' },
            { kode: 'asc' },
          ],
        },
      },
    });

    const catalog = getJurusanByKode(kode);

    if (!jurusan || !catalog) {
      return NextResponse.json({ error: 'Jurusan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      ...jurusan,
      nama: catalog.nama,
      bidang: catalog.bidang,
      deskripsi: catalog.deskripsi,
      icon: catalog.icon,
      warna: catalog.warna,
      popular: catalog.popular,
    });
  } catch (error) {
    console.error('Failed to fetch jurusan detail:', error);
    return NextResponse.json({ error: 'Gagal memuat detail jurusan' }, { status: 500 });
  }
}
