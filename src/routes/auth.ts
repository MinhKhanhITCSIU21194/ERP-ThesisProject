import express, { Request, Response } from "express";
import {
  checkEmailExist,
  emailVerification,
  signIn,
  verifyEmailCode,
} from "../controllers/auth.controller";
import { authenticateToken, AuthRequest } from "../middleware/auth.middleware";

const authRoutes = express.Router();

authRoutes.post("/check-email", checkEmailExist);
authRoutes.post("/sign-in", signIn);
authRoutes.post("/send-verification", emailVerification);
authRoutes.post("/verify-code", verifyEmailCode);

// Protected route to test authentication
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

export default authRoutes;
