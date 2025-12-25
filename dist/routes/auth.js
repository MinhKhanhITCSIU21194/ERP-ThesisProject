"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_additional_controller_1 = require("../controllers/auth-additional.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const authRoutes = express_1.default.Router();
authRoutes.post("/check-email", auth_controller_1.checkEmailExist);
authRoutes.post("/sign-in", auth_controller_1.signIn);
authRoutes.post("/send-verification", auth_controller_1.emailVerification);
authRoutes.post("/verify-code", auth_controller_1.verifyEmailCode);
authRoutes.post("/reset-password", auth_controller_1.setNewPassword);
authRoutes.post("/refresh-token", auth_additional_controller_1.refreshToken);
authRoutes.post("/logout", auth_additional_controller_1.logout);
authRoutes.post("/logout-all", auth_additional_controller_1.logoutFromAllDevices);
authRoutes.get("/validate-session", auth_controller_1.validateSession);
authRoutes.get("/me", auth_middleware_1.authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: req.user,
        message: "Session is valid",
    });
});
authRoutes.get("/profile", auth_middleware_1.authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: req.user,
        message: "Authentication successful",
    });
});
authRoutes.get("/sessions/:userId", auth_middleware_1.authenticateToken, auth_additional_controller_1.getActiveSessions);
exports.default = authRoutes;
//# sourceMappingURL=auth.js.map