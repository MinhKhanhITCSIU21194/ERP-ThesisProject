import { Router } from "express";
import { EmployeeSetupController } from "../controllers/employee-setup.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();
const controller = new EmployeeSetupController();

// Public routes (no authentication required)
router.get("/validate/:token", controller.validateSetupToken.bind(controller));

router.post("/set-password", controller.setPassword.bind(controller));

// Protected routes (requires authentication)
router.put(
  "/complete",
  authenticateToken,
  controller.completeSetup.bind(controller)
);

export default router;
