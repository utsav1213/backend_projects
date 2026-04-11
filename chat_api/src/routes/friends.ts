import express from "express";
import { prisma } from "../../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import { emitToUser } from "../socket";

const router = express.Router();
router.post('/add', authMiddleware, async(req:any, res)=> {
    const { targetUserId } = req.body;
    if (!targetUserId) {
        return res.status(400).json({ message: "target user is required" });
    }
    const requesterId = req.userId as number;
    try {
        const fr = await prisma.friend.create({
            data:{requesterId,accepterId:Number(targetUserId),accepted:false}
        })
    
     emitToUser(Number(targetUserId), "friend_request", { from: requesterId });
    res.json(fr);
    }
    catch (err: any) {
        res.status(400).json({err:err.message })
    }
    
})
export default router;
  