import express from "express";
import { prisma } from "../../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import { emitToUser, emitToGroup } from "../socket";

const router = express.Router();

router.post("/", authMiddleware, async (req: any, res) => {
    const senderId = req.userId as number;
    const { receiverId, groupId, content } = req.body;
    if (!content) return res.status(400).json({ error: "content required" });
    try {
        const message = await prisma.message.create({
            data: {
                senderId,
                receiverId: receiverId ? Number(receiverId) : null,
                groupId: groupId ? Number(groupId) : null,
                content,
            },
        });
        if (receiverId)
            emitToUser(Number(receiverId), "message", {
                from: senderId,
                content,
                id: message.id,
                createdAt: message.createdAt,
            });
        if (groupId)
            emitToGroup(Number(groupId), "group_message", {
                from: senderId,
                content,
                id: message.id,
                createdAt: message.createdAt,
            });
        res.json(message);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
})

router.get("/:userId", authMiddleware, async (req: any, res) => {
  const userId = req.userId as number;
  const otherId = Number(req.params.userId);
  const msgs = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherId },
        { senderId: otherId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });
  res.json(msgs);
});
router.get("/group/:groupId", authMiddleware, async (req: any, res) => {
  const groupId = Number(req.params.groupId);
  const msgs = await prisma.message.findMany({
    where: { groupId },
    orderBy: { createdAt: "asc" },
  });
  res.json(msgs);
});

export default router;
