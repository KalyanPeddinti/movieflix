import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required but not set.");
}

export interface AuthRequest extends Request {
  userId?: number;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET!) as jwt.JwtPayload;
    const userId = parseInt(String(payload.sub), 10);
    if (isNaN(userId)) throw new Error("Invalid sub claim");
    req.userId = userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
