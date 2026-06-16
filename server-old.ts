/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Import routes
import authRoutes from "./src/routes/auth.js";
import userRoutes from "./src/routes/users.js";
import wasteRequestRoutes from "./src/routes/waste-requests.js";
import vendorRoutes from "./src/routes/vendors.js";
import transactionRoutes from "./src/routes/transactions.js";
import notificationRoutes from "./src/routes/notifications.js";
import rewardRoutes from "./src/routes/rewards.js";
import aiClassificationRoutes from "./src/routes/ai-classification.js";

// Import middleware
import { authMiddleware, optionalAuth } from "./src/middleware/auth.js";
import { errorHandler, notFoundHandler } from "./src/middleware/error-handler.js";
import { requestLogger } from "./src/middleware/logger.js";

// Import database
import { getDatabase, closeDatabase } from "./src/utils/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));
app.use(requestLogger);

// Setup Database Path
const DB_FILE = path.join(process.cwd(), ".data", "db.json");

function ensureDbDirectory() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Initial DB state
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
      walletBalance: 25.50,
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
      walletBalance: 150.00,
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
      walletBalance: 0.00,
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
      estimatedPayout: 50.00,
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
      estimatedPayout: 37.50,
      pointsAwarded: 375
    }
  ],
  transactions: [
    {
      id: "tx-1",
      userId: "cust-1",
      amount: 37.50,
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

function readDb() {
  ensureDbDirectory();
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
    return initialDb;
  }
  try {
    const content = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    console.error("Error reading database, resetting...", e);
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
    return initialDb;
  }
}

function writeDb(data: any) {
  ensureDbDirectory();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// Initial validation
readDb();

// Gemini API Configuration
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  console.log("Gemini API Key detected. Initializing modern GoogleGenAI SDK client...");
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      }
    }
  });
} else {
  console.log("No GEMINI_API_KEY. Using dynamic, smart categorizer simulation in backend.");
}

function getMockClassification(textDescription: string = "") {
  const desc = textDescription.toLowerCase();
  let category = "Plastic";
  let confidence = 0.94;
  let descriptionStr = "Mixed high-density plastics or general containers.";
  let weight = 1.6;

  if (desc.includes("paper") || desc.includes("box") || desc.includes("cardboard") || desc.includes("newspaper") || desc.includes("magazine")) {
    category = "Paper";
    descriptionStr = "Compressed packaging cardboard & newsprint detected.";
    weight = 3.2;
  } else if (desc.includes("glass") || desc.includes("bottle") || desc.includes("jar") || desc.includes("container")) {
    category = "Glass";
    descriptionStr = "High-quality silica container class clear glass.";
    weight = 2.4;
  } else if (desc.includes("metal") || desc.includes("aluminum") || desc.includes("copper") || desc.includes("steel") || desc.includes("can") || desc.includes("iron")) {
    category = "Metal";
    descriptionStr = "Mixed scrap plumbing metals or clean iron fractions.";
    weight = 8.5;
  } else if (desc.includes("computer") || desc.includes("phone") || desc.includes("wire") || desc.includes("electronic") || desc.includes("charger") || desc.includes("battery")) {
    category = "E-Waste";
    descriptionStr = "Recyclable silicon boards and composite metallic components.";
    weight = 5.0;
  } else if (desc.includes("food") || desc.includes("vegetable") || desc.includes("organic") || desc.includes("waste") || desc.includes("leaves") || desc.includes("meal")) {
    category = "Organic Waste";
    descriptionStr = "Standard biodegradable cellulose & fresh organic scraps.";
    weight = 4.5;
  }

  const rates: Record<string, { price: number; pts: number }> = {
    "Plastic": { price: 1.20, pts: 12 },
    "Paper": { price: 0.80, pts: 8 },
    "Glass": { price: 1.50, pts: 15 },
    "Metal": { price: 2.50, pts: 25 },
    "E-Waste": { price: 4.00, pts: 40 },
    "Organic Waste": { price: 0.50, pts: 5 }
  };

  const currentRate = rates[category] || rates["Plastic"];
  const estimatedPayout = Math.round(weight * currentRate.price * 100) / 100;
  const pointsAwarded = Math.round(weight * currentRate.pts);

  return {
    category,
    confidence,
    description: descriptionStr,
    estimatedWeight: weight,
    estimatedPayout,
    pointsAwarded
  };
}

