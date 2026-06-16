/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import { getDatabase } from "../utils/database.js";
import { generateId } from "../utils/helpers.js";

const router = express.Router();

// Get all vendors
router.get("/", (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const vendors = db.prepare("SELECT * FROM vendors").all();
    res.json(vendors);
  } catch (error) {
    console.error("Get vendors error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get vendor by ID
router.get("/:vendorId", (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const db = getDatabase();

    const vendor = db.prepare("SELECT * FROM vendors WHERE id = ?").get(vendorId);

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    res.json(vendor);
  } catch (error) {
    console.error("Get vendor error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create vendor (admin or self-registration)
router.post("/", (req: Request, res: Response) => {
  try {
    const { businessName, categories, lat, lng, rating = 0 } = req.body;

    if (!businessName || !categories || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = getDatabase();
    const id = generateId("vend");

    db.prepare(
      `INSERT INTO vendors (id, businessName, categories, lat, lng, rating)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, businessName, JSON.stringify(categories), lat, lng, rating);

    res.status(201).json({
      success: true,
      vendor: { id, businessName, categories, lat, lng, rating },
    });
  } catch (error) {
    console.error("Create vendor error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update vendor
router.put("/:vendorId", (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const { businessName, categories, lat, lng, rating } = req.body;
    const db = getDatabase();

    const vendor = db.prepare("SELECT * FROM vendors WHERE id = ?").get(vendorId);

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    db.prepare(
      `UPDATE vendors SET businessName = ?, categories = ?, lat = ?, lng = ?, rating = ? WHERE id = ?`
    ).run(
      businessName || vendor.businessName,
      categories ? JSON.stringify(categories) : vendor.categories,
      lat !== undefined ? lat : vendor.lat,
      lng !== undefined ? lng : vendor.lng,
      rating !== undefined ? rating : vendor.rating,
      vendorId
    );

    const updated = db.prepare("SELECT * FROM vendors WHERE id = ?").get(vendorId);
    res.json({ success: true, vendor: updated });
  } catch (error) {
    console.error("Update vendor error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get vendor's accepted requests
router.get("/:vendorId/requests", (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const db = getDatabase();

    const requests = db
      .prepare(
        "SELECT * FROM waste_requests WHERE vendorId = ? ORDER BY createdDate DESC"
      )
      .all(vendorId);

    res.json(requests);
  } catch (error) {
    console.error("Get vendor requests error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
