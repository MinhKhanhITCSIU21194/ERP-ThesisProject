import { Router } from "express";
import positionController from "../controllers/position.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router = Router();

// Apply authentication to all position routes
router.use(authenticateToken);

// GET routes
router.get("/", positionController.getAllPositions.bind(positionController));

router.get(
  "/hierarchy",
  requirePermission("POSITION_MANAGEMENT", "canView"),
  positionController.getPositionHierarchy.bind(positionController)
);

router.get(
  "/by-level/:level",
  requirePermission("POSITION_MANAGEMENT", "canView"),
  positionController.getPositionsByLevel.bind(positionController)
);

router.get(
  "/by-salary",
  requirePermission("POSITION_MANAGEMENT", "canView"),
  positionController.getPositionsBySalaryRange.bind(positionController)
);

router.get(
  "/:id",
  requirePermission("POSITION_MANAGEMENT", "canView"),
  positionController.getPositionById.bind(positionController)
);

router.get(
  "/:id/employees",
  requirePermission("POSITION_MANAGEMENT", "canView"),
  positionController.getPositionEmployees.bind(positionController)
);

router.get(
  "/:id/stats",
  requirePermission("POSITION_MANAGEMENT", "canView"),
  positionController.getPositionStats.bind(positionController)
);

// POST routes
router.post(
  "/",
  requirePermission("POSITION_MANAGEMENT", "canCreate"),
  positionController.createPosition.bind(positionController)
);

router.post(
  "/update-headcounts",
  requirePermission("POSITION_MANAGEMENT", "canUpdate"),
  positionController.updateAllHeadcounts.bind(positionController)
);

// PUT routes
router.put(
  "/:id",
  requirePermission("POSITION_MANAGEMENT", "canUpdate"),
  positionController.updatePosition.bind(positionController)
);

// DELETE routes
router.delete(
  "/:id",
  requirePermission("POSITION_MANAGEMENT", "canDelete"),
  positionController.deletePosition.bind(positionController)
);

router.delete(
  "/:id/hard",
  requirePermission("POSITION_MANAGEMENT", "canDelete"),
  positionController.hardDeletePosition.bind(positionController)
);

export default router;
