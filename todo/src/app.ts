import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import taskRoutes from "./routes/tasks";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "Simple ToDo API", version: "0.1.0" },
  },
  apis: [],
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/", authRoutes);
app.use("/profile", profileRoutes);
app.use("/tasks", taskRoutes);

app.get("/", (req, res) => res.json({ ok: true }));

export default app;
