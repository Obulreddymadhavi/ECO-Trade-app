/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import { getDatabase } from "../utils/database.js";

const router = express.Router();

// Get user profile
router.get("/:userId", (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user profile
router.put("/:userId", (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { fullName, phone, address } = req.body;
    const db = getDatabase();

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    db.prepare(
      `UPDATE users SET fullName = ?, phone = ?, address = ? WHERE id = ?`
    ).run(fullName || user.fullName, phone || user.phone, address || user.address, userId);

    const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    res.json({ success: true, user: updated });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get wallet balance
router.get("/:userId/wallet", (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();

    const user = db
      .prepare("SELECT walletBalance, rewardPoints FROM users WHERE id = ?")
      .get(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      walletBalance: user.walletBalance,
      rewardPoints: user.rewardPoints,
    });
  } catch (error) {
    console.error("Get wallet error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all users (admin only)
router.get("/", (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const users = db.prepare("SELECT * FROM users").all();
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
