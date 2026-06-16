/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from "express";
import { getDatabase } from "../utils/database.js";
import { generateId } from "../utils/helpers.js";

const router = express.Router();

// Create bank account
router.post("/bank-accounts", (req: Request, res: Response) => {
  try {
    const { userId, bankName, accountHolder, accountNumber, routingCode, isPrimary } = req.body;

    if (!userId || !bankName || !accountHolder || !accountNumber || !routingCode) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = getDatabase();
    const id = generateId("bnk");
    const createdDate = new Date().toISOString();

    db.prepare(
      `INSERT INTO bank_accounts (id, userId, bankName, accountHolder, accountNumber, rawAccountNumber, routingCode, isPrimary, createdDate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      userId,
      bankName,
      accountHolder,
      accountNumber.replace(/\d(?=\d{4})/g, "*"), // Mask account number
      accountNumber,
      routingCode,
      isPrimary ? 1 : 0,
      createdDate
    );

    // If primary, update others
    if (isPrimary) {
      db.prepare(
        "UPDATE bank_accounts SET isPrimary = 0 WHERE userId = ? AND id != ?"
      ).run(userId, id);
    }

    res.status(201).json({
      success: true,
      bankAccount: { id, bankName, accountHolder, routingCode, isPrimary },
    });
  } catch (error) {
    console.error("Create bank account error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user's bank accounts
router.get("/user/:userId/bank-accounts", (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();

    const accounts = db
      .prepare("SELECT * FROM bank_accounts WHERE userId = ? ORDER BY isPrimary DESC, createdDate DESC")
      .all(userId);

    res.json(accounts);
  } catch (error) {
    console.error("Get bank accounts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update bank account
router.put("/bank-accounts/:bankAccountId", (req: Request, res: Response) => {
  try {
    const { bankAccountId } = req.params;
    const { bankName, accountHolder, routingCode, isPrimary } = req.body;
    const db = getDatabase();

    const account = db
      .prepare("SELECT * FROM bank_accounts WHERE id = ?")
      .get(bankAccountId);

    if (!account) {
      return res.status(404).json({ error: "Bank account not found" });
    }

    db.prepare(
      `UPDATE bank_accounts SET bankName = ?, accountHolder = ?, routingCode = ?, isPrimary = ? WHERE id = ?`
    ).run(
      bankName || account.bankName,
      accountHolder || account.accountHolder,
      routingCode || account.routingCode,
      isPrimary !== undefined ? (isPrimary ? 1 : 0) : account.isPrimary,
      bankAccountId
    );

    if (isPrimary) {
      db.prepare(
        "UPDATE bank_accounts SET isPrimary = 0 WHERE userId = ? AND id != ?"
      ).run(account.userId, bankAccountId);
    }

    const updated = db.prepare("SELECT * FROM bank_accounts WHERE id = ?").get(bankAccountId);
    res.json({ success: true, bankAccount: updated });
  } catch (error) {
    console.error("Update bank account error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete bank account
router.delete("/bank-accounts/:bankAccountId", (req: Request, res: Response) => {
  try {
    const { bankAccountId } = req.params;
    const db = getDatabase();

    const account = db
      .prepare("SELECT * FROM bank_accounts WHERE id = ?")
      .get(bankAccountId);

    if (!account) {
      return res.status(404).json({ error: "Bank account not found" });
    }

    db.prepare("DELETE FROM bank_accounts WHERE id = ?").run(bankAccountId);

    // If it was primary, make another one primary
    if (account.isPrimary) {
      const remaining = db
        .prepare("SELECT * FROM bank_accounts WHERE userId = ? LIMIT 1")
        .get(account.userId);
      
      if (remaining) {
        db.prepare("UPDATE bank_accounts SET isPrimary = 1 WHERE id = ?").run(remaining.id);
      }
    }

    res.json({ success: true, message: "Bank account deleted" });
  } catch (error) {
    console.error("Delete bank account error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
