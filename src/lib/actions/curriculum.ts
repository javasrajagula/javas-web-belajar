"use server";

import { prisma } from '@/lib/prisma';
import { Subject, Lesson, SchoolType } from '@/types';

// Map database subject to frontend Subject type
function mapDbSubject(sub: any): Subject {
  return {
    id: sub.id,
    title: sub.title,
    phase: sub.phase as 'E' | 'F',
    schoolType: sub.schoolType as SchoolType,
    grade: sub.grade,
    cpStatement: sub.cpStatement,
    isDigitalSkill: sub.isDigitalSkill,
    modules: sub.modules?.map((mod: any) => ({
      id: mod.id,
      title: mod.title,
      lessons: mod.lessons?.map((les: any) => ({
        id: les.id,
        title: les.title,
        explanation: les.explanation,
        visualExample: les.visualExample,
        summary: les.summary,
        quizzes: les.quizzes?.map((q: any) => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          explanation: q.explanation
        })) || [],
        flashcards: les.flashcards?.map((f: any) => ({
          id: f.id,
          front: f.front,
          back: f.back
        })) || [],
        hotsQuestions: (les.hotsQuestions as any) || [],
        practiceBank: (les.practiceBank as any) || [],
        podcastScript: (les.podcastScript as any) || undefined
      })) || []
    })) || []
  };
}

export async function getDbSubjects(schoolType: SchoolType, grade: number): Promise<Subject[]> {
  try {
    const dbSubjects = await prisma.subject.findMany({
      where: {
        schoolType,
        grade
      },
      include: {
        modules: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: {
              orderBy: { sortOrder: 'asc' },
              include: {
                quizzes: true,
                flashcards: true
              }
            }
          }
        }
      }
    });

    return dbSubjects.map(mapDbSubject);
  } catch (error) {
    console.error('Failed to get database subjects:', error);
    return [];
  }
}

export async function getDbLessonById(lessonId: string) {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            subject: true
          }
        },
        quizzes: true,
        flashcards: true
      }
    });

    if (!lesson) return null;

    const mappedLesson: Lesson = {
      id: lesson.id,
      title: lesson.title,
      explanation: lesson.explanation,
      visualExample: lesson.visualExample,
      summary: lesson.summary,
      quizzes: lesson.quizzes.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        explanation: q.explanation
      })),
      flashcards: lesson.flashcards.map((f) => ({
        id: f.id,
        front: f.front,
        back: f.back
      })),
      hotsQuestions: (lesson.hotsQuestions as any) || [],
      practiceBank: (lesson.practiceBank as any) || [],
      podcastScript: (lesson.podcastScript as any) || undefined
    };

    return {
      lesson: mappedLesson,
      subject: {
        id: lesson.module.subject.id,
        title: lesson.module.subject.title,
        phase: lesson.module.subject.phase as 'E' | 'F',
        schoolType: lesson.module.subject.schoolType as SchoolType,
        grade: lesson.module.subject.grade,
        cpStatement: lesson.module.subject.cpStatement,
        isDigitalSkill: lesson.module.subject.isDigitalSkill,
        modules: []
      },
      moduleTitle: lesson.module.title
    };
  } catch (error) {
    console.error('Failed to get database lesson:', error);
    return null;
  }
}
