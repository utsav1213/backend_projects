import express from 'express';
import cors from 'cors';
import authRoutes from "./routes/auth"
import friendRoutes from "./routes/friends";
import messagesRoutes from "./routes/messages"
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes)
app.use('/api/friends', friendRoutes)
app.use("/api/messages", messagesRoutes);
export default app