import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {prisma} from '../../lib/prisma'
const JWT_SECRET = process.env.JWT_SECRET || "please-change-this";

export async function signup(req: Request, res: Response) {
    const { email, username, password } = req.body;
    if (!email ||!username || !password)
        return res.status(400).json({ error: 'missing field' })
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({
        message:"usre already in use"   
    })
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: { email, username, password: hashed }
    })
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
        token,
        user: { id: user.id, email:user.email,username:user.username    }
    })


}
export async function login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({error:"missing field"})
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        return res.status(401).json({ error: "invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
        return res.status(401).json({ error: "wrong password" })
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    
  res.json({
    token,
    user: { id: user.id, email: user.email, username: user.username },
  });

}