/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getDatabase } from "../utils/database.js";
import { generateId } from "../utils/helpers.js";
import { validateWasteRequest } from "../utils/validation.js";

export class WasteController {
  static createWasteRequest(data: any) {
    const validation = validateWasteRequest(data);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
    }

    const db = getDatabase();
    const id = generateId("req");
    const createdDate = new Date().toISOString();

    // Calculate estimated payout and points
    const estimatedPayout = data.weight * 2.5; // $2.50 per kg
    const pointsAwarded = Math.floor(data.weight * 100);

    db.prepare(
      `INSERT INTO waste_requests 
       (id, userId, userFullName, userPhone, category, quantity, weight, wasteDescription, imageUrl, pickupAddress, pickupDate, status, createdDate, estimatedPayout, pointsAwarded)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      data.userId,
      data.userFullName,
      data.userPhone,
      data.category,
      data.quantity || 1,
      data.weight,
      data.wasteDescription || "",
      data.imageUrl || "",
      data.pickupAddress,
      data.pickupDate,
      "pending",
      createdDate,
      estimatedPayout,
      pointsAwarded
    );

    return db.prepare("SELECT * FROM waste_requests WHERE id = ?").get(id);
  }

  static getWasteRequestById(requestId: string) {
    const db = getDatabase();
    return db.prepare("SELECT * FROM waste_requests WHERE id = ?").get(requestId);
  }

  static getUserWasteRequests(userId: string) {
    const db = getDatabase();
    return db
      .prepare(
        "SELECT * FROM waste_requests WHERE userId = ? ORDER BY createdDate DESC"
      )
      .all(userId);
  }

  static getVendorWasteRequests(vendorId: string) {
    const db = getDatabase();
    return db
      .prepare(
        "SELECT * FROM waste_requests WHERE vendorId = ? ORDER BY createdDate DESC"
      )
      .all(vendorId);
  }

  static getAllWasteRequests(status?: string) {
    const db = getDatabase();

    if (status) {
      return db
        .prepare(
          "SELECT * FROM waste_requests WHERE status = ? ORDER BY createdDate DESC"
        )
        .all(status);
    }

    return db.prepare("SELECT * FROM waste_requests ORDER BY createdDate DESC").all();
  }

  static updateWasteRequestStatus(
    requestId: string,
    status: string,
    vendorId?: string
  ) {
    const db = getDatabase();
    const request = db
      .prepare("SELECT * FROM waste_requests WHERE id = ?")
      .get(requestId);

    if (!request) {
      throw new Error("Waste request not found");
    }

    if (vendorId) {
      db.prepare(
        "UPDATE waste_requests SET status = ?, vendorId = ? WHERE id = ?"
      ).run(status, vendorId, requestId);
    } else {
      db.prepare("UPDATE waste_requests SET status = ? WHERE id = ?").run(
        status,
        requestId
      );
    }

    return db.prepare("SELECT * FROM waste_requests WHERE id = ?").get(requestId);
  }

  static deleteWasteRequest(requestId: string) {
    const db = getDatabase();
    const request = db
      .prepare("SELECT * FROM waste_requests WHERE id = ?")
      .get(requestId);

    if (!request) {
      throw new Error("Waste request not found");
    }

    db.prepare("DELETE FROM waste_requests WHERE id = ?").run(requestId);
    return true;
  }

  static getWasteStats(userId?: string) {
    const db = getDatabase();

    if (userId) {
      const completed = db
        .prepare(
          "SELECT COUNT(*) as count FROM waste_requests WHERE userId = ? AND status = 'completed'"
        )
        .get(userId) as { count: number };

      const totalPayout = db
        .prepare(
          "SELECT SUM(estimatedPayout) as total FROM waste_requests WHERE userId = ? AND status = 'completed'"
        )
        .get(userId) as { total: number | null };

      const totalPoints = db
        .prepare(
          "SELECT SUM(pointsAwarded) as total FROM waste_requests WHERE userId = ? AND status = 'completed'"
        )
        .get(userId) as { total: number | null };

      return {
        completedRequests: completed.count,
        totalPayout: totalPayout.total || 0,
        totalPoints: totalPoints.total || 0,
      };
    }

    const stats = db
      .prepare(
        `SELECT 
        COUNT(*) as totalRequests,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedRequests,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingRequests,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as acceptedRequests,
        SUM(estimatedPayout) as totalPayout,
        SUM(pointsAwarded) as totalPoints
        FROM waste_requests`
      )
      .get();

    return stats;
  }
}
