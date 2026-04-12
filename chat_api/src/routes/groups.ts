import express from 'express'
import { prisma } from "../../lib/prisma"
import { authMiddleware } from '../middleware/auth'
import { emitToGroup } from '../socket'

const router = express.Router();

router.post("/", authMiddleware, async (req:any, res) => {
    const { name, memberIds } = req.body;
    const ownerId = req.userId as number;
    try {
        const group = await prisma.group.create({ data: { name } });
            const members = (memberIds || []).map((id: number) => ({
      userId: Number(id),
      groupId: group.id,
    }));
        members.push({ userId: ownerId, groupId: group.id });
        await prisma.groupMember.createMany({ data: members });
        res.json(group)
    
    }
    catch (err: any) {
           res.status(400).json({ error: err.message });
    }

})
router.put("/:groupId", authMiddleware, async (req: any, res) => {
  const { name, picture } = req.body;
  const groupId = Number(req.params.groupId);
  try {
    const group = await prisma.group.update({
      where: { id: groupId },
      data: { name, picture },
    });
    emitToGroup(groupId, "group_updated", group);
    res.json(group);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
router.post("/:groupId/add", authMiddleware, async (req: any, res) => {
  const groupId = Number(req.params.groupId);
  const { userId } = req.body;
  try {
    const gm = await prisma.groupMember.create({
      data: { userId: Number(userId), groupId },
    });
    res.json(gm);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/:groupId/remove", authMiddleware, async (req: any, res) => {
  const groupId = Number(req.params.groupId);
  const { userId } = req.body;
  try {
    await prisma.groupMember.deleteMany({
      where: { userId: Number(userId), groupId },
    });
    res.json({ ok: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
