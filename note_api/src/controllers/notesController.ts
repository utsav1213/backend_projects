import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function createNote(req: Request, res: Response) {
  const userId = (req as any).userId;
  const { title, content, categoryId, tags } = req.body;

  const note = await prisma.note.create({
    data: {
      title,
      content,
      owner: { connect: { id: userId } },
      category: categoryId ? { connect: { id: categoryId } } : undefined,
    },
  });

  // tags: optional array of tag names
  if (Array.isArray(tags) && tags.length) {
    for (const t of tags) {
      await prisma.tag.upsert({
        where: { name: t },
        update: {},
        create: { name: t },
      });
    }
    // connect tags
    const tagRecords = await prisma.tag.findMany({
      where: { name: { in: tags } },
    });
    await prisma.note.update({
      where: { id: note.id },
      data: { tags: { connect: tagRecords.map((tr) => ({ id: tr.id })) } },
    });
  }

  res.status(201).json({ note });
}

export async function listNotes(req: Request, res: Response) {
  const userId = (req as any).userId;
  const notes = await prisma.note.findMany({
    where: { ownerId: userId },
    include: { tags: true, category: true },
  });
  res.json({ notes });
}

export async function getNote(req: Request, res: Response) {
  const userId = (req as any).userId;
  const { id } = req.params;
  const note = await prisma.note.findFirst({
    where: { id: id as string, ownerId: userId },
    include: { tags: true, category: true },
  });
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json({ note });
}

export async function updateNote(req: Request, res: Response) {
  const userId = (req as any).userId;
  const { id } = req.params;
  const { title, content, categoryId, tags } = req.body;

  const existing = await prisma.note.findFirst({
    where: { id: id as string, ownerId: userId },
  });
  if (!existing) return res.status(404).json({ error: "Note not found" });

  const updated = await prisma.note.update({
    where: { id: id as string },
    data: { title, content, categoryId },
  });

  if (Array.isArray(tags)) {
    // simple approach: disconnect all then connect provided
    await prisma.note.update({ where: { id: id as string }, data: { tags: { set: [] } } });
    for (const t of tags) {
      await prisma.tag.upsert({
        where: { name: t },
        update: {},
        create: { name: t },
      });
    }
    const tagRecords = await prisma.tag.findMany({
      where: { name: { in: tags } },
    });
    await prisma.note.update({
      where: { id: id as string },
      data: { tags: { connect: tagRecords.map((tr:any) => ({ id: tr.id })) } },
    });
  }

  res.json({ note: updated });
}

export async function deleteNote(req: Request, res: Response) {
  const userId = (req as any).userId;
  const { id } = req.params;
  const existing = await prisma.note.findFirst({
    where: { id: id as string, ownerId: userId },
  });
  if (!existing) return res.status(404).json({ error: "Note not found" });
  await prisma.note.delete({ where: { id: id as string } });
  res.status(204).send();
}
