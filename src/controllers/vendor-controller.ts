/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getDatabase } from "../utils/database.js";
import { generateId } from "../utils/helpers.js";

export class VendorController {
  static getAllVendors() {
    const db = getDatabase();
    const vendors = db.prepare("SELECT * FROM vendors").all();
    return vendors.map((v: any) => ({
      ...v,
      categories: v.categories ? JSON.parse(v.categories) : [],
    }));
  }

  static getVendorById(vendorId: string) {
    const db = getDatabase();
    const vendor = db.prepare("SELECT * FROM vendors WHERE id = ?").get(vendorId);
    if (vendor) {
      vendor.categories = vendor.categories ? JSON.parse(vendor.categories) : [];
    }
    return vendor;
  }

  static createVendor(data: any) {
    if (!data.businessName || !data.categories || data.lat === undefined || data.lng === undefined) {
      throw new Error("Missing required fields");
    }

    const db = getDatabase();
    const id = generateId("vend");

    db.prepare(
      `INSERT INTO vendors (id, businessName, categories, lat, lng, rating)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      data.businessName,
      JSON.stringify(data.categories),
      data.lat,
      data.lng,
      data.rating || 0
    );

    return this.getVendorById(id);
  }

  static updateVendor(vendorId: string, updateData: any) {
    const db = getDatabase();
    const vendor = db.prepare("SELECT * FROM vendors WHERE id = ?").get(vendorId);

    if (!vendor) {
      throw new Error("Vendor not found");
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (updateData.businessName !== undefined) {
      fields.push("businessName = ?");
      values.push(updateData.businessName);
    }

    if (updateData.categories !== undefined) {
      fields.push("categories = ?");
      values.push(JSON.stringify(updateData.categories));
    }

    if (updateData.lat !== undefined) {
      fields.push("lat = ?");
      values.push(updateData.lat);
    }

    if (updateData.lng !== undefined) {
      fields.push("lng = ?");
      values.push(updateData.lng);
    }

    if (updateData.rating !== undefined) {
      fields.push("rating = ?");
      values.push(updateData.rating);
    }

    if (fields.length === 0) {
      return this.getVendorById(vendorId);
    }

    values.push(vendorId);
    db.prepare(`UPDATE vendors SET ${fields.join(", ")} WHERE id = ?`).run(
      ...values
    );

    return this.getVendorById(vendorId);
  }

  static deleteVendor(vendorId: string) {
    const db = getDatabase();
    const vendor = db.prepare("SELECT * FROM vendors WHERE id = ?").get(vendorId);

    if (!vendor) {
      throw new Error("Vendor not found");
    }

    db.prepare("DELETE FROM vendors WHERE id = ?").run(vendorId);
    return true;
  }

  static getVendorStats(vendorId: string) {
    const db = getDatabase();

    const stats = db
      .prepare(
        `SELECT 
        COUNT(*) as totalRequests,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedRequests,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingRequests,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as acceptedRequests,
        AVG(rating) as avgRating
        FROM waste_requests WHERE vendorId = ?`
      )
      .get(vendorId);

    return stats;
  }
}
