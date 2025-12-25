import { Router } from "express";
import roleController from "../controllers/role.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router = Router();

// Apply authentication to all role routes
router.use(authenticateToken);

/**
 * @route   GET /api/roles/permissions
 * @desc    Get all available permissions
 * @access  Private
 */
router.get(
  "/permissions",
  requirePermission("ROLE_MANAGEMENT", "canView"),
  roleController.getPermissions.bind(roleController)
);

/**
 * @route   GET /api/roles/stats
 * @desc    Get role statistics
 * @access  Private
 */
router.get(
  "/stats",
  requirePermission("ROLE_MANAGEMENT", "canView"),
  roleController.getStats.bind(roleController)
);

/**
 * @route   GET /api/roles
 * @desc    Get all roles with pagination
 * @access  Private
 */
router.get(
  "/",
  requirePermission("ROLE_MANAGEMENT", "canView"),
  roleController.getRoles.bind(roleController)
);

/**
 * @route   GET /api/roles/:id
 * @desc    Get role by ID
 * @access  Private
 */
router.get(
  "/:id",
  requirePermission("ROLE_MANAGEMENT", "canView"),
  roleController.getRoleById.bind(roleController)
);

/**
 * @route   POST /api/roles
 * @desc    Create a new role
 * @access  Private
 */
router.post(
  "/",
  requirePermission("ROLE_MANAGEMENT", "canCreate"),
  roleController.createRole.bind(roleController)
);

/**
 * @route   PUT /api/roles/:id
 * @desc    Update a role
 * @access  Private
 */
router.put(
  "/:id",
  requirePermission("ROLE_MANAGEMENT", "canUpdate"),
  roleController.updateRole.bind(roleController)
);

/**
 * @route   DELETE /api/roles/:id
 * @desc    Delete a role
 * @access  Private
 */
router.delete(
  "/:id",
  requirePermission("ROLE_MANAGEMENT", "canDelete"),
  roleController.deleteRole.bind(roleController)
);

export default router;
