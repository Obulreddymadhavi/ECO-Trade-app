/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "customer" | "vendor" | "admin";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  address?: string;
  walletBalance: number;
  rewardPoints: number;
  createdDate: string;
}

export interface VendorSpecialty {
  businessName: string;
  categories: string[];
  lat: number;
  lng: number;
  rating: number;
  phone?: string;
}

export interface WasteCategory {
  id: string;
  name: string;
  icon: string;
  pricePerKg: number; // in USD or local currency simulation
  pointsPerKg: number;
  description: string;
}

export interface WasteRequest {
  id: string;
  userId: string;
  userFullName: string;
  userPhone: string;
  vendorId?: string;
  vendorBusinessName?: string;
  category: string;
  quantity: number;
  weight: number; // in kg
  wasteDescription: string;
  imageUrl?: string;
  pickupAddress: string;
  pickupDate: string;
  status: "pending" | "accepted" | "completed" | "rejected";
  createdDate: string;
  estimatedPayout: number;
  pointsAwarded: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: "deposit" | "payout" | "withdrawal" | "reward_redemption";
  status: "pending" | "completed" | "failed";
  reference: string;
  description: string;
  createdDate: string;
}

export interface RewardItem {
  id: string;
  title: string;
  pointsCost: number;
  description: string;
  couponCode?: string;
  imageUrl?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  message: string;
  type: "info" | "success" | "alert";
  read: boolean;
  createdDate: string;
}

export interface AIClassificationResult {
  category: string;
  confidence: number;
  estimatedWeight: number;
  estimatedPayout: number;
  pointsAwarded: number;
  matchVendorName?: string;
}