// ---------------------- API ROUTES ----------------------

// 1. Auth routes
app.post("/api/auth/register", (req, res) => {
  const { email, password, fullName, role, phone, address } = req.body;
  if (!email || !password || !fullName || !role) {
    return res.status(400).json({ error: "Required fields missing." });
  }

  const db = readDb();
  const existingUser = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: "User already exists with this email address." });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    email,
    password, // Store as cleartext for simplicity in development simulation
    fullName,
    role,
    phone: phone || "",
    address: address || "",
    walletBalance: 0,
    rewardPoints: 100, // Gift 100 on registration
    createdDate: new Date().toISOString()
  };

  db.users.push(newUser);

  // If user is a vendor, register vendor specialties details too
  if (role === "vendor") {
    db.vendors.push({
      id: newUser.id,
      businessName: fullName,
      categories: ["Plastic", "Paper", "Glass", "Metal", "E-Waste"],
      lat: 37.7749 + (Math.random() - 0.5) * 0.05,
      lng: -122.4194 + (Math.random() - 0.5) * 0.05,
      rating: 5.0
    });
  }

  writeDb(db);
  const { password: _, ...userWithoutPassword } = newUser;
  return res.status(201).json({ user: userWithoutPassword, token: `simulated-jwt-token-${newUser.id}` });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const db = readDb();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const { password: _, ...userWithoutPassword } = user;
  return res.json({ user: userWithoutPassword, token: `simulated-jwt-token-${user.id}` });
});

app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  const db = readDb();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email?.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "No account found with this email." });
  }
  return res.json({ message: "Simulated OTP reset code sent via email & SMS", otp: "4821" });
});

app.post("/api/auth/reset-password", (req, res) => {
  const { email, password, otp } = req.body;
  if (!otp || otp !== "4821") {
    return res.status(400).json({ error: "Invalid or expired OTP code." });
  }
  const db = readDb();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email?.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  user.password = password;
  writeDb(db);
  return res.json({ message: "Password reset completed successfully. Please login." });
});

// 2. User profile routes
app.get("/api/users/profile", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized access" });
  const userId = authHeader.replace("Bearer simulated-jwt-token-", "").trim();

  const db = readDb();
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found." });

  const { password: _, ...cleanUser } = user;
  return res.json(cleanUser);
});

app.put("/api/users/profile", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized access" });
  const userId = authHeader.replace("Bearer simulated-jwt-token-", "").trim();

  const { fullName, phone, address } = req.body;
  const db = readDb();
  const userIndex = db.users.findIndex((u: any) => u.id === userId);
  if (userIndex === -1) return res.status(404).json({ error: "User not found." });

  db.users[userIndex] = {
    ...db.users[userIndex],
    fullName: fullName || db.users[userIndex].fullName,
    phone: phone ?? db.users[userIndex].phone,
    address: address ?? db.users[userIndex].address
  };

  writeDb(db);
  const { password: _, ...cleanUser } = db.users[userIndex];
  return res.json(cleanUser);
});

// 2b. Verified Bank Accounts management endpoints
app.get("/api/users/bank-accounts", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized access" });
  const userId = authHeader.replace("Bearer simulated-jwt-token-", "").trim();

  const db = readDb();
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found." });

  const bankAccounts = user.bankAccounts || [];
  return res.json(bankAccounts);
});

