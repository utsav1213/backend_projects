import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import friendsRoutes from "./routes/friends";
import messagesRoutes from "./routes/messages";
import groupsRoutes from "./routes/groups";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/groups", groupsRoutes);

app.get("/", (req, res) => res.json({ ok: true }));

export default app;
