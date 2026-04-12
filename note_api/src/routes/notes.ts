import { Router } from "express";
import auth from "../middleware/auth";
import {
  createNote,
  listNotes,
  getNote,
  updateNote,
  deleteNote,
} from "../controllers/notesController";

const router = Router();

router.use(auth);

router.post("/", createNote);
router.get("/", listNotes);
router.get("/:id", getNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;
