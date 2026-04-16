import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import User, { IUser } from "../models/User";

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Middleware: Verify JWT access token and attach user to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Access denied. No token provided." });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; role: string };

    const user = await User.findById(decoded.userId).select("-passwordHash");
    if (!user) {
      res.status(401).json({ message: "Invalid token. User not found." });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

/**
 * Middleware: Restrict access by user role(s)
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "Access denied. Insufficient permissions." });
      return;
    }

    next();
  };
};
