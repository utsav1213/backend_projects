import express from 'express'
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'
import { prisma } from '../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || "replace-with-secure-secret";
const router = express.Router();
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body; 
    if (!username || !email || !password) {
        return res.status(400).json({
            error:"missing field"
        })
    }
    const hashed = await bcrypt.hash(password, 10);
    try {
        const user = await prisma.user.create({
            data: { username, email, password: hashed }
        });
        const token = await jwt.sign({ userId: user.id }, JWT_SECRET)
        res.json({
            token,
            user:{id:user.id,user:user.username,email:user.email}
        })
    }
    catch (e:any) {
        res.status(400).json({error:e.message})
    }
})
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "missing field" });
    }
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
        return res.status(400).json({
            error:"invalid credential"
        })
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
        return res.status(400).json({
            error:"invalid credential"
        })
    }
    const token = await jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({
        token,
        user:{id:user.id,username:user.username,email:user.email}
    })
})
export default router;

router.get('/profile', async (req, res) => {
    const auth = req.headers.authorization?.split(" ")[1];
    try {
        const payload = await jwt.verify(auth || " ", JWT_SECRET) as any;
        const user = await prisma.user.findUnique({
            where: { id: Number(payload.userId) }
        })
        if (!user) {
            res.status(404).json({})
        }
    }
    catch (err) {
        res.status(401).json({
            error:"unauthorized"
        })
    }
})
router.put('/profile', async(req, res)=> {
    const auth = req.headers.authorization?.split(" ")[1]; 
    try {
      const payload = jwt.verify(auth || "", JWT_SECRET) as any;
      const userId = Number(payload.userId);
      const { username, email } = req.body;
      const user = await prisma.user.update({
        where: { id: userId },
        data: { username, email },
      });
      res.json({ id: user.id, username: user.username, email: user.email });
    } catch (err) {
      res.status(401).json({ error: "Unauthorized" });
    }
})