/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from "express";

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const log = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    };

    console.log(JSON.stringify(log));
  });

  next();
}

export function debugLogger(req: Request, res: Response, next: NextFunction) {
  console.log(`${req.method} ${req.path}`, {
    query: req.query,
    body: req.body,
  });
  next();
}