app.post("/api/users/bank-accounts", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized access" });
  const userId = authHeader.replace("Bearer simulated-jwt-token-", "").trim();

  const { bankName, accountHolder, accountNumber, routingCode, isPrimary } = req.body;
  if (!bankName || !accountHolder || !accountNumber || !routingCode) {
    return res.status(400).json({ error: "Missing required bank details parameters." });
  }

  const db = readDb();
  const userIndex = db.users.findIndex((u: any) => u.id === userId);
  if (userIndex === -1) return res.status(404).json({ error: "User not found." });

  const user = db.users[userIndex];
  if (!user.bankAccounts) {
    user.bankAccounts = [];
  }

  const newAccount = {
    id: `bnk-${Date.now()}`,
    bankName,
    accountHolder,
    accountNumber: accountNumber.replace(/\d(?=\d{4})/g, "*"), // Obfuscate for secure presentation
    rawAccountNumber: accountNumber,
    routingCode,
    isPrimary: !!isPrimary,
    createdDate: new Date().toISOString()
  };

  // If primary is true, reset other accounts
  if (newAccount.isPrimary) {
    user.bankAccounts.forEach((acc: any) => acc.isPrimary = false);
  } else if (user.bankAccounts.length === 0) {
    newAccount.isPrimary = true;
  }

  user.bankAccounts.push(newAccount);
  db.notifications.push({
    id: `notif-${Date.now()}-bank`,
    userId,
    message: `Secure Bank account details [${newAccount.bankName} ending in ${newAccount.rawAccountNumber.slice(-4)}] successfully connected.`,
    type: "success",
    read: false,
    createdDate: new Date().toISOString()
  });

  writeDb(db);
  return res.status(201).json(newAccount);
});

app.delete("/api/users/bank-accounts/:id", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized access" });
  const userId = authHeader.replace("Bearer simulated-jwt-token-", "").trim();

  const db = readDb();
  const userIndex = db.users.findIndex((u: any) => u.id === userId);
  if (userIndex === -1) return res.status(404).json({ error: "User not found." });

  const user = db.users[userIndex];
  if (!user.bankAccounts) user.bankAccounts = [];

  user.bankAccounts = user.bankAccounts.filter((acc: any) => acc.id !== req.params.id);
  
  if (user.bankAccounts.length > 0 && !user.bankAccounts.some((acc: any) => acc.isPrimary)) {
    user.bankAccounts[0].isPrimary = true;
  }

  writeDb(db);
  return res.json({ message: "Bank Account successfully disconnected.", bankAccounts: user.bankAccounts });
});

