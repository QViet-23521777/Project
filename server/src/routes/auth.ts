import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";

// In-memory user store (demo purposes)
// In production, this would be in the database
const users = new Map<string, { id: string; username: string; password: string; role: string; employeeId?: string; fullName: string }>([
  ["admin", { id: "1", username: "admin", password: "admin123", role: "admin", fullName: "Quản trị viên" }],
  ["hr", { id: "2", username: "hr", password: "hr123", role: "hr", fullName: "Nhân sự" }],
]);

// JWT secret - in production use environment variable
const JWT_SECRET = process.env.JWT_SECRET || "se113-secret-key-change-in-production";

function generateToken(payload: object): string {
  // Simple base64 encoding (demo only - use proper JWT in production)
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

function verifyToken(token: string): { id: string; username: string; role: string; employeeId?: string; fullName: string } | null {
  try {
    return JSON.parse(Buffer.from(token, "base64").toString());
  } catch {
    return null;
  }
}

export const authRouter = Router();

// Login
authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const user = users.get(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
      employeeId: user.employeeId,
      fullName: user.fullName,
    });

    res.json({
      user: {
        _id: user.id,
        username: user.username,
        role: user.role as "admin" | "hr" | "employee",
        employeeId: user.employeeId,
        fullName: user.fullName,
      },
      token,
    });
  }),
);

// Logout
authRouter.post(
  "/logout",
  asyncHandler(async (_req, res) => {
    // In a real app, you'd invalidate the token/session
    res.json({ ok: true });
  }),
);

// Get current user
authRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({ error: "Invalid token" });
    }

    res.json({
      user: {
        _id: payload.id,
        username: payload.username,
        role: payload.role,
        employeeId: payload.employeeId,
        fullName: payload.fullName,
      },
    });
  }),
);