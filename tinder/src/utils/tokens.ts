import * as jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../db/prisma";

const ACCESS_SECRET = process.env.ACCESS_SECRET || "access_dev_secret";
const REFRESH_EXPIRES_DAYS = Number(process.env.REFRESH_EXPIRES_DAYS || "30");
const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES || "15m";

export function generateAccessToken(userId: string) {
  return jwt.sign({ sub: userId } as object, ACCESS_SECRET as jwt.Secret, {
    expiresIn: ACCESS_EXPIRES as jwt.SignOptions["expiresIn"],
  });
}

export function generateRefreshTokenString() {
  return crypto.randomBytes(64).toString("hex");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function persistRefreshToken(userId: string, token: string) {
  const tokenHash = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_DAYS);
  return prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
}

export async function revokeRefreshTokenByHash(token: string) {
  const tokenHash = hashToken(token);
  return prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revoked: true },
  });
}

export async function findValidRefreshToken(token: string) {
  const tokenHash = hashToken(token);
  const now = new Date();
  return prisma.refreshToken.findFirst({
    where: { tokenHash, revoked: false, expiresAt: { gt: now } },
  });
}
