import express, { Request, Response } from "express";
import {
  checkEmailExist,
  emailVerification,
  signIn,
  verifyEmailCode,
  validateSession,
  setNewPassword,
} from "../controllers/auth.controller";
import {
  refreshToken,
  logout,
  logoutFromAllDevices,
  getActiveSessions,
} from "../controllers/auth-additional.controller";
import { authenticateToken, AuthRequest } from "../middleware/auth.middleware";

const authRoutes = express.Router();

// Public authentication routes
authRoutes.post("/check-email", checkEmailExist);
authRoutes.post("/sign-in", signIn);
authRoutes.post("/send-verification", emailVerification);
authRoutes.post("/verify-code", verifyEmailCode);
authRoutes.post("/reset-password", setNewPassword);

// Token management routes
authRoutes.post("/refresh-token", refreshToken);
authRoutes.post("/logout", logout);
authRoutes.post("/logout-all", logoutFromAllDevices);

// Session validation (uses cookies directly, no auth middleware needed)
authRoutes.get("/validate-session", validateSession);

// Protected routes
authRoutes.get("/me", authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    user: req.user,
    message: "Session is valid",
  });
});

authRoutes.get(
  "/profile",
  authenticateToken,
  (req: AuthRequest, res: Response) => {
    res.json({
      success: true,
      user: req.user,
      message: "Authentication successful",
    });
  }
);

authRoutes.get("/sessions/:userId", authenticateToken, getActiveSessions);

export default authRoutes;
