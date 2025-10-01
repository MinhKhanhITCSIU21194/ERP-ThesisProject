import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

const jwt = require("jsonwebtoken");
dotenv.config();

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roleId: number;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access token required",
    });
  }

  const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

  (jwt as any).verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: "Invalid or expired token",
      });
    }

    req.user = decoded as {
      userId: string;
      email: string;
      roleId: number;
    };

    next();
  });
};

export { AuthRequest };
