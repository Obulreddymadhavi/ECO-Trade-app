/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from "express";
import { getDatabase } from "../utils/database.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Basic authentication middleware
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Try to get from query or body (for development)
      const userId = (req.query.userId || req.body?.userId) as string;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const db = getDatabase();
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      return next();
    }

    // For now, we'll use a simple token format: "Bearer <userId>"
    // In production, use JWT tokens
    const token = authHeader.substring(7);
    const [userId] = token.split(":");

    const db = getDatabase();
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
}

// Role-based access control middleware
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Access denied",
        requiredRoles: roles,
        userRole: req.user.role,
      });
    }

    next();
  };
}

// Optional authentication middleware
export function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    const userId = (req.query.userId || req.body?.userId) as string;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const [tokenUserId] = token.split(":");

      const db = getDatabase();
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(tokenUserId);

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
    } else if (userId) {
      const db = getDatabase();
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
    }

    next();
  } catch (error) {
    console.error("Optional auth error:", error);
    next();
  }
}
