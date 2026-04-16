import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import config from "../config";
import { AuthRequest } from "../middlewares/auth";

/**
 * Generate JWT access token
 */
const generateAccessToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  });
};

/**
 * POST /api/auth/register
 * Register a new user (customer or driver)
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, role, licenseNumber } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone) {
      res.status(400).json({ message: "Name, email, password, and phone are required." });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "An account with this email already exists." });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      phone,
      role: role || "customer",
      licenseNumber: role === "driver" ? licenseNumber : undefined,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    res.status(201).json({
      message: "Registration successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

/**
 * POST /api/auth/login
 * Login with email and password
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    res.status(200).json({
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

/**
 * POST /api/auth/refresh
 * Refresh access token using a valid refresh token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({ message: "Refresh token is required." });
      return;
    }

    const decoded = jwt.verify(token, config.jwtRefreshSecret) as { userId: string };

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: "Invalid refresh token." });
      return;
    }

    const newAccessToken = generateAccessToken(user._id.toString(), user.role);

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired refresh token." });
  }
};

/**
 * GET /api/auth/me
 * Get currently authenticated user's profile
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};
