import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const jurusan = await prisma.jurusan.findFirst({
    where: { kode: 'TKJ' },
    include: {
      mataPelajaran: {
        include: {
          bab: {
            take: 3,
            include: {
              materi: true
            }
          }
        }
      }
    }
  });

  if (!jurusan) {
    console.log('No TKJ jurusan found');
    return;
  }

  console.log('TKJ Jurusan:', jurusan.nama);
  for (const mapel of jurusan.mataPelajaran) {
    console.log(`  Mapel: ${mapel.nama} (ID: ${mapel.id})`);
    for (const bab of mapel.bab) {
      console.log(`    Bab ${bab.nomor}: ${bab.judul} (ID: ${bab.id})`);
      console.log(`      Materi count: ${bab.materi.length}`);
      if (bab.materi.length > 0) {
        console.log(`        First materi: ${bab.materi[0].judul} (ID: ${bab.materi[0].id}, Type: ${bab.materi[0].tipe})`);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
