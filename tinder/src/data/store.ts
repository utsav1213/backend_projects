import prisma from "../db/prisma";
import { matchQueue } from "../queue";

export async function createUser(email: string, passwordHash: string) {
  return prisma.user.create({ data: { email, passwordHash } });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createProfile(userId: string, payload: any) {
  const data: any = {
    user: { connect: { id: userId } },
    name: payload.name || "",
    age: payload.age || 18,
    bio: payload.bio || null,
    photos: payload.photos || [],
    interests: payload.interests || [],
    gender: payload.gender || null,
    city: payload.city || null,
    preferences: payload.preferences || null,
  };
  return prisma.profile.create({ data });
}

export async function getProfiles(filters: any = {}) {
  const where: any = {};
  if (filters.minAge) where.age = { gte: Number(filters.minAge) };
  if (filters.maxAge)
    where.age = { ...(where.age || {}), lte: Number(filters.maxAge) };
  if (filters.city) where.city = filters.city;
  if (filters.gender) where.gender = filters.gender;
  return prisma.profile.findMany({ where });
}

export async function createSwipe(
  userId: string,
  targetId: string,
  liked: boolean,
) {
  return prisma.swipe.create({
    data: { fromUser: userId, toUser: targetId, liked },
  });
}

export async function findReciprocalSwipe(userId: string, targetId: string) {
  // find swipe where userId = targetId and targetId = userId
  return prisma.swipe.findFirst({
    where: { fromUser: targetId, toUser: userId, liked: true },
  });
}

export async function findMatchBetween(a: string, b: string) {
  return prisma.match.findFirst({
    where: {
      OR: [
        { userA: a, userB: b },
        { userA: b, userB: a },
      ],
    },
  });
}

export async function createMatch(userA: string, userB: string) {
  const m = await prisma.match.create({ data: { userA, userB } });
  try {
    await matchQueue.add("processMatch", { matchId: m.id });
  } catch (err) {
    console.warn("failed to enqueue match job", err);
  }
  return m;
}

export async function findMatchesForUser(userId: string) {
  return prisma.match.findMany({
    where: { OR: [{ userA: userId }, { userB: userId }] },
  });
}

export async function getMessagesByMatch(matchId: string) {
  return prisma.message.findMany({
    where: { matchId },
    orderBy: { createdAt: "asc" },
  });
}

export async function createMessage(
  matchId: string,
  senderId: string,
  text: string,
) {
  return prisma.message.create({ data: { matchId, senderId, text } });
}
