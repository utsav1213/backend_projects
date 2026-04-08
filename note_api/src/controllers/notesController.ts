import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
export async function createNote(req: Request, res: Response) {
    const userId = (req as any).userId;
    const { title, content,  categoryId, tags } = req.body;
    const note = await prisma.note.create({
        data: {
            title,
            content,
            owner: { connect: { id: userId } },
            category:categoryId?{connect:{id:categoryId}}:undefined,
        }
    })



}