import smaCurriculum from '../content/curriculum/sma.json';
import smkCurriculum from '../content/curriculum/smk.json';
import { Subject, Lesson } from '@/types';

// Cast imports to types
const SMA_DATA = smaCurriculum as unknown as Subject[];
const SMK_DATA = smkCurriculum as unknown as Subject[];

export const getCurriculumData = (schoolType: 'sma' | 'smk'): Subject[] => {
  return schoolType === 'sma' ? SMA_DATA : SMK_DATA;
};

export const getSubjectsByPathway = (
  schoolType: 'sma' | 'smk',
  grade: number
): Subject[] => {
  const subjects = getCurriculumData(schoolType);
  return subjects.filter((sub) => sub.grade === grade);
};

export const getLessonById = (
  lessonId: string
): { lesson: Lesson; subject: Subject; moduleTitle: string } | null => {
  // Search SMA
  for (const sub of SMA_DATA) {
    for (const mod of sub.modules) {
      const les = mod.lessons.find((l) => l.id === lessonId);
      if (les) {
        return { lesson: les, subject: sub, moduleTitle: mod.title };
      }
    }
  }

  // Search SMK
  for (const sub of SMK_DATA) {
    for (const mod of sub.modules) {
      const les = mod.lessons.find((l) => l.id === lessonId);
      if (les) {
        return { lesson: les, subject: sub, moduleTitle: mod.title };
      }
    }
  }

  return null;
};
