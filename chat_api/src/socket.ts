import { Server as IOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "replace-with-secure-secret";

let io: IOServer | null = null;
const userSockets = new Map<number, string>();

export function initSocket(serverIo: IOServer) {
  io = serverIo;
  io.on("connection", (socket: Socket) => {
    socket.on("auth", (token: string) => {
      try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        const userId = Number(payload.userId);
        if (userId) {
          userSockets.set(userId, socket.id);
        }
      } catch (e) {
        // ignore
      }
    });

    socket.on("join_group", (groupId: number) => {
      socket.join(`group_${groupId}`);
    });

    socket.on("disconnect", () => {
      for (const [userId, sid] of userSockets.entries()) {
        if (sid === socket.id) userSockets.delete(userId);
      }
    });
  });
}

export function emitToUser(userId: number, event: string, payload: any) {
  if (!io) return;
  const sid = userSockets.get(userId);
  if (sid) io.to(sid).emit(event, payload);
}

export function emitToGroup(groupId: number, event: string, payload: any) {
  if (!io) return;
  io.to(`group_${groupId}`).emit(event, payload);
}
