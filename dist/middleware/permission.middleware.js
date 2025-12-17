"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireAllPermissions = exports.requireAnyPermission = exports.requirePermission = void 0;
const requirePermission = (resource, action) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: "Unauthorized",
                    message: "Authentication required",
                });
            }
            const { role } = req.user;
            if (!role || !role.permissions) {
                return res.status(403).json({
                    success: false,
                    error: "Forbidden",
                    message: "Role permissions not configured",
                });
            }
            const permission = role.permissions.find((p) => p.permission === resource);
            if (!permission) {
                return res.status(403).json({
                    success: false,
                    error: "Forbidden",
                    message: `No permission configured for ${resource}`,
                });
            }
            const hasPermission = permission[action];
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: "Forbidden",
                    message: `You do not have permission to ${action
                        .replace("can", "")
                        .toLowerCase()} ${resource.toLowerCase().replace("_", " ")}`,
                });
            }
            next();
        }
        catch (error) {
            console.error("Permission middleware error:", error);
            return res.status(500).json({
                success: false,
                error: "Authorization error",
                message: "Internal server error during authorization",
            });
        }
    };
};
exports.requirePermission = requirePermission;
const requireAnyPermission = (resource, actions) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: "Unauthorized",
                    message: "Authentication required",
                });
            }
            const { role } = req.user;
            if (!role || !role.permissions) {
                return res.status(403).json({
                    success: false,
                    error: "Forbidden",
                    message: "Role permissions not configured",
                });
            }
            const permission = role.permissions.find((p) => p.permission === resource);
            if (!permission) {
                return res.status(403).json({
                    success: false,
                    error: "Forbidden",
                    message: `No permission configured for ${resource}`,
                });
            }
            const hasAnyPermission = actions.some((action) => permission[action]);
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
        }
        catch (error) {
            console.error("Permission middleware error:", error);
            return res.status(500).json({
                success: false,
                error: "Authorization error",
                message: "Internal server error during authorization",
            });
        }
    };
};
exports.requireAnyPermission = requireAnyPermission;
const requireAllPermissions = (resource, actions) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: "Unauthorized",
                    message: "Authentication required",
                });
            }
            const { role } = req.user;
            if (!role || !role.permissions) {
                return res.status(403).json({
                    success: false,
                    error: "Forbidden",
                    message: "Role permissions not configured",
                });
            }
            const permission = role.permissions.find((p) => p.permission === resource);
            if (!permission) {
                return res.status(403).json({
                    success: false,
                    error: "Forbidden",
                    message: `No permission configured for ${resource}`,
                });
            }
            const hasAllPermissions = actions.every((action) => permission[action]);
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
        }
        catch (error) {
            console.error("Permission middleware error:", error);
            return res.status(500).json({
                success: false,
                error: "Authorization error",
                message: "Internal server error during authorization",
            });
        }
    };
};
exports.requireAllPermissions = requireAllPermissions;
const requireAdmin = async (req, res, next) => {
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
    }
    catch (error) {
        console.error("Admin check middleware error:", error);
        return res.status(500).json({
            success: false,
            error: "Authorization error",
            message: "Internal server error during authorization",
        });
    }
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=permission.middleware.js.map