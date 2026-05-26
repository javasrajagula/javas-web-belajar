"use server";

import { prisma } from '@/lib/prisma';
import { UserProfile, UserRole, SchoolType, PortfolioProject, PKLJournalEntry } from '@/types';
import { syncUserXpToRedis } from './guild';

// Helper to convert Prisma User to UserProfile type
function mapToUserProfile(dbUser: any): UserProfile {
  return {
    name: dbUser.name || '',
    email: dbUser.email || '',
    avatar: dbUser.avatar || '',
    role: dbUser.role as UserRole,
    schoolType: dbUser.schoolType as SchoolType,
    grade: dbUser.grade,
    selectedPathway: dbUser.selectedPathway,
    streak: dbUser.streak,
    lastActive: dbUser.lastActive?.toISOString() || new Date().toISOString(),
    xp: dbUser.xp,
    level: dbUser.level,
    studyTimeToday: dbUser.studyTimeToday,
    dailyGoalMinutes: dbUser.dailyGoalMinutes,
    dailyGoalXp: dbUser.dailyGoalXp,
    weeklyProgress: (dbUser.weeklyProgress as any) || [],
    weakTopics: (dbUser.weakTopics as any) || [],
    skills: (dbUser.skills as any) || { focus: 0, logic: 0, creativity: 0, discipline: 0 },
    achievements: [], // Dynamic from client or we can add it later
    dailyQuests: (dbUser.dailyQuests as any) || [],
    goals: dbUser.goals || [],
    portfolio: dbUser.portfolioProjects?.map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      projectUrl: p.projectUrl || undefined,
      repositoryUrl: p.repositoryUrl || undefined,
      skillsUsed: p.skillsUsed,
      gradeScore: p.gradeScore || undefined,
      createdAt: p.createdAt.toISOString()
    })) || [],
    pklLog: dbUser.internships?.map((i: any) => ({
      id: i.id,
      date: i.startDate.toISOString().split('T')[0],
      companyName: i.companyName,
      mentorName: i.mentorName,
      activityDescription: i.activityDescription || '',
      hoursWorked: i.hoursWorked || 8,
      approved: i.status === 'approved'
    })) || [],
    guildId: dbUser.guildId
  };
}

export async function getUserProfile(email: string): Promise<UserProfile | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        portfolioProjects: {
          orderBy: { createdAt: 'desc' }
        },
        internships: {
          orderBy: { startDate: 'desc' }
        }
      }
    });
    
    if (!user) return null;
    return mapToUserProfile(user);
  } catch (error) {
    console.error('Failed to get user profile:', error);
    throw new Error('Database error');
  }
}

export async function updateUserProfile(
  email: string,
  updates: Partial<Omit<UserProfile, 'portfolio' | 'pklLog'>>
): Promise<UserProfile> {
  try {
    const { weeklyProgress, weakTopics, skills, dailyQuests, lastActive, ...directFields } = updates;
    
    const dataToUpdate: any = { ...directFields };
    if (weeklyProgress) dataToUpdate.weeklyProgress = weeklyProgress;
    if (weakTopics) dataToUpdate.weakTopics = weakTopics;
    if (skills) dataToUpdate.skills = skills;
    if (dailyQuests) dataToUpdate.dailyQuests = dailyQuests;
    if (lastActive) dataToUpdate.lastActive = new Date(lastActive);

    const updatedUser = await prisma.user.update({
      where: { email },
      data: dataToUpdate,
      include: {
        portfolioProjects: {
          orderBy: { createdAt: 'desc' }
        },
        internships: {
          orderBy: { startDate: 'desc' }
        }
      }
    });

    if (updatedUser && updates.xp !== undefined) {
      await syncUserXpToRedis(updatedUser.id, updatedUser.xp).catch(err => {
        console.error("Redis sync error in updateUserProfile:", err);
      });
    }

    return mapToUserProfile(updatedUser);
  } catch (error) {
    console.error('Failed to update user profile:', error);
    throw new Error('Failed to update profile');
  }
}

// Progress Server Actions
export async function getCompletedLessons(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (!user) return { completedLessons: {}, lessonScores: {} };

    const progressRecords = await prisma.progress.findMany({
      where: { userId: user.id }
    });

    const completedLessons: Record<string, boolean> = {};
    const lessonScores: Record<string, number> = {};

    progressRecords.forEach((rec) => {
      completedLessons[rec.lessonId] = rec.completed;
      if (rec.scorePercentage !== null && rec.scorePercentage !== undefined) {
        lessonScores[rec.lessonId] = rec.scorePercentage;
      }
    });

    return { completedLessons, lessonScores };
  } catch (error) {
    console.error('Failed to get completed lessons:', error);
    return { completedLessons: {}, lessonScores: {} };
  }
}

