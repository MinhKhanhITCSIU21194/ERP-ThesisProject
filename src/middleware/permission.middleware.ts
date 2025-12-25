import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

/**
 * Middleware to check if user has specific permission
 * @param resource - The resource name (e.g., 'EMPLOYEE_MANAGEMENT', 'USER_MANAGEMENT')
 * @param action - The action to check (e.g., 'canView', 'canCreate', 'canUpdate', 'canDelete')
 */
export const requirePermission = (resource: string, action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
          message: "Authentication required",
        });
      }

      const { role } = req.user;

      // Check if role has permissions loaded
      if (!role || !role.rolePermissions) {
        return res.status(403).json({
          success: false,
          error: "Forbidden",
          message: "Role permissions not configured",
        });
      }

      // Find the permission for the resource
      const rolePermission = role.rolePermissions.find(
        (rp) => rp.permission?.permission === resource
      );

      if (!rolePermission) {
        return res.status(403).json({
          success: false,
          error: "Forbidden",
          message: `No permission configured for ${resource}`,
        });
      }

      // Check if the user has the required action permission
      const hasPermission =
        rolePermission[action as keyof typeof rolePermission];

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: "Forbidden",
          message: `You do not have permission to ${action
            .replace("can", "")
            .toLowerCase()} ${resource.toLowerCase().replace("_", " ")}`,
        });
      }

      // User has permission, proceed
      next();
    } catch (error) {
      console.error("Permission middleware error:", error);
      return res.status(500).json({
        success: false,
        error: "Authorization error",
        message: "Internal server error during authorization",
      });
    }
  };
};

/**
 * Middleware to check if user has any of the specified permissions
 * @param resource - The resource name
 * @param actions - Array of actions to check (OR logic - user needs at least one)
 */
export const requireAnyPermission = (resource: string, actions: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
          message: "Authentication required",
        });
      }

      const { role } = req.user;

      if (!role || !role.rolePermissions) {
        return res.status(403).json({
          success: false,
          error: "Forbidden",
          message: "Role permissions not configured",
        });
      }

      const rolePermission = role.rolePermissions.find(
        (rp) => rp.permission?.permission === resource
      );

      if (!rolePermission) {
        return res.status(403).json({
          success: false,
          error: "Forbidden",
          message: `No permission configured for ${resource}`,
        });
      }

      // Check if user has at least one of the required permissions
      const hasAnyPermission = actions.some(
        (action) => rolePermission[action as keyof typeof rolePermission]
      );

      if (!hasAnyPermission) {
        return res.status(403).json({
          success: false,
          error: "Forbidden",
          message: `You do not have sufficient permissions for ${resource
            .toLowerCase()
            .replace("_", " ")}`,
        });
      }

      next();
    } catch (error) {
      console.error("Permission middleware error:", error);
      return res.status(500).json({
        success: false,
        error: "Authorization error",
        message: "Internal server error during authorization",
      });
    }
  };
};

/**
 * Middleware to check if user has all of the specified permissions
 * @param resource - The resource name
 * @param actions - Array of actions to check (AND logic - user needs all)
 */
export const requireAllPermissions = (resource: string, actions: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
          message: "Authentication required",
        });
      }

      const { role } = req.user;

      if (!role || !role.rolePermissions) {
        return res.status(403).json({
          success: false,
          error: "Forbidden",
          message: "Role permissions not configured",
        });
      }

      const rolePermission = role.rolePermissions.find(
        (rp) => rp.permission?.permission === resource
      );

      if (!rolePermission) {
        return res.status(403).json({
          success: false,
          error: "Forbidden",
          message: `No permission configured for ${resource}`,
        });
      }

      // Check if user has all of the required permissions
      const hasAllPermissions = actions.every(
        (action) => rolePermission[action as keyof typeof rolePermission]
      );

      if (!hasAllPermissions) {
        return res.status(403).json({
          success: false,
          error: "Forbidden",
          message: `You do not have all required permissions for ${resource
            .toLowerCase()
            .replace("_", " ")}`,
        });
      }

      next();
    } catch (error) {
      console.error("Permission middleware error:", error);
      return res.status(500).json({
        success: false,
        error: "Authorization error",
        message: "Internal server error during authorization",
      });
    }
  };
};

/**
 * Middleware to check if user is an admin
 * Admins typically have full access to all resources
 */
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    const { role } = req.user;

    if (!role || role.name !== "Admin") {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    console.error("Admin check middleware error:", error);
    return res.status(500).json({
      success: false,
      error: "Authorization error",
      message: "Internal server error during authorization",
    });
  }
};
