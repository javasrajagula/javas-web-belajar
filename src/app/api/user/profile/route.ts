import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { syncUserXpToRedis } from '@/lib/actions/guild';
import { resolveJurusanKode } from '@/lib/data/jurusan';
import { UserProfile, UserRole, SchoolType } from '@/types';

function mapToUserProfile(dbUser: any): UserProfile {
  return {
    name: dbUser.name || '',
    email: dbUser.email || '',
    avatar: dbUser.avatar || dbUser.image || '',
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
    achievements: [],
    dailyQuests: (dbUser.dailyQuests as any) || [],
    goals: dbUser.goals || [],
    portfolio: dbUser.portfolioProjects?.map((project: any) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      projectUrl: project.projectUrl || null,
      repositoryUrl: project.repositoryUrl || null,
      skillsUsed: project.skillsUsed,
      gradeScore: project.gradeScore || null,
      createdAt: project.createdAt.toISOString(),
    })) || [],
    pklLog: dbUser.internships?.map((internship: any) => ({
      id: internship.id,
      date: internship.startDate.toISOString().split('T')[0],
      companyName: internship.companyName,
      mentorName: internship.mentorName,
      activityDescription: internship.activityDescription || '',
      hoursWorked: internship.hoursWorked || 8,
      approved: internship.status === 'approved',
    })) || [],
    guildId: dbUser.guildId,
  };
}

async function getSessionUser() {
  const session = await auth();
  const userId = session?.user?.id;
  const email = session?.user?.email?.toLowerCase();

  if (!userId && !email) {
    return null;
  }

  return prisma.user.findFirst({
    where: userId ? { id: userId } : { email },
    include: {
      portfolioProjects: {
        orderBy: { createdAt: 'desc' },
      },
      internships: {
        orderBy: { startDate: 'desc' },
      },
    },
  });
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    return NextResponse.json(mapToUserProfile(user));
  } catch (error) {
    console.error('Failed to load authenticated profile:', error);
    return NextResponse.json({ error: 'Gagal memuat profil pengguna' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const updates = await req.json();
    const dataToUpdate: Record<string, any> = {};

    if (updates.name !== undefined) dataToUpdate.name = String(updates.name);
    if (updates.avatar !== undefined) dataToUpdate.avatar = String(updates.avatar);
    if (updates.schoolType !== undefined) dataToUpdate.schoolType = updates.schoolType === 'smk' ? 'smk' : 'sma';
    if (updates.grade !== undefined) dataToUpdate.grade = Number(updates.grade);
    if (updates.selectedPathway !== undefined) {
      dataToUpdate.selectedPathway = updates.schoolType === 'sma'
        ? String(updates.selectedPathway)
        : resolveJurusanKode(String(updates.selectedPathway));
    }
    if (updates.streak !== undefined) dataToUpdate.streak = Number(updates.streak);
    if (updates.xp !== undefined) dataToUpdate.xp = Number(updates.xp);
    if (updates.level !== undefined) dataToUpdate.level = Number(updates.level);
    if (updates.studyTimeToday !== undefined) dataToUpdate.studyTimeToday = Number(updates.studyTimeToday);
    if (updates.dailyGoalMinutes !== undefined) dataToUpdate.dailyGoalMinutes = Number(updates.dailyGoalMinutes);
    if (updates.dailyGoalXp !== undefined) dataToUpdate.dailyGoalXp = Number(updates.dailyGoalXp);
    if (updates.goals !== undefined) dataToUpdate.goals = Array.isArray(updates.goals) ? updates.goals : [];
    if (updates.weeklyProgress !== undefined) dataToUpdate.weeklyProgress = updates.weeklyProgress;
    if (updates.weakTopics !== undefined) dataToUpdate.weakTopics = updates.weakTopics;
    if (updates.skills !== undefined) dataToUpdate.skills = updates.skills;
    if (updates.dailyQuests !== undefined) dataToUpdate.dailyQuests = updates.dailyQuests;
    if (updates.lastActive !== undefined) dataToUpdate.lastActive = new Date(updates.lastActive);

    const user = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      include: {
        portfolioProjects: {
          orderBy: { createdAt: 'desc' },
        },
        internships: {
          orderBy: { startDate: 'desc' },
        },
      },
    });

    if (dataToUpdate.xp !== undefined) {
      await syncUserXpToRedis(user.id, user.xp).catch((error) => {
        console.warn('Redis XP sync skipped:', error);
      });
    }

    return NextResponse.json(mapToUserProfile(user));
  } catch (error) {
    console.error('Failed to update authenticated profile:', error);
    return NextResponse.json({ error: 'Gagal menyimpan profil pengguna' }, { status: 500 });
  }
}
