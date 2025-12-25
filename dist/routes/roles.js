"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const role_controller_1 = __importDefault(require("../controllers/role.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const permission_middleware_1 = require("../middleware/permission.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.get("/permissions", (0, permission_middleware_1.requirePermission)("ROLE_MANAGEMENT", "canView"), role_controller_1.default.getPermissions.bind(role_controller_1.default));
router.get("/stats", (0, permission_middleware_1.requirePermission)("ROLE_MANAGEMENT", "canView"), role_controller_1.default.getStats.bind(role_controller_1.default));
router.get("/", (0, permission_middleware_1.requirePermission)("ROLE_MANAGEMENT", "canView"), role_controller_1.default.getRoles.bind(role_controller_1.default));
router.get("/:id", (0, permission_middleware_1.requirePermission)("ROLE_MANAGEMENT", "canView"), role_controller_1.default.getRoleById.bind(role_controller_1.default));
router.post("/", (0, permission_middleware_1.requirePermission)("ROLE_MANAGEMENT", "canCreate"), role_controller_1.default.createRole.bind(role_controller_1.default));
router.put("/:id", (0, permission_middleware_1.requirePermission)("ROLE_MANAGEMENT", "canUpdate"), role_controller_1.default.updateRole.bind(role_controller_1.default));
router.delete("/:id", (0, permission_middleware_1.requirePermission)("ROLE_MANAGEMENT", "canDelete"), role_controller_1.default.deleteRole.bind(role_controller_1.default));
exports.default = router;
//# sourceMappingURL=roles.js.map