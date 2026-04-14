import { Router } from "express";
import bcrypt from "bcrypt";

import { createUser, findUserByEmail, createProfile } from "../data/store";
import prisma from "../../generated/prisma";
import {
  generateAccessToken,
  generateRefreshTokenString,
  persistRefreshToken,
  findValidRefreshToken,
  revokeRefreshTokenByHash,
} from "../utils/tokens";

const router = Router();
router.post("/signup", async (req, res) => {
    try {
        const { email, password, name, age, city } = req.body
        if (!email || !password) {
            return res.status(400).json({error:"email and password required"})
        }
        const existing = await findUserByEmail(email);
           const hash = await bcrypt.hash(password, 10);
        const user = await createUser(email, hash);
        const profile = await createProfile(user.id, {
      name: name || email.split("@")[0],
      age: age || 18,
      city: city || "",
    });

    }
    
})