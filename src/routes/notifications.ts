/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import { getDatabase } from "../utils/database.js";
import { generateId } from "../utils/helpers.js";

const router = express.Router();

// Get user notifications
router.get("/user/:userId", (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();

    const notifications = db
      .prepare(
        "SELECT * FROM notifications WHERE userId = ? ORDER BY createdDate DESC"
      )
      .all(userId);

    res.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create notification
router.post("/", (req: Request, res: Response) => {
  try {
    const { userId, message, type = "info" } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = getDatabase();
    const id = generateId("notif");
    const createdDate = new Date().toISOString();

    db.prepare(
      `INSERT INTO notifications (id, userId, message, type, read, createdDate)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, userId, message, type, 0, createdDate);

    res.status(201).json({
      success: true,
      notification: { id, userId, message, type, read: false },
    });
  } catch (error) {
    console.error("Create notification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Mark notification as read
router.put("/:notificationId/read", (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const db = getDatabase();

    const notification = db
      .prepare("SELECT * FROM notifications WHERE id = ?")
      .get(notificationId);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    db.prepare("UPDATE notifications SET read = ? WHERE id = ?").run(1, notificationId);

    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Mark all notifications as read
router.put("/user/:userId/read-all", (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();

    db.prepare("UPDATE notifications SET read = ? WHERE userId = ?").run(1, userId);

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete notification
router.delete("/:notificationId", (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const db = getDatabase();

    db.prepare("DELETE FROM notifications WHERE id = ?").run(notificationId);

    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
