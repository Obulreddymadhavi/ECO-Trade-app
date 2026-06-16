/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DB_DIR, "ecotrade.sqlite");

let db: Database.Database | null = null;

function ensureDbDirectory() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

function initializeDatabase() {
  ensureDbDirectory();

  if (db) {
    return db;
  }

  db = new Database(DB_PATH);

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      fullName TEXT,
      role TEXT,
      phone TEXT,
      address TEXT,
      walletBalance REAL DEFAULT 0,
      rewardPoints INTEGER DEFAULT 0,
      createdDate TEXT
    );

    CREATE TABLE IF NOT EXISTS vendors (
      id TEXT PRIMARY KEY,
      businessName TEXT,
      categories TEXT,
      lat REAL,
      lng REAL,
      rating REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS waste_requests (
      id TEXT PRIMARY KEY,
      userId TEXT,
      userFullName TEXT,
      userPhone TEXT,
      category TEXT,
      quantity INTEGER,
      weight REAL,
      wasteDescription TEXT,
      imageUrl TEXT,
      pickupAddress TEXT,
      pickupDate TEXT,
      status TEXT,
      createdDate TEXT,
      estimatedPayout REAL,
      pointsAwarded INTEGER,
      vendorId TEXT,
      vendorBusinessName TEXT,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (vendorId) REFERENCES vendors(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      userId TEXT,
      amount REAL,
      type TEXT,
      status TEXT,
      reference TEXT,
      description TEXT,
      createdDate TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT,
      message TEXT,
      type TEXT,
      read INTEGER DEFAULT 0,
      createdDate TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS bank_accounts (
      id TEXT PRIMARY KEY,
      userId TEXT,
      bankName TEXT,
      accountHolder TEXT,
      accountNumber TEXT,
      rawAccountNumber TEXT,
      routingCode TEXT,
      isPrimary INTEGER DEFAULT 0,
      createdDate TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);

  // Initialize with sample data if tables are empty
  const userCount = db
    .prepare("SELECT COUNT(*) as count FROM users")
    .get() as { count: number };

  if (userCount.count === 0) {
    initializeSampleData(db);
  }

  return db;
}

function initializeSampleData(database: Database.Database) {
  const now = new Date().toISOString();

  // Sample users
  database
    .prepare(
      `INSERT INTO users (id, email, password, fullName, role, phone, address, walletBalance, rewardPoints, createdDate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      "cust-1",
      "customer@ecotrade.com",
      "password123",
      "Jane Doe",
      "customer",
      "+1 (555) 123-4567",
      "123 Eco Way, Green Hills",
      25.5,
      340,
      now
    );

  database
    .prepare(
      `INSERT INTO users (id, email, password, fullName, role, phone, address, walletBalance, rewardPoints, createdDate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      "vend-1",
      "vendor@ecotrade.com",
      "password123",
      "EcoCycle Solutions",
      "vendor",
      "+1 (555) 987-6543",
      "456 Recycling Blvd, Industrial Zone",
      150.0,
      750,
      now
    );

  database
    .prepare(
      `INSERT INTO users (id, email, password, fullName, role, phone, address, walletBalance, rewardPoints, createdDate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      "admin-1",
      "admin@ecotrade.com",
      "password123",
      "EcoTrade Administrator",
      "admin",
      "+1 (555) 000-1111",
      "EcoTrade HQ, Tech Park",
      0.0,
      0,
      now
    );

  // Sample vendors
  database
    .prepare(
      `INSERT INTO vendors (id, businessName, categories, lat, lng, rating)
     VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      "vend-1",
      "EcoCycle Solutions",
      JSON.stringify(["E-Waste", "Metal"]),
      40.7128,
      -74.006,
      4.8
    );

  database
    .prepare(
      `INSERT INTO vendors (id, businessName, categories, lat, lng, rating)
     VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      "vend-2",
      "Green Plastics Recycling",
      JSON.stringify(["Plastic", "Paper"]),
      34.0522,
      -118.2437,
      4.5
    );

  // Sample waste requests
  database
    .prepare(
      `INSERT INTO waste_requests (id, userId, userFullName, userPhone, category, quantity, weight, wasteDescription, pickupAddress, pickupDate, status, createdDate, estimatedPayout, pointsAwarded)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      "req-1",
      "cust-1",
      "Jane Doe",
      "+1 (555) 123-4567",
      "E-Waste",
      1,
      12.5,
      "Old office computer housing and desktop motherboard.",
      "123 Eco Way, Green Hills",
      "2026-06-25",
      "pending",
      now,
      50.0,
      500
    );

  // Sample notifications
  database
    .prepare(
      `INSERT INTO notifications (id, userId, message, type, read, createdDate)
     VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      "notif-1",
      "cust-1",
      "Welcome to EcoTrade! Classify and deposit recyclables to earn cash & reward coupons.",
      "info",
      0,
      now
    );
}

export function getDatabase(): Database.Database {
  if (!db) {
    initializeDatabase();
  }
  return db!;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
