import { resolveJurusanKode } from '@/lib/data/jurusan';

export function resolveSmkPathway(pathway?: string | null) {
  return resolveJurusanKode(pathway);
}
