import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "replace-with-secure-secret";

export function authMiddleware(
  req: Request & any,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header)
    return res.status(401).json({ error: "Missing Authorization header" });
  const parts = header.split(" ");
  if (parts.length !== 2)
    return res.status(401).json({ error: "Invalid Authorization header" });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
