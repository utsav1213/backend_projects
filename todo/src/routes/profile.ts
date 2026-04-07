import { Router } from "express";
import prisma from "../prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      username: true,
      email: true,
      emailVerified: true,
      mfaEnabled: true,
      createdAt: true,
    },
  });
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

router.put("/", requireAuth, async (req: AuthRequest, res) => {
  const { username, email } = req.body;
  const updated = await prisma.user.update({
    where: { id: req.userId },
    data: { username, email },
  });
  res.json({
    id: updated.id,
    username: updated.username,
    email: updated.email,
  });
});

export default router;