// 2c. Real-Time Chatbot AI Copilot (EcoBot)
app.post("/api/chat", async (req, res) => {
  const { messages, userContext } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "A messages array is required." });
  }

  const contextStr = userContext 
    ? `Logged-in User context: Name is ${userContext.fullName}, active Role is ${userContext.role}, Balance is $${userContext.walletBalance}, Points is ${userContext.rewardPoints} pts, Home coordinates is ${userContext.address || "None specified"}.` 
    : "The visitor is an unauthenticated guest.";

  const systemInstructions = `You are "EcoBot", EcoTrade's smart AI Chatbot Expert & Green Earth Counsellor.
  Your job is to assist users layout recycler activities, sold scraps, withdraw eco funds direct to linked bank accounts, schedule pick-ups, track live GPS locations on delivery driver coordinates and maximize scrap conversion.
  ${contextStr}
  
  Rules:
  1. Keep answers conversational, extremely positive, direct, clear, and action-oriented. Do not use complex system logs or technical jargon.
  2. Speak about points, rates, environmental benefits, and platform capabilities.
  3. When queried about bank accounts, remind users that they can safely register, edit and manage their checking/savings accounts under the Profile settings tab and instantly withdraw wallet proceeds directly to them.
  4. Always respond with beautiful markdown formatting.`;

  if (!aiClient) {
    const userMessage = messages[messages.length - 1]?.content || "";
    const msg = userMessage.toLowerCase();
    let reply = "";

    if (msg.includes("bank") || msg.includes("account") || msg.includes("routing") || msg.includes("withdraw")) {
      reply = "💡 **Verified Real-time Bank Accounts**\nYou can safely link, view, and manage your savings/checking Bank Accounts details from the **Profile** section! Once connected, select any linked account from the **Wallet** withdrawal form to initiate real-time automatic bank transfers.";
    } else if (msg.includes("track") || msg.includes("gps") || msg.includes("map") || msg.includes("where")) {
      reply = "📍 **Real-time Live GPS Route Tracking**\nEvery active pickup has real-time visual SVG tracking map. Move to **My Requests** tab, select your pending or accepted requested pickup, and click **Teleport Near Doorstep** to simulate driver delivery progress and watch it update live on your viewport!";
    } else if (msg.includes("rate") || msg.includes("price") || msg.includes("worth") || msg.includes("category")) {
      reply = "💰 **Recycling Market Payout Guidelines**\nWe pay direct rates for recyclables:\n- 🔋 **E-Waste**: $4.00/Kg + 40 pts/Kg\n- 🔧 **Metal**: $2.50/Kg + 25 pts/Kg\n- 🍷 **Glass**: $1.50/Kg + 15 pts/Kg\n- 🍼 **Plastic**: $1.20/Kg + 12 pts/Kg\n- 📦 **Paper/Cardboard**: $0.80/Kg + 8 pts/Kg\n- 🥬 **Organic Waste**: $0.50/Kg + 5 pts/Kg\n\nYou can also upload/drag a scrap picture in the Request screen, and Gemini will speculate weight and rate automatically!";
    } else if (msg.includes("reward") || msg.includes("point") || msg.includes("coupon") || msg.includes("coffee") || msg.includes("starbucks")) {
      reply = "🎁 **EcoPoints Loyalty Store**\nFor every pick-up, you earn **EcoPoints**! Redeem them under the **Rewards** tab for gift cards:\n- **$5 Amazon Gift Card** (200 pts)\n- **$10 Target Eco-Coupon** (350 pts)\n- **Starbucks Reusable Green Cup** (500 pts)";
    } else if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || msg.includes("who are you")) {
      reply = "Hello! I am **EcoBot**, your digital EcoTrade assistant! 🌿 How can I help you unlock wealth from your household wastes today? I can assist you with:\n- 💳 **Connecting real-time bank accounts details**\n- 📍 **Tracking driver GPS map telemetry**\n- 📈 **Reviewing scrap category payout markets**";
    } else {
      reply = "Thank you for chatting with EcoBot! 🌿 I am fully capable of handling questions on linking real-time Bank details, verifying live GPS dispatch routing, and coupon reward stores. How can I guide you today?";
    }

    return res.json({ text: reply });
  }

  try {
    const geminiContents = messages.map((m: any) => ({
      role: m.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: m.content }]
    }));

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: geminiContents,
      config: {
        systemInstruction: systemInstructions
      }
    });

    return res.json({ text: response.text || "I apologize, I didn't catch that. Could you describe your query again?" });
  } catch (err: any) {
    console.error("Gemini Chat API error:", err);
    return res.json({ text: "I'm having a brief issue contacting the Gemini node, but I am still online! How can I assist you with your EcoTrade recycling questions?" });
  }
});

