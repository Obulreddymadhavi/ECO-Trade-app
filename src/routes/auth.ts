/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import { getDatabase } from "../utils/database.js";

const router = express.Router();

// Login endpoint
router.post("/login", (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    }

    const db = getDatabase();
    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // In production, use bcrypt for password hashing
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        walletBalance: user.walletBalance,
        rewardPoints: user.rewardPoints,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Register endpoint
router.post("/register", (req: Request, res: Response) => {
  try {
    const { email, password, fullName, role = "customer", phone, address } =
      req.body;

    if (!email || !password || !fullName) {
      return res
        .status(400)
        .json({ error: "Email, password, and full name are required" });
    }

    const db = getDatabase();

    // Check if user exists
    const existing = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);
    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }

    const id = `${role.substring(0, 4)}-${Date.now()}`;
    const createdDate = new Date().toISOString();

    db.prepare(
      `INSERT INTO users (id, email, password, fullName, role, phone, address, walletBalance, rewardPoints, createdDate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, email, password, fullName, role, phone || "", address || "", 0, 0, createdDate);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { id, email, fullName, role },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
