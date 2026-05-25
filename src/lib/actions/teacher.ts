"use server";

import { prisma } from '@/lib/prisma';

export async function getStudentsList() {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'student' },
      include: {
        progress: {
          include: {
            lesson: {
              include: {
                module: {
                  include: {
                    subject: true
                  }
                }
              }
            }
          }
        },
        portfolioProjects: {
          orderBy: { createdAt: 'desc' }
        },
        internships: {
          orderBy: { startDate: 'desc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    return students.map((s) => ({
      id: s.id,
      name: s.name || 'Siswa',
      email: s.email || '',
      avatar: s.avatar || '',
      schoolType: s.schoolType,
      grade: s.grade,
      selectedPathway: s.selectedPathway,
      xp: s.xp,
      level: s.level,
      streak: s.streak,
      studyTimeToday: s.studyTimeToday,
      dailyGoalMinutes: s.dailyGoalMinutes,
      goals: s.goals,
      weeklyProgress: (s.weeklyProgress as any) || [],
      progress: s.progress.map((p) => ({
        id: p.id,
        lessonId: p.lessonId,
        lessonTitle: p.lesson.title,
        subjectTitle: p.lesson.module.subject.title,
        completed: p.completed,
        scorePercentage: p.scorePercentage,
        completedAt: p.completedAt?.toISOString()
      })),
      portfolios: s.portfolioProjects.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        projectUrl: p.projectUrl || undefined,
        repositoryUrl: p.repositoryUrl || undefined,
        skillsUsed: p.skillsUsed,
        gradeScore: p.gradeScore || undefined,
        createdAt: p.createdAt.toISOString()
      })),
      pklLog: s.internships.map((i) => ({
        id: i.id,
        companyName: i.companyName,
        mentorName: i.mentorName,
        date: i.startDate.toISOString().split('T')[0],
        activityDescription: (i as any).activityDescription || '',
        hoursWorked: (i as any).hoursWorked || 8,
        approved: i.status === 'approved'
      }))
    }));
  } catch (error) {
    console.error('Failed to fetch students list:', error);
    throw new Error('Database operation failed');
  }
}

export async function gradePortfolioProject(projectId: string, score: number) {
  try {
    const updated = await prisma.portfolioProject.update({
      where: { id: projectId },
      data: { gradeScore: score }
    });
    return { success: true, updated };
  } catch (error) {
    console.error('Failed to grade portfolio project:', error);
    throw new Error('Database operation failed');
  }
}

export async function approveInternshipEntry(internshipId: string, approved: boolean) {
  try {
    const updated = await prisma.internship.update({
      where: { id: internshipId },
      data: { status: approved ? 'approved' : 'ongoing' }
    });
    return { success: true, updated };
  } catch (error) {
    console.error('Failed to approve internship:', error);
    throw new Error('Database operation failed');
  }
}
