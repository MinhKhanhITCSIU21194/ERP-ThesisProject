"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const department_controller_1 = __importDefault(require("../controllers/department.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const permission_middleware_1 = require("../middleware/permission.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.get("/", department_controller_1.default.getAllDepartments.bind(department_controller_1.default));
router.get("/hierarchy", (0, permission_middleware_1.requirePermission)("DEPARTMENT_MANAGEMENT", "canView"), department_controller_1.default.getDepartmentHierarchy.bind(department_controller_1.default));
router.get("/:id", (0, permission_middleware_1.requirePermission)("DEPARTMENT_MANAGEMENT", "canView"), department_controller_1.default.getDepartmentById.bind(department_controller_1.default));
router.get("/:id/employees", (0, permission_middleware_1.requirePermission)("DEPARTMENT_MANAGEMENT", "canView"), department_controller_1.default.getDepartmentEmployees.bind(department_controller_1.default));
router.get("/:id/stats", (0, permission_middleware_1.requirePermission)("DEPARTMENT_MANAGEMENT", "canView"), department_controller_1.default.getDepartmentStats.bind(department_controller_1.default));
router.post("/", (0, permission_middleware_1.requirePermission)("DEPARTMENT_MANAGEMENT", "canCreate"), department_controller_1.default.createDepartment.bind(department_controller_1.default));
router.post("/move-employees", (0, permission_middleware_1.requirePermission)("DEPARTMENT_MANAGEMENT", "canUpdate"), department_controller_1.default.moveEmployees.bind(department_controller_1.default));
router.put("/:id", (0, permission_middleware_1.requirePermission)("DEPARTMENT_MANAGEMENT", "canUpdate"), department_controller_1.default.updateDepartment.bind(department_controller_1.default));
router.delete("/:id", (0, permission_middleware_1.requirePermission)("DEPARTMENT_MANAGEMENT", "canDelete"), department_controller_1.default.deleteDepartment.bind(department_controller_1.default));
router.delete("/:id/hard", (0, permission_middleware_1.requirePermission)("DEPARTMENT_MANAGEMENT", "canDelete"), department_controller_1.default.hardDeleteDepartment.bind(department_controller_1.default));
exports.default = router;
//# sourceMappingURL=departments.js.map