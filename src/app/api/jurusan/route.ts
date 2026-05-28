import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { JURUSAN_CATALOG } from '@/lib/data/jurusan';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bidang = searchParams.get('bidang');

    const filter: any = {};
    if (bidang && bidang !== 'Semua') {
      filter.bidang = bidang;
    }

    const jurusanDb = await prisma.jurusan.findMany({
      where: filter,
      include: {
        _count: { select: { mataPelajaran: true } },
      },
      orderBy: {
        nama: 'asc',
      },
    });

    const byKode = new Map(jurusanDb.map((item) => [item.kode, item]));
    const merged = JURUSAN_CATALOG
      .filter((item) => !bidang || bidang === 'Semua' || item.bidang === bidang)
      .map((item) => {
        const dbItem = byKode.get(item.kode);
        return dbItem
          ? {
              ...dbItem,
              nama: item.nama,
              bidang: item.bidang,
              deskripsi: item.deskripsi,
              icon: item.icon,
              warna: item.warna,
              popular: item.popular,
            }
          : {
              id: `catalog-${item.kode.toLowerCase()}`,
              kode: item.kode,
              nama: item.nama,
              bidang: item.bidang,
              deskripsi: item.deskripsi,
              icon: item.icon,
              warna: item.warna,
              popular: item.popular,
              createdAt: null,
              _count: { mataPelajaran: 0 },
              source: 'catalog',
            };
      });

    return NextResponse.json(merged);
  } catch (error) {
    console.error('Failed to fetch jurusan:', error);
    return NextResponse.json({ error: 'Gagal memuat daftar jurusan' }, { status: 500 });
  }
}