export async function markLessonCompleteAction(
  email: string,
  lessonId: string,
  scorePercentage?: number
) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) throw new Error('User not found');

    const existingProgress = await prisma.progress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: lessonId
        }
      }
    });

    if (existingProgress) {
      await prisma.progress.update({
        where: { id: existingProgress.id },
        data: {
          completed: true,
          scorePercentage: scorePercentage !== undefined 
            ? Math.max(existingProgress.scorePercentage || 0, scorePercentage)
            : existingProgress.scorePercentage,
          completedAt: new Date()
        }
      });
    } else {
      await prisma.progress.create({
        data: {
          userId: user.id,
          lessonId: lessonId,
          completed: true,
          scorePercentage: scorePercentage || null,
          completedAt: new Date()
        }
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to mark lesson complete:', error);
    throw new Error('Database operation failed');
  }
}

// Portfolio Server Actions
export async function addPortfolioAction(email: string, project: Omit<PortfolioProject, 'id' | 'createdAt'>) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) throw new Error('User not found');

    const newProject = await prisma.portfolioProject.create({
      data: {
        userId: user.id,
        title: project.title,
        description: project.description,
        projectUrl: project.projectUrl || null,
        repositoryUrl: project.repositoryUrl || null,
        skillsUsed: project.skillsUsed,
        gradeScore: project.gradeScore || null
      }
    });

    return {
      id: newProject.id,
      title: newProject.title,
      description: newProject.description,
      projectUrl: newProject.projectUrl || undefined,
      repositoryUrl: newProject.repositoryUrl || undefined,
      skillsUsed: newProject.skillsUsed,
      gradeScore: newProject.gradeScore || undefined,
      createdAt: newProject.createdAt.toISOString()
    };
  } catch (error) {
    console.error('Failed to add portfolio:', error);
    throw new Error('Database operation failed');
  }
}

export async function deletePortfolioAction(email: string, portfolioId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) throw new Error('User not found');

    await prisma.portfolioProject.delete({
      where: {
        id: portfolioId,
        userId: user.id
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to delete portfolio:', error);
    throw new Error('Database operation failed');
  }
}

// PKL Server Actions
export async function addPklEntryAction(
  email: string,
  entry: Omit<PKLJournalEntry, 'id' | 'approved'> & { activityDescription?: string; hoursWorked?: number }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) throw new Error('User not found');

    // Create record in database
    const newInternship = await prisma.internship.create({
      data: {
        userId: user.id,
        companyName: entry.companyName,
        mentorName: entry.mentorName,
        startDate: new Date(entry.date),
        endDate: null,
        status: 'ongoing'
      }
    });

    return {
      id: newInternship.id,
      date: entry.date,
      companyName: newInternship.companyName,
      mentorName: newInternship.mentorName,
      activityDescription: entry.activityDescription || '',
      hoursWorked: entry.hoursWorked || 8,
      approved: false
    };
  } catch (error) {
    console.error('Failed to add PKL entry:', error);
    throw new Error('Database operation failed');
  }
}

export async function deletePklEntryAction(email: string, entryId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) throw new Error('User not found');

    await prisma.internship.delete({
      where: {
        id: entryId,
        userId: user.id
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to delete PKL entry:', error);
    throw new Error('Database operation failed');
  }
}

export async function registerUser(data: { name: string; email: string }) {
  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      throw new Error('Email sudah terdaftar');
    }

    // Create new user in PostgreSQL with default profile values
    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        role: 'student',
        schoolType: 'sma',
        grade: 10,
        selectedPathway: 'Umum',
        goals: ['Selesaikan onboarding pertama', 'Atur agenda belajar harian'],
        streak: 1,
        xp: 0,
        level: 1,
        studyTimeToday: 0,
        dailyGoalMinutes: 45,
        dailyGoalXp: 200,
        weeklyProgress: [
          { day: 'Sen', minutes: 0, xp: 0 },
          { day: 'Sel', minutes: 0, xp: 0 },
          { day: 'Rab', minutes: 0, xp: 0 },
          { day: 'Kam', minutes: 0, xp: 0 },
          { day: 'Jum', minutes: 0, xp: 0 },
          { day: 'Sab', minutes: 0, xp: 0 },
          { day: 'Min', minutes: 0, xp: 0 }
        ],
        weakTopics: [],
        skills: {
          focus: 10,
          logic: 10,
          creativity: 10,
          discipline: 10
        },
        dailyQuests: [
          { id: 'q1', title: 'Belajar 45 Menit Hari Ini', xpReward: 100, completed: false, target: 45, current: 0, type: 'study' },
          { id: 'q2', title: 'Selesaikan Satu Kuis AI', xpReward: 50, completed: false, target: 1, current: 0, type: 'quiz' },
          { id: 'q3', title: 'Bertanya Pada Tutor AI', xpReward: 50, completed: false, target: 3, current: 0, type: 'chat' }
        ]
      }
    });

    return { success: true, email: newUser.email };
  } catch (error: any) {
    console.error('Failed to register user:', error);
    throw new Error(error.message || 'Gagal meregistrasi pengguna');
  }
}

