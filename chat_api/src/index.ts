import "dotenv/config";
import http from "http";
import { Server as IOServer } from "socket.io";
import app from "./app";
import { initSocket } from "./socket";

const PORT = Number(process.env.PORT || 4000);

const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: "*" } });

initSocket(io);

server.listen(PORT, () => {
  console.log(`Chat API listening on http://localhost:${PORT}`);
});
