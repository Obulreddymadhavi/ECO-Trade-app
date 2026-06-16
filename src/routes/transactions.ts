/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import { getDatabase } from "../utils/database.js";
import { generateId } from "../utils/helpers.js";

const router = express.Router();

// Create transaction
router.post("/", (req: Request, res: Response) => {
  try {
    const { userId, amount, type, reference, description } = req.body;

    if (!userId || !amount || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = getDatabase();
    const id = generateId("tx");
    const createdDate = new Date().toISOString();

    db.prepare(
      `INSERT INTO transactions (id, userId, amount, type, status, reference, description, createdDate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, userId, amount, type, "completed", reference || "", description || "", createdDate);

    // Update wallet balance
    const user = db.prepare("SELECT walletBalance FROM users WHERE id = ?").get(userId);
    let newBalance = user.walletBalance;

    if (type === "payout" || type === "deposit") {
      newBalance += amount;
    } else if (type === "withdrawal" || type === "reward_redemption") {
      newBalance -= amount;
    }

    db.prepare("UPDATE users SET walletBalance = ? WHERE id = ?").run(newBalance, userId);

    res.status(201).json({
      success: true,
      transaction: { id, status: "completed", newBalance },
    });
  } catch (error) {
    console.error("Create transaction error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user transactions
router.get("/user/:userId", (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();

    const transactions = db
      .prepare(
        "SELECT * FROM transactions WHERE userId = ? ORDER BY createdDate DESC"
      )
      .all(userId);

    res.json(transactions);
  } catch (error) {
    console.error("Get user transactions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all transactions
router.get("/", (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const transactions = db
      .prepare("SELECT * FROM transactions ORDER BY createdDate DESC")
      .all();

    res.json(transactions);
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get transaction by ID
router.get("/:transactionId", (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const db = getDatabase();

    const transaction = db
      .prepare("SELECT * FROM transactions WHERE id = ?")
      .get(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json(transaction);
  } catch (error) {
    console.error("Get transaction error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
