'use server';

import { prisma } from "@/lib/prisma";
import { Redis } from "@upstash/redis";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

// Helper to update User score in Redis Sorted Set
export async function syncUserXpToRedis(userId: string, xp: number) {
  if (!redis) return;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });
    if (user) {
      const memberInfo = JSON.stringify({ id: userId, name: user.name || user.email });
      await redis.zadd("leaderboard:xp", { member: memberInfo, score: xp });
    }
  } catch (err) {
    console.error("Failed to sync XP to Redis:", err);
  }
}

// 1. Create a Guild
export async function createGuild(name: string, description?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const guild = await prisma.guild.create({
    data: {
      name,
      description,
      members: {
        connect: { id: session.user.id }
      }
    }
  });

  // Update user's guildId in local state fallback path
  await prisma.user.update({
    where: { id: session.user.id },
    data: { guildId: guild.id }
  });

  revalidatePath("/rpg");
  return guild;
}

// 2. Join a Guild
export async function joinGuild(guildId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Disconnect from previous guild if any
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { guildId: true }
  });

  if (user?.guildId) {
    await prisma.guild.update({
      where: { id: user.guildId },
      data: {
        members: {
          disconnect: { id: session.user.id }
        }
      }
    });
  }

  const guild = await prisma.guild.update({
    where: { id: guildId },
    data: {
      members: {
        connect: { id: session.user.id }
      }
    }
  });

  revalidatePath("/rpg");
  return guild;
}

// 3. Leave Guild
export async function leaveGuild() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { guildId: true }
  });

  if (!user?.guildId) return null;

  await prisma.guild.update({
    where: { id: user.guildId },
    data: {
      members: {
        disconnect: { id: session.user.id }
      }
    }
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { guildId: null }
  });

  revalidatePath("/rpg");
  return { success: true };
}

// 4. Get Guilds List
export async function getGuildsList() {
  return prisma.guild.findMany({
    include: {
      _count: {
        select: { members: true }
      }
    },
    orderBy: { xp: 'desc' }
  });
}

// 5. Get Global Leaderboard (Redis Sorted Set with PostgreSQL Fallback)
export async function getGlobalLeaderboard(): Promise<{ rank: number; name: string; xp: number; isGuild?: boolean }[]> {
  // If Redis is configured, pull from sorted set
  if (redis) {
    try {
      const topMembers = await redis.zrange("leaderboard:xp", 0, 9, { rev: true, withScores: true });
      if (topMembers && topMembers.length > 0) {
        const board: { rank: number; name: string; xp: number }[] = [];
        for (let i = 0; i < topMembers.length; i += 2) {
          const rank = Math.floor(i / 2) + 1;
          const memberObj = JSON.parse(topMembers[i] as string);
          const xp = Number(topMembers[i + 1]);
          board.push({
            rank,
            name: memberObj.name,
            xp
          });
        }
        return board;
      }
    } catch (err) {
      console.warn("Redis sorted set fetch failed, falling back to DB query:", err);
    }
  }

  // Fallback to PostgreSQL
  const dbUsers = await prisma.user.findMany({
    select: { id: true, name: true, email: true, xp: true },
    orderBy: { xp: 'desc' },
    take: 10
  });

  return dbUsers.map((user, idx) => ({
    rank: idx + 1,
    name: user.name || user.email || "Anonymous",
    xp: user.xp
  }));
}
