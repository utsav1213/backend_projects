import { Router } from "express";
import prisma from "../prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// Create task
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { title, description, dueDate, priority } = req.body;
  if (!title) return res.status(400).json({ error: "title required" });
  const data: any = { title, description, ownerId: req.userId };
  if (dueDate) data.dueDate = new Date(dueDate);
  if (priority) data.priority = priority;
  const task = await prisma.task.create({ data });
  res.status(201).json(task);
});

// List tasks with optional filters
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const { status, priority, sortBy } = req.query as any;
  const where: any = { ownerId: req.userId };
  if (status) where.status = status;
  if (priority) where.priority = priority;
  const orderBy: any = {};
  if (sortBy === "dueDate") orderBy.dueDate = "asc";
  else orderBy.createdAt = "desc";
  const tasks = await prisma.task.findMany({ where, orderBy });
  res.json(tasks);
});

// Get single
router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.ownerId !== req.userId)
    return res.status(404).json({ error: "Not found" });
  res.json(task);
});

// Update
router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || existing.ownerId !== req.userId)
    return res.status(404).json({ error: "Not found" });
  const { title, description, dueDate, priority, status } = req.body;
  const data: any = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
  if (priority !== undefined) data.priority = priority;
  if (status !== undefined) data.status = status;
  const updated = await prisma.task.update({ where: { id }, data });
  res.json(updated);
});

// Delete
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || existing.ownerId !== req.userId)
    return res.status(404).json({ error: "Not found" });
  await prisma.task.delete({ where: { id } });
  res.status(204).send();
});

// Mark complete
router.put("/:id/complete", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || existing.ownerId !== req.userId)
    return res.status(404).json({ error: "Not found" });
  const updated = await prisma.task.update({
    where: { id },
    data: { status: "COMPLETED" },
  });
  res.json(updated);
});

// Completed list
router.get("/completed/list", requireAuth, async (req: AuthRequest, res) => {
  const tasks = await prisma.task.findMany({
    where: { ownerId: req.userId, status: "COMPLETED" },
    orderBy: { updatedAt: "desc" },
  });
  res.json(tasks);
});

export default router;
