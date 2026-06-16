/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from "express";

export interface ApiError extends Error {
  status?: number;
  details?: any;
}

export class CustomError extends Error implements ApiError {
  status: number;
  details?: any;

  constructor(message: string, status: number = 500, details?: any) {
    super(message);
    this.name = "CustomError";
    this.status = status;
    this.details = details;
  }
}

// Global error handling middleware
export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error:", err);

  const status = (err as ApiError).status || 500;
  const message = err.message || "Internal server error";
  const details = (err as ApiError).details;

  res.status(status).json({
    error: message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

// 404 handler
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method,
  });
}

// Async error wrapper
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
