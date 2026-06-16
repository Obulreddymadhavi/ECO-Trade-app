import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const DB_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DB_DIR, "ecotrade.sqlite");
const JSON_DB_PATH = path.join(DB_DIR, "db.json");

function ensureDbDirectory() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

ensureDbDirectory();

const db = new Database(DB_PATH);

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      fullName TEXT,
      role TEXT,
      phone TEXT,
      address TEXT,
      walletBalance REAL,
      rewardPoints INTEGER,
      createdDate TEXT
    );

    CREATE TABLE IF NOT EXISTS vendors (
      id TEXT PRIMARY KEY,
      businessName TEXT,
      categories TEXT,
      lat REAL,
      lng REAL,
      rating REAL
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
      vendorBusinessName TEXT
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      userId TEXT,
      amount REAL,
      type TEXT,
      status TEXT,
      reference TEXT,
      description TEXT,
      createdDate TEXT
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT,
      message TEXT,
      type TEXT,
      read INTEGER,
      createdDate TEXT
    );

    CREATE TABLE IF NOT EXISTS bank_accounts (
      id TEXT PRIMARY KEY,
      userId TEXT,
      bankName TEXT,
      accountHolder TEXT,
      accountNumber TEXT,
      rawAccountNumber TEXT,
      routingCode TEXT,
      isPrimary INTEGER,
      createdDate TEXT
    );
  `);
}

function toBoolean(value: number | string | null): boolean {
  return Boolean(value) && Number(value) === 1;
}

function fromBoolean(value: boolean): number {
  return value ? 1 : 0;
}

const initialDb = {
  users: [
    {
      id: "cust-1",
      email: "customer@ecotrade.com",
      password: "password123",
      fullName: "Jane Doe",
      role: "customer",
      phone: "+1 (555) 123-4567",
      address: "123 Eco Way, Green Hills",
      walletBalance: 25.5,
      rewardPoints: 340,
      createdDate: new Date().toISOString()
    },
    {
      id: "vend-1",
      email: "vendor@ecotrade.com",
      password: "password123",
      fullName: "EcoCycle Solutions",
      role: "vendor",
      phone: "+1 (555) 987-6543",
      address: "456 Recycling Blvd, Industrial Zone",
      walletBalance: 150.0,
      rewardPoints: 750,
      createdDate: new Date().toISOString()
    },
    {
      id: "admin-1",
      email: "admin@ecotrade.com",
      password: "password123",
      fullName: "EcoTrade Administrator",
      role: "admin",
      phone: "+1 (555) 000-1111",
      address: "EcoTrade HQ, Tech Park",
      walletBalance: 0.0,
      rewardPoints: 0,
      createdDate: new Date().toISOString()
    }
  ],
  wasteRequests: [
    {
      id: "req-1",
      userId: "cust-1",
      userFullName: "Jane Doe",
      userPhone: "+1 (555) 123-4567",
      category: "E-Waste",
      quantity: 1,
      weight: 12.5,
      wasteDescription: "Old office computer housing and desktop motherboard.",
      pickupAddress: "123 Eco Way, Green Hills",
      pickupDate: "2026-06-25",
      status: "pending",
      createdDate: new Date().toISOString(),
      estimatedPayout: 50.0,
      pointsAwarded: 500
    },
    {
      id: "req-2",
      userId: "cust-1",
      userFullName: "Jane Doe",
      userPhone: "+1 (555) 123-4567",
      vendorId: "vend-1",
      vendorBusinessName: "EcoCycle Solutions",
      category: "Plastic",
      quantity: 3,
      weight: 4.2,
      wasteDescription: "Clean plastic bottles and jugs.",
      pickupAddress: "123 Eco Way, Green Hills",
      pickupDate: "2026-06-18",
      status: "accepted",
      createdDate: new Date().toISOString(),
      estimatedPayout: 5.04,
      pointsAwarded: 50
    },
    {
      id: "req-3",
      userId: "cust-1",
      userFullName: "Jane Doe",
      userPhone: "+1 (555) 123-4567",
      vendorId: "vend-1",
      vendorBusinessName: "EcoCycle Solutions",
      category: "Metal",
      quantity: 1,
      weight: 15,
      wasteDescription: "Mixed steel scrap pieces.",
      pickupAddress: "123 Eco Way, Green Hills",
      pickupDate: "2026-06-10",
      status: "completed",
      createdDate: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      estimatedPayout: 37.5,
      pointsAwarded: 375
    }
  ],
  transactions: [
    {
      id: "tx-1",
      userId: "cust-1",
      amount: 37.5,
      type: "payout",
      status: "completed",
      reference: "TX-METAL-COMPLETED",
      description: "Waste Recycling payout for Request #req-3 (Metal scrap collection)",
      createdDate: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
    }
  ],
  notifications: [
    {
      id: "notif-1",
      userId: "cust-1",
      message: "Welcome to EcoTrade! Classify and deposit recyclables to earn cash & reward coupons.",
      type: "info",
      read: false,
      createdDate: new Date().toISOString()
    }
  ],
  vendors: [
    {
      id: "vend-1",
      businessName: "EcoCycle Solutions",
      categories: ["Plastic", "Paper", "Metal", "E-Waste"],
      lat: 37.7749,
      lng: -122.4194,
      rating: 4.8
    },
    {
      id: "vend-2",
      businessName: "GreenTech Glass Recycle",
      categories: ["Glass"],
      lat: 37.7833,
      lng: -122.4167,
      rating: 4.5
    },
    {
      id: "vend-3",
      businessName: "OrganicBio Solutions",
      categories: ["Organic Waste"],
      lat: 37.7699,
      lng: -122.4468,
      rating: 4.9
    }
  ]
};

function migrateJsonDatabase() {
  if (!fs.existsSync(JSON_DB_PATH)) return;
  const row = db.prepare("SELECT COUNT(*) AS count FROM users").get();
  if (row.count > 0) return;

  try {
    const content = fs.readFileSync(JSON_DB_PATH, "utf-8");
    const data = JSON.parse(content);
    writeDb(data);
    const backupPath = `${JSON_DB_PATH}.migrated`;
    fs.renameSync(JSON_DB_PATH, backupPath);
    console.info(`Migrated legacy JSON database to SQLite at ${DB_PATH}. Backup preserved at ${backupPath}`);
  } catch (error) {
    console.error("Failed to migrate legacy JSON database:", error);
  }
}

export function initDatabase() {
  createTables();
  migrateJsonDatabase();
  const row = db.prepare("SELECT COUNT(*) AS count FROM users").get();
  if (row.count === 0) {
    writeDb(initialDb);
  }
}

export function readDb() {
  return {
    users: db.prepare("SELECT * FROM users").all(),
    vendors: db.prepare("SELECT * FROM vendors").all().map((vendor: any) => ({
      ...vendor,
      categories: JSON.parse(vendor.categories || "[]")
    })),
    wasteRequests: db.prepare("SELECT * FROM waste_requests").all(),
    transactions: db.prepare("SELECT * FROM transactions").all(),
    notifications: db.prepare("SELECT * FROM notifications").all().map((notification: any) => ({
      ...notification,
      read: toBoolean(notification.read)
    })),
    bankAccounts: db.prepare("SELECT * FROM bank_accounts").all().map((account: any) => ({
      ...account,
      isPrimary: toBoolean(account.isPrimary)
    }))
  };
}

export function writeDb(data: any) {
  const transaction = db.transaction((payload: any) => {
    db.prepare("DELETE FROM users").run();
    db.prepare("DELETE FROM vendors").run();
    db.prepare("DELETE FROM waste_requests").run();
    db.prepare("DELETE FROM transactions").run();
    db.prepare("DELETE FROM notifications").run();
    db.prepare("DELETE FROM bank_accounts").run();

    const insertUser = db.prepare(
      `INSERT INTO users (id, email, password, fullName, role, phone, address, walletBalance, rewardPoints, createdDate)
       VALUES (@id, @email, @password, @fullName, @role, @phone, @address, @walletBalance, @rewardPoints, @createdDate)`
    );

    const insertVendor = db.prepare(
      `INSERT INTO vendors (id, businessName, categories, lat, lng, rating)
       VALUES (@id, @businessName, @categories, @lat, @lng, @rating)`
    );

    const insertWasteRequest = db.prepare(
      `INSERT INTO waste_requests (id, userId, userFullName, userPhone, category, quantity, weight, wasteDescription,
       imageUrl, pickupAddress, pickupDate, status, createdDate, estimatedPayout, pointsAwarded, vendorId, vendorBusinessName)
       VALUES (@id, @userId, @userFullName, @userPhone, @category, @quantity, @weight, @wasteDescription,
       @imageUrl, @pickupAddress, @pickupDate, @status, @createdDate, @estimatedPayout, @pointsAwarded, @vendorId, @vendorBusinessName)`
    );

    const insertTransaction = db.prepare(
      `INSERT INTO transactions (id, userId, amount, type, status, reference, description, createdDate)
       VALUES (@id, @userId, @amount, @type, @status, @reference, @description, @createdDate)`
    );

    const insertNotification = db.prepare(
      `INSERT INTO notifications (id, userId, message, type, read, createdDate)
       VALUES (@id, @userId, @message, @type, @read, @createdDate)`
    );

    const insertBankAccount = db.prepare(
      `INSERT INTO bank_accounts (id, userId, bankName, accountHolder, accountNumber, rawAccountNumber, routingCode, isPrimary, createdDate)
       VALUES (@id, @userId, @bankName, @accountHolder, @accountNumber, @rawAccountNumber, @routingCode, @isPrimary, @createdDate)`
    );

    for (const user of payload.users || []) {
      insertUser.run(user);
    }

    for (const vendor of payload.vendors || []) {
      insertVendor.run({
        ...vendor,
        categories: JSON.stringify(vendor.categories || [])
      });
    }

    for (const wasteRequest of payload.wasteRequests || []) {
      insertWasteRequest.run({
        ...wasteRequest,
        quantity: wasteRequest.quantity || 0,
        weight: wasteRequest.weight || 0,
        estimatedPayout: wasteRequest.estimatedPayout || 0,
        pointsAwarded: wasteRequest.pointsAwarded || 0
      });
    }

    for (const transaction of payload.transactions || []) {
      insertTransaction.run(transaction);
    }

    for (const notification of payload.notifications || []) {
      insertNotification.run({
        ...notification,
        read: fromBoolean(notification.read ?? false)
      });
    }

    for (const bankAccount of payload.bankAccounts || []) {
      insertBankAccount.run({
        ...bankAccount,
        isPrimary: fromBoolean(bankAccount.isPrimary ?? false)
      });
    }
  });

  transaction(data);
}
