import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const usersRoutes = Router();

/**
 * Public routes (no authentication required)
 */

/**
 * @route   GET /api/users/setup/validate/:token
 * @desc    Validate user setup token
 * @access  Public
 */
usersRoutes.get(
  "/setup/validate/:token",
  userController.validateSetupToken.bind(userController)
);

/**
 * @route   POST /api/users/setup/complete
 * @desc    Complete user setup with new password
 * @access  Public
 */
usersRoutes.post(
  "/setup/complete",
  userController.completeUserSetup.bind(userController)
);

// All other user routes require authentication
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
 * @route   POST /api/users
 * @desc    Create a new user (auto-generates password and sends setup email)
 * @body    { firstName, lastName, email, username?, roleId, employeeCode? }
 * @access  Private
 */
usersRoutes.post("/", userController.createUser.bind(userController));

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
usersRoutes.get("/:id", userController.getUserById.bind(userController));

/**
 * @route   PUT /api/users/:id
 * @desc    Update user information
 * @body    { firstName?, lastName?, username?, roleId?, employeeCode?, isEmailVerified?, isActive? }
 * @access  Private
 */
usersRoutes.put("/:id", userController.updateUser.bind(userController));

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

/**
 * @route   POST /api/users/:id/resend-setup
 * @desc    Resend setup email to user
 * @access  Private
 */
usersRoutes.post(
  "/:id/resend-setup",
  userController.resendSetupEmail.bind(userController)
);

export default usersRoutes;