// 3. AI classification endpoint
app.post("/api/waste/classify", async (req, res) => {
  const { imageBase64, imageType, textDescription } = req.body;

  if (!aiClient) {
    const simulationResult = getMockClassification(textDescription || "");
    return res.json(simulationResult);
  }

  try {
    const sysPrompt = `You are EcoTrade's High-Tech Smart Recycle Waste Classifier.
    Analyze the provided details and return a strict single JSON object containing precise classification data.
    The category MUST be exactly one of: "Plastic", "Paper", "Glass", "Metal", "E-Waste", "Organic Waste".
    Calculate:
    - estimatedWeight: number (speculated weight of item in kg)
    - pointsAwarded: integer (estimatedWeight * categoryPoints)
    - estimatedPayout: number (estimatedWeight * categoryPrice)
    Where rates are:
    * Plastic: Payout $1.20/kg, 12 pts/kg
    * Paper: Payout $0.80/kg, 8 pts/kg
    * Glass: Payout $1.50/kg, 15 pts/kg
    * Metal: Payout $2.50/kg, 25 pts/kg
    * E-Waste: Payout $4.00/kg, 40 pts/kg
    * Organic Waste: Payout $0.50/kg, 5 pts/kg

    Example response format:
    {"category": "Plastic", "confidence": 0.95, "description": "Clear PET polyethylene water bottles.", "estimatedWeight": 2.5, "estimatedPayout": 3.0, "pointsAwarded": 30}`;

    let response;
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const imagePart = {
        inlineData: {
          mimeType: imageType || "image/jpeg",
          data: cleanBase64
        }
      };
      
      const promptText = `Directly analyze this waste recycling physical image.
      Determine its primary waste category, estimate realistic physical weight in kilograms, and estimate points and payout value.
      User supplied descriptions/notes: "${textDescription || "None provided"}"`;

      response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [imagePart, { text: promptText }],
        config: {
          systemInstruction: sysPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              description: { type: Type.STRING },
              estimatedWeight: { type: Type.NUMBER },
              estimatedPayout: { type: Type.NUMBER },
              pointsAwarded: { type: Type.INTEGER }
            },
            required: ["category", "confidence", "description", "estimatedWeight", "estimatedPayout", "pointsAwarded"]
          }
        }
      });
    } else {
      response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze recycling waste descriptive request details: "${textDescription || "Recyclable mixed house supply"}"`,
        config: {
          systemInstruction: sysPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              description: { type: Type.STRING },
              estimatedWeight: { type: Type.NUMBER },
              estimatedPayout: { type: Type.NUMBER },
              pointsAwarded: { type: Type.INTEGER }
            },
            required: ["category", "confidence", "description", "estimatedWeight", "estimatedPayout", "pointsAwarded"]
          }
        }
      });
    }

    const payloadText = response.text || "{}";
    const payload = JSON.parse(payloadText.trim());
    return res.json(payload);
  } catch (err: any) {
    console.error("Gemini Classify API error, using smart fallback:", err);
    return res.json(getMockClassification(textDescription || ""));
  }
});

// 4. Waste Requests endpoints
app.post("/api/waste", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized access" });
  const userId = authHeader.replace("Bearer simulated-jwt-token-", "").trim();

  const { category, quantity, weight, wasteDescription, imageUrl, pickupAddress, pickupDate, estimatedPayout, pointsAwarded } = req.body;
  if (!category || !weight || !pickupAddress || !pickupDate) {
    return res.status(400).json({ error: "Fields category, weight, pickupAddress, pickupDate are mandatory." });
  }

  const db = readDb();
  const customer = db.users.find((u: any) => u.id === userId);
  if (!customer) return res.status(404).json({ error: "Customer profile not found" });

  const points = Number(pointsAwarded) || (Number(weight) * 10);
  const payout = Number(estimatedPayout) || (Number(weight) * 1.5);

  const newRequest = {
    id: `req-${Date.now()}`,
    userId,
    userFullName: customer.fullName,
    userPhone: customer.phone || "+1 (555) Recycle",
    category,
    quantity: Number(quantity) || 1,
    weight: Number(weight),
    wasteDescription: wasteDescription || "",
    imageUrl: imageUrl || "",
    pickupAddress,
    pickupDate,
    status: "pending",
    createdDate: new Date().toISOString(),
    estimatedPayout: Number(payout.toFixed(2)),
    pointsAwarded: Math.round(points)
  };

  db.wasteRequests.push(newRequest);
  
  // Add Notification
  db.notifications.push({
    id: `notif-${Date.now()}`,
    userId,
    message: `A pick-up for your ${category} waste was requested successfully. We are recommending near vendors.`,
    type: "success",
    read: false,
    createdDate: new Date().toISOString()
  });

  writeDb(db);
  return res.status(201).json(newRequest);
});

// Fetch waste requests
app.get("/api/waste", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized access" });
  const userId = authHeader.replace("Bearer simulated-jwt-token-", "").trim();

  const db = readDb();
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (user.role === "customer") {
    const list = db.wasteRequests.filter((r: any) => r.userId === userId);
    return res.json(list);
  } else if (user.role === "vendor") {
    // Show requests that are unassigned (pending) OR assigned to this vendor
    const list = db.wasteRequests.filter((r: any) => r.status === "pending" || r.vendorId === userId);
    return res.json(list);
  } else {
    // Admin gets everything
    return res.json(db.wasteRequests);
  }
});

app.get("/api/waste/:id", (req, res) => {
  const db = readDb();
  const request = db.wasteRequests.find((r: any) => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: "Request not found" });
  return res.json(request);
});

app.put("/api/waste/:id", (req, res) => {
  const { quantity, weight, wasteDescription, pickupAddress, pickupDate, status } = req.body;
  const db = readDb();
  const index = db.wasteRequests.findIndex((r: any) => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Waste request not found" });

  db.wasteRequests[index] = {
    ...db.wasteRequests[index],
    quantity: quantity !== undefined ? Number(quantity) : db.wasteRequests[index].quantity,
    weight: weight !== undefined ? Number(weight) : db.wasteRequests[index].weight,
    wasteDescription: wasteDescription ?? db.wasteRequests[index].wasteDescription,
    pickupAddress: pickupAddress ?? db.wasteRequests[index].pickupAddress,
    pickupDate: pickupDate ?? db.wasteRequests[index].pickupDate,
    status: status ?? db.wasteRequests[index].status
  };

  writeDb(db);
  return res.json(db.wasteRequests[index]);
});

app.delete("/api/waste/:id", (req, res) => {
  const db = readDb();
  const filterList = db.wasteRequests.filter((r: any) => r.id !== req.params.id);
  
  if (filterList.length === db.wasteRequests.length) {
    return res.status(404).json({ error: "Waste request not found" });
  }

  db.wasteRequests = filterList;
  writeDb(db);
  return res.json({ message: "Request successfully deleted." });
});

// 5. Vendor operations
app.get("/api/vendor/requests", (req, res) => {
  const db = readDb();
  // Filter for pending status
  const list = db.wasteRequests.filter((r: any) => r.status === "pending");
  return res.json(list);
});

app.put("/api/vendor/accept/:id", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized access" });
  const vendorId = authHeader.replace("Bearer simulated-jwt-token-", "").trim();

  const db = readDb();
  const reqIndex = db.wasteRequests.findIndex((r: any) => r.id === req.params.id);
  if (reqIndex === -1) return res.status(404).json({ error: "Request not found" });

  const request = db.wasteRequests[reqIndex];
  if (request.status !== "pending") {
    return res.status(400).json({ error: "Pick-up request is already assigned or closed." });
  }

  const vendorUser = db.users.find((u: any) => u.id === vendorId);
  if (!vendorUser) return res.status(404).json({ error: "Vendor profile not found" });

  request.vendorId = vendorId;
  request.vendorBusinessName = vendorUser.fullName;
  request.status = "accepted";

  // Create notifications
  db.notifications.push({
    id: `notif-${Date.now()}-cust`,
    userId: request.userId,
    message: `Your waste pickup has been accepted by ${vendorUser.fullName}! Direct contact: ${vendorUser.phone}. Scheduled on ${request.pickupDate}.`,
    type: "info",
    read: false,
    createdDate: new Date().toISOString()
  });

  writeDb(db);
  return res.json(request);
});

app.put("/api/vendor/reject/:id", (req, res) => {
  const db = readDb();
  const reqIndex = db.wasteRequests.findIndex((r: any) => r.id === req.params.id);
  if (reqIndex === -1) return res.status(404).json({ error: "Request not found" });

  const request = db.wasteRequests[reqIndex];
  request.status = "pending";
  delete request.vendorId;
  delete request.vendorBusinessName;

  writeDb(db);
  return res.json(request);
});

app.put("/api/vendor/complete/:id", (req, res) => {
  const db = readDb();
  const reqIndex = db.wasteRequests.findIndex((r: any) => r.id === req.params.id);
  if (reqIndex === -1) return res.status(404).json({ error: "Request not found" });

  const request = db.wasteRequests[reqIndex];
  if (request.status !== "accepted") {
    return res.status(400).json({ error: "Request is not accepted yet. Accepting is needed before completing." });
  }

  // Finalize stats updates: credit Customer payout, award rewardPoints. Charge/pay Vendor
  const customerId = request.userId;
  const customer = db.users.find((u: any) => u.id === customerId);
  const vendor = db.users.find((u: any) => u.id === request.vendorId);

  request.status = "completed";

  if (customer) {
    customer.walletBalance = Number((customer.walletBalance + request.estimatedPayout).toFixed(2));
    customer.rewardPoints += request.pointsAwarded;

    // Create deposit/payout transaction
    db.transactions.push({
      id: `tx-${Date.now()}-pay`,
      userId: customerId,
      amount: request.estimatedPayout,
      type: "payout",
      status: "completed",
      reference: `ECO-${request.id}`,
      description: `Payout earnings for recycling ${request.weight}kg of ${request.category}`,
      createdDate: new Date().toISOString()
    });

    db.notifications.push({
      id: `notif-${Date.now()}-comp`,
      userId: customerId,
      message: `Completed recycling! Earned $${request.estimatedPayout} and +${request.pointsAwarded} EcoPoints in wallet.`,
      type: "success",
      read: false,
      createdDate: new Date().toISOString()
    });
  }

  if (vendor) {
    // Simulate vendor earning a 15% commission over raw waste processing
    const commission = Number((request.estimatedPayout * 0.15).toFixed(2));
    vendor.walletBalance = Number((vendor.walletBalance + commission).toFixed(2));
  }

  writeDb(db);
  return res.json(request);
});

// 6. Admin operations
app.get("/api/admin/dashboard", (req, res) => {
  const db = readDb();
  const totalUsers = db.users.length;
  const totalVendors = db.vendors.length;
  const totalTransactions = db.transactions.length;
  
  const completedRequests = db.wasteRequests.filter((r: any) => r.status === "completed");
  const totalWasteCollected = completedRequests.reduce((acc: number, r: any) => acc + (r.weight || 0), 0);

  // Group waste by category
  const categoriesGroup = completedRequests.reduce((acc: Record<string, number>, r: any) => {
    acc[r.category] = (acc[r.category] || 0) + (r.weight || 0);
    return acc;
  }, {});

  const dynamicChartData = [
    { name: "Plastic", weight: categoriesGroup["Plastic"] || 14.5 },
    { name: "Paper", weight: categoriesGroup["Paper"] || 28.2 },
    { name: "Glass", weight: categoriesGroup["Glass"] || 8.4 },
    { name: "Metal", weight: categoriesGroup["Metal"] || 45.0 },
    { name: "E-Waste", weight: categoriesGroup["E-Waste"] || 12.5 },
    { name: "Organic Waste", weight: categoriesGroup["Organic Waste"] || 22.1 }
  ];

  return res.json({
    metrics: {
      totalUsers,
      totalVendors,
      totalTransactions,
      totalWasteCollected: Number(totalWasteCollected.toFixed(1))
    },
    chartData: dynamicChartData,
    recentRequests: db.wasteRequests.slice(-4)
  });
});

app.get("/api/admin/users", (req, res) => {
  const db = readDb();
  return res.json(db.users);
});

app.get("/api/admin/vendors", (req, res) => {
  const db = readDb();
  return res.json(db.vendors);
});

app.get("/api/admin/transactions", (req, res) => {
  const db = readDb();
  return res.json(db.transactions);
});

// 7. Wallet & Payments features (Simulated Razorpay & Withdrawals)
app.post("/api/wallet/deposit", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized access" });
  const userId = authHeader.replace("Bearer simulated-jwt-token-", "").trim();

  const { amount } = req.body;
  if (!amount || Number(amount) <= 0) return res.status(400).json({ error: "Invalid deposit amount" });

  const db = readDb();
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  // Simulate Razorpay success payment order
  const depositAmt = Number(amount);
  user.walletBalance = Number((user.walletBalance + depositAmt).toFixed(2));

  const newTx = {
    id: `tx-${Date.now()}-dep`,
    userId,
    amount: depositAmt,
    type: "deposit" as const,
    status: "completed" as const,
    reference: `RZPAY-${Date.now()}`,
    description: `Wallet Deposit via Razorpay`,
    createdDate: new Date().toISOString()
  };

  db.transactions.push(newTx);
  db.notifications.push({
    id: `notif-${Date.now()}-dep`,
    userId,
    message: `Deposited $${depositAmt} from Razorpay wallet successfully.`,
    type: "success",
    read: false,
    createdDate: new Date().toISOString()
  });

  writeDb(db);
  return res.json({ user, transaction: newTx });
});

app.post("/api/wallet/withdraw", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized access" });
  const userId = authHeader.replace("Bearer simulated-jwt-token-", "").trim();

  const { amount, method } = req.body;
  if (!amount || Number(amount) <= 0) return res.status(400).json({ error: "Invalid withdrawal amount" });

  const db = readDb();
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const withdrawAmt = Number(amount);
  if (user.walletBalance < withdrawAmt) {
    return res.status(400).json({ error: "Insufficient wallet balance." });
  }

  user.walletBalance = Number((user.walletBalance - withdrawAmt).toFixed(2));

  const newTx = {
    id: `tx-${Date.now()}-wtd`,
    userId,
    amount: withdrawAmt,
    type: "withdrawal" as const,
    status: "completed" as const,
    reference: `WITHDRAW-${Date.now()}`,
    description: `Payout withdrawal via ${method || "Bank Transfer"}`,
    createdDate: new Date().toISOString()
  };

  db.transactions.push(newTx);
  db.notifications.push({
    id: `notif-${Date.now()}-wtd`,
    userId,
    message: `Withdrew $${withdrawAmt} successfully. Payout is in-transit.`,
    type: "success",
    read: false,
    createdDate: new Date().toISOString()
  });

  writeDb(db);
  return res.json({ user, transaction: newTx });
});

// Reward coupons redemption
app.post("/api/rewards/redeem", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized access" });
  const userId = authHeader.replace("Bearer simulated-jwt-token-", "").trim();

  const { rewardId } = req.body;
  const db = readDb();
  const user = db.users.find((u: any) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  // Mock list of coupons
  const coupons: Record<string, { title: string; cost: number; coupon: string }> = {
    "cou-1": { title: "$5 Amazon Gift Card", cost: 200, coupon: "AMZN-ECO-5" },
    "cou-2": { title: "$10 Target Eco-Coupon", cost: 350, coupon: "TGT-GREEN-10" },
    "cou-3": { title: "Free Starbucks Reusable Cup", cost: 500, coupon: "SBUX-MUG-GREEN" }
  };

  const selected = coupons[rewardId];
  if (!selected) return res.status(404).json({ error: "Selected reward not found." });

  if (user.rewardPoints < selected.cost) {
    return res.status(400).json({ error: "Insufficient eco-points balance." });
  }

  user.rewardPoints -= selected.cost;

  const newTx = {
    id: `tx-${Date.now()}-rew`,
    userId,
    amount: selected.cost,
    type: "reward_redemption" as const,
    status: "completed" as const,
    reference: `REDEEM-${selected.coupon}`,
    description: `Redeemed points for ${selected.title}`,
    createdDate: new Date().toISOString()
  };

  db.transactions.push(newTx);
  db.notifications.push({
    id: `notif-${Date.now()}-rew`,
    userId,
    message: `Redeemed ${selected.title}! Coupon: ${selected.coupon}`,
    type: "success",
    read: false,
    createdDate: new Date().toISOString()
  });

  writeDb(db);
  return res.json({ user, couponCode: selected.coupon, message: `Successfully redeemed! Coupon Code is ${selected.coupon}` });
});

// Fetch notifications
app.get("/api/notifications", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized access" });
  const userId = authHeader.replace("Bearer simulated-jwt-token-", "").trim();

  const db = readDb();
  const list = db.notifications.filter((n: any) => n.userId === userId).reverse();
  return res.json(list);
});

app.put("/api/notifications/read", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized access" });
  const userId = authHeader.replace("Bearer simulated-jwt-token-", "").trim();

  const db = readDb();
  db.notifications.forEach((n: any) => {
    if (n.userId === userId) n.read = true;
  });

  writeDb(db);
  return res.json({ status: "success" });
});

// Vite middleware configuration for development mode
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[EcoTrade Engine] Full-stack Server successfully loaded on port ${PORT}`);
  });
}

startServer();
