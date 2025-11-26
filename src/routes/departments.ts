import { Router } from "express";
import departmentController from "../controllers/department.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router = Router();

// Apply authentication to all department routes
router.use(authenticateToken);

// GET routes
router.get(
  "/",
  departmentController.getAllDepartments.bind(departmentController)
);

router.get(
  "/hierarchy",
  requirePermission("DEPARTMENT_MANAGEMENT", "canView"),
  departmentController.getDepartmentHierarchy.bind(departmentController)
);

router.get(
  "/:id",
  requirePermission("DEPARTMENT_MANAGEMENT", "canView"),
  departmentController.getDepartmentById.bind(departmentController)
);

router.get(
  "/:id/employees",
  requirePermission("DEPARTMENT_MANAGEMENT", "canView"),
  departmentController.getDepartmentEmployees.bind(departmentController)
);

router.get(
  "/:id/stats",
  requirePermission("DEPARTMENT_MANAGEMENT", "canView"),
  departmentController.getDepartmentStats.bind(departmentController)
);

// POST routes
router.post(
  "/",
  requirePermission("DEPARTMENT_MANAGEMENT", "canCreate"),
  departmentController.createDepartment.bind(departmentController)
);

router.post(
  "/move-employees",
  requirePermission("DEPARTMENT_MANAGEMENT", "canUpdate"),
  departmentController.moveEmployees.bind(departmentController)
);

// PUT routes
router.put(
  "/:id",
  requirePermission("DEPARTMENT_MANAGEMENT", "canUpdate"),
  departmentController.updateDepartment.bind(departmentController)
);

// DELETE routes
router.delete(
  "/:id",
  requirePermission("DEPARTMENT_MANAGEMENT", "canDelete"),
  departmentController.deleteDepartment.bind(departmentController)
);

router.delete(
  "/:id/hard",
  requirePermission("DEPARTMENT_MANAGEMENT", "canDelete"),
  departmentController.hardDeleteDepartment.bind(departmentController)
);

export default router;
