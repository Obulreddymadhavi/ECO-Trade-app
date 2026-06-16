/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import { getDatabase } from "../utils/database.js";

const router = express.Router();

// Sample reward items
const REWARD_ITEMS = [
  {
    id: "reward-1",
    title: "$5 Amazon Gift Card",
    pointsCost: 500,
    description: "Digital Amazon gift card worth $5",
    couponCode: "AMAZON5",
    imageUrl: "https://via.placeholder.com/150?text=Amazon+5",
  },
  {
    id: "reward-2",
    title: "$10 Amazon Gift Card",
    pointsCost: 1000,
    description: "Digital Amazon gift card worth $10",
    couponCode: "AMAZON10",
    imageUrl: "https://via.placeholder.com/150?text=Amazon+10",
  },
  {
    id: "reward-3",
    title: "EcoTrade Premium Discount",
    pointsCost: 300,
    description: "20% discount on your next transaction",
    couponCode: "ECODIS20",
    imageUrl: "https://via.placeholder.com/150?text=Discount",
  },
  {
    id: "reward-4",
    title: "Free Pickup Service",
    pointsCost: 200,
    description: "One free waste pickup service",
    couponCode: "FREEPICK1",
    imageUrl: "https://via.placeholder.com/150?text=Pickup",
  },
];

// Get all reward items
router.get("/items", (req: Request, res: Response) => {
  try {
    res.json(REWARD_ITEMS);
  } catch (error) {
    console.error("Get rewards error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get reward item by ID
router.get("/items/:rewardId", (req: Request, res: Response) => {
  try {
    const { rewardId } = req.params;
    const reward = REWARD_ITEMS.find((r) => r.id === rewardId);

    if (!reward) {
      return res.status(404).json({ error: "Reward not found" });
    }

    res.json(reward);
  } catch (error) {
    console.error("Get reward error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Redeem reward
router.post("/redeem", (req: Request, res: Response) => {
  try {
    const { userId, rewardId } = req.body;

    if (!userId || !rewardId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const reward = REWARD_ITEMS.find((r) => r.id === rewardId);
    if (!reward) {
      return res.status(404).json({ error: "Reward not found" });
    }

    const db = getDatabase();
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.rewardPoints < reward.pointsCost) {
      return res.status(400).json({ error: "Insufficient reward points" });
    }

    // Update user's reward points
    const newPoints = user.rewardPoints - reward.pointsCost;
    db.prepare("UPDATE users SET rewardPoints = ? WHERE id = ?").run(newPoints, userId);

    // Create transaction record
    const transactionId = `tx-${Date.now()}`;
    db.prepare(
      `INSERT INTO transactions (id, userId, amount, type, status, reference, description, createdDate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      transactionId,
      userId,
      reward.pointsCost,
      "reward_redemption",
      "completed",
      rewardId,
      `Redeemed: ${reward.title}`,
      new Date().toISOString()
    );

    res.json({
      success: true,
      message: "Reward redeemed successfully",
      reward,
      couponCode: reward.couponCode,
      remainingPoints: newPoints,
    });
  } catch (error) {
    console.error("Redeem reward error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
