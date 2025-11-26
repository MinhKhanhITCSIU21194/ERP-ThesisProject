import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const usersRoutes = Router();

// All user routes require authentication
usersRoutes.use(authenticateToken);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics
 * @access  Private
 */
usersRoutes.get("/stats", userController.getUserStats.bind(userController));

/**
 * @route   GET /api/users/role/:roleId
 * @desc    Get users by role
 * @access  Private
 */
usersRoutes.get(
  "/role/:roleId",
  userController.getUsersByRole.bind(userController)
);

/**
 * @route   GET /api/users
 * @desc    Get all users with their roles
 * @access  Private
 */
usersRoutes.get("/", userController.getAllUsers.bind(userController));

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
usersRoutes.get("/:id", userController.getUserById.bind(userController));

/**
 * @route   PATCH /api/users/:id/status
 * @desc    Update user status (activate/deactivate)
 * @body    { isActive: boolean }
 * @access  Private
 */
usersRoutes.patch(
  "/:id/status",
  userController.updateUserStatus.bind(userController)
);

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Update user role
 * @body    { roleId: number }
 * @access  Private
 */
usersRoutes.patch(
  "/:id/role",
  userController.updateUserRole.bind(userController)
);

export default usersRoutes;
