/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import { getDatabase } from "../utils/database.js";
import { generateId } from "../utils/helpers.js";

const router = express.Router();

// Create waste request
router.post("/", (req: Request, res: Response) => {
  try {
    const {
      userId,
      userFullName,
      userPhone,
      category,
      quantity,
      weight,
      wasteDescription,
      imageUrl,
      pickupAddress,
      pickupDate,
    } = req.body;

    if (
      !userId ||
      !userFullName ||
      !category ||
      !quantity ||
      !weight ||
      !pickupAddress ||
      !pickupDate
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = getDatabase();
    const id = generateId("req");
    const createdDate = new Date().toISOString();

    // Calculate estimated payout and points (example calculation)
    const estimatedPayout = weight * 2.5; // $2.50 per kg
    const pointsAwarded = Math.floor(weight * 100);

    db.prepare(
      `INSERT INTO waste_requests 
       (id, userId, userFullName, userPhone, category, quantity, weight, wasteDescription, imageUrl, pickupAddress, pickupDate, status, createdDate, estimatedPayout, pointsAwarded)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      userId,
      userFullName,
      userPhone,
      category,
      quantity,
      weight,
      wasteDescription,
      imageUrl || "",
      pickupAddress,
      pickupDate,
      "pending",
      createdDate,
      estimatedPayout,
      pointsAwarded
    );

    res.status(201).json({
      success: true,
      request: { id, status: "pending", estimatedPayout, pointsAwarded },
    });
  } catch (error) {
    console.error("Create waste request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user's waste requests
router.get("/user/:userId", (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();

    const requests = db
      .prepare("SELECT * FROM waste_requests WHERE userId = ? ORDER BY createdDate DESC")
      .all(userId);

    res.json(requests);
  } catch (error) {
    console.error("Get user requests error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all waste requests
router.get("/", (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const db = getDatabase();

    let query = "SELECT * FROM waste_requests";
    const params: any[] = [];

    if (status) {
      query += " WHERE status = ?";
      params.push(status);
    }

    query += " ORDER BY createdDate DESC";

    const requests = db.prepare(query).all(...params);
    res.json(requests);
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get specific waste request
router.get("/:requestId", (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const db = getDatabase();

    const request = db
      .prepare("SELECT * FROM waste_requests WHERE id = ?")
      .get(requestId);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json(request);
  } catch (error) {
    console.error("Get request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update waste request status
router.put("/:requestId", (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { status, vendorId, vendorBusinessName } = req.body;
    const db = getDatabase();

    const request = db
      .prepare("SELECT * FROM waste_requests WHERE id = ?")
      .get(requestId);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    db.prepare(
      `UPDATE waste_requests SET status = ?, vendorId = ?, vendorBusinessName = ? WHERE id = ?`
    ).run(status || request.status, vendorId || request.vendorId, vendorBusinessName || request.vendorBusinessName, requestId);

    const updated = db
      .prepare("SELECT * FROM waste_requests WHERE id = ?")
      .get(requestId);

    res.json({ success: true, request: updated });
  } catch (error) {
    console.error("Update request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete waste request
router.delete("/:requestId", (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const db = getDatabase();

    const request = db
      .prepare("SELECT * FROM waste_requests WHERE id = ?")
      .get(requestId);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    db.prepare("DELETE FROM waste_requests WHERE id = ?").run(requestId);

    res.json({ success: true, message: "Request deleted" });
  } catch (error) {
    console.error("Delete request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
