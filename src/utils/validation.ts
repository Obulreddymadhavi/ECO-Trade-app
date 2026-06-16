/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 number
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone);
}

export function validateWasteRequest(data: any): ValidationResult {
  const errors: { [key: string]: string } = {};

  if (!data.userId || typeof data.userId !== "string") {
    errors.userId = "Valid user ID is required";
  }

  if (!data.category || typeof data.category !== "string") {
    errors.category = "Category is required";
  }

  if (!data.weight || typeof data.weight !== "number" || data.weight <= 0) {
    errors.weight = "Valid weight is required";
  }

  if (!data.pickupAddress || typeof data.pickupAddress !== "string") {
    errors.pickupAddress = "Pickup address is required";
  }

  if (!data.pickupDate || typeof data.pickupDate !== "string") {
    errors.pickupDate = "Pickup date is required";
  } else if (new Date(data.pickupDate) < new Date()) {
    errors.pickupDate = "Pickup date must be in the future";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateUser(data: any): ValidationResult {
  const errors: { [key: string]: string } = {};

  if (!data.email || !validateEmail(data.email)) {
    errors.email = "Valid email is required";
  }

  if (!data.password || !validatePassword(data.password)) {
    errors.password =
      "Password must be at least 8 characters with uppercase and number";
  }

  if (!data.fullName || typeof data.fullName !== "string" || data.fullName.length < 3) {
    errors.fullName = "Full name is required (at least 3 characters)";
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = "Valid phone number is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateTransaction(data: any): ValidationResult {
  const errors: { [key: string]: string } = {};

  if (!data.userId || typeof data.userId !== "string") {
    errors.userId = "Valid user ID is required";
  }

  if (!data.amount || typeof data.amount !== "number" || data.amount <= 0) {
    errors.amount = "Valid amount is required";
  }

  if (
    !data.type ||
    !["deposit", "payout", "withdrawal", "reward_redemption"].includes(data.type)
  ) {
    errors.type = "Valid transaction type is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
