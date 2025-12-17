"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const position_controller_1 = __importDefault(require("../controllers/position.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const permission_middleware_1 = require("../middleware/permission.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.get("/", (0, permission_middleware_1.requirePermission)("POSITION_MANAGEMENT", "canView"), position_controller_1.default.getAllPositions.bind(position_controller_1.default));
router.get("/hierarchy", (0, permission_middleware_1.requirePermission)("POSITION_MANAGEMENT", "canView"), position_controller_1.default.getPositionHierarchy.bind(position_controller_1.default));
router.get("/by-level/:level", (0, permission_middleware_1.requirePermission)("POSITION_MANAGEMENT", "canView"), position_controller_1.default.getPositionsByLevel.bind(position_controller_1.default));
router.get("/by-salary", (0, permission_middleware_1.requirePermission)("POSITION_MANAGEMENT", "canView"), position_controller_1.default.getPositionsBySalaryRange.bind(position_controller_1.default));
router.get("/:id", (0, permission_middleware_1.requirePermission)("POSITION_MANAGEMENT", "canView"), position_controller_1.default.getPositionById.bind(position_controller_1.default));
router.get("/:id/employees", (0, permission_middleware_1.requirePermission)("POSITION_MANAGEMENT", "canView"), position_controller_1.default.getPositionEmployees.bind(position_controller_1.default));
router.get("/:id/stats", (0, permission_middleware_1.requirePermission)("POSITION_MANAGEMENT", "canView"), position_controller_1.default.getPositionStats.bind(position_controller_1.default));
router.post("/", (0, permission_middleware_1.requirePermission)("POSITION_MANAGEMENT", "canCreate"), position_controller_1.default.createPosition.bind(position_controller_1.default));
router.post("/update-headcounts", (0, permission_middleware_1.requirePermission)("POSITION_MANAGEMENT", "canUpdate"), position_controller_1.default.updateAllHeadcounts.bind(position_controller_1.default));
router.put("/:id", (0, permission_middleware_1.requirePermission)("POSITION_MANAGEMENT", "canUpdate"), position_controller_1.default.updatePosition.bind(position_controller_1.default));
router.delete("/:id", (0, permission_middleware_1.requirePermission)("POSITION_MANAGEMENT", "canDelete"), position_controller_1.default.deletePosition.bind(position_controller_1.default));
router.delete("/:id/hard", (0, permission_middleware_1.requirePermission)("POSITION_MANAGEMENT", "canDelete"), position_controller_1.default.hardDeletePosition.bind(position_controller_1.default));
exports.default = router;
//# sourceMappingURL=positions.js.map