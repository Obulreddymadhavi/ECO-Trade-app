/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getDatabase } from "../utils/database.js";
import { validateUser } from "../utils/validation.js";

export class UserController {
  static getUserById(userId: string) {
    const db = getDatabase();
    return db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  }

  static getAllUsers() {
    const db = getDatabase();
    return db.prepare("SELECT * FROM users").all();
  }

  static getUsersByRole(role: string) {
    const db = getDatabase();
    return db.prepare("SELECT * FROM users WHERE role = ?").all(role);
  }

  static createUser(userData: any) {
    const validation = validateUser(userData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
    }

    const db = getDatabase();
    const id = `${userData.role.substring(0, 4)}-${Date.now()}`;
    const createdDate = new Date().toISOString();

    db.prepare(
      `INSERT INTO users (id, email, password, fullName, role, phone, address, walletBalance, rewardPoints, createdDate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      userData.email,
      userData.password,
      userData.fullName,
      userData.role || "customer",
      userData.phone || "",
      userData.address || "",
      userData.walletBalance || 0,
      userData.rewardPoints || 0,
      createdDate
    );

    return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  }

  static updateUser(userId: string, updateData: any) {
    const db = getDatabase();
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (updateData.fullName !== undefined) {
      fields.push("fullName = ?");
      values.push(updateData.fullName);
    }

    if (updateData.phone !== undefined) {
      fields.push("phone = ?");
      values.push(updateData.phone);
    }

    if (updateData.address !== undefined) {
      fields.push("address = ?");
      values.push(updateData.address);
    }

    if (updateData.walletBalance !== undefined) {
      fields.push("walletBalance = ?");
      values.push(updateData.walletBalance);
    }

    if (updateData.rewardPoints !== undefined) {
      fields.push("rewardPoints = ?");
      values.push(updateData.rewardPoints);
    }

    if (fields.length === 0) {
      return user;
    }

    values.push(userId);
    db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`).run(
      ...values
    );

    return db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  }

  static deleteUser(userId: string) {
    const db = getDatabase();
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

    if (!user) {
      throw new Error("User not found");
    }

    db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    return true;
  }

  static authenticateUser(email: string, password: string) {
    const db = getDatabase();
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // In production, use bcrypt for password comparison
    if (user.password !== password) {
      throw new Error("Invalid credentials");
    }

    return user;
  }
}
