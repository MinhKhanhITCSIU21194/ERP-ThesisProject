import { Router } from "express";
import { ContractController } from "../controllers/contract.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router = Router();
const contractController = new ContractController();

/**
 * @route   GET /api/contracts/statistics
 * @desc    Get contract statistics
 * @access  Private (requires authentication and view permission)
 */
router.get(
  "/statistics",
  authenticateToken,
  requirePermission("CONTRACT_MANAGEMENT", "canView"),
  contractController.getStatistics
);

/**
 * @route   GET /api/contracts/expiring
 * @desc    Get contracts that are expiring soon
 * @access  Private (requires authentication and view permission)
 * @query   days - Number of days threshold (default: 30)
 * @query   contractType - Filter by contract type
 * @query   workingType - Filter by working type
 */
router.get(
  "/expiring",
  authenticateToken,
  requirePermission("CONTRACT_MANAGEMENT", "canView"),
  contractController.getExpiringContracts
);

/**
 * @route   GET /api/contracts/employee/:employeeId
 * @desc    Get all contracts for a specific employee
 * @access  Private (requires authentication and view permission)
 */
router.get(
  "/employee/:employeeId",
  authenticateToken,
  requirePermission("CONTRACT_MANAGEMENT", "canView"),
  contractController.getContractsByEmployeeId
);

/**
 * @route   GET /api/contracts/:id
 * @desc    Get contract by ID
 * @access  Private (requires authentication and view permission)
 */
router.get(
  "/:id",
  authenticateToken,
  requirePermission("CONTRACT_MANAGEMENT", "canView"),
  contractController.getContractById
);

/**
 * @route   GET /api/contracts
 * @desc    Get all contracts with pagination and filtering
 * @access  Private (requires authentication and view permission)
 * @query   pageIndex, pageSize, sortBy, sortOrder, contractType, workingType, status, employeeId
 */
router.get(
  "/",
  authenticateToken,
  requirePermission("CONTRACT_MANAGEMENT", "canView"),
  contractController.getContracts
);

/**
 * @route   POST /api/contracts
 * @desc    Create a new contract
 * @access  Private (requires authentication and create permission)
 */
router.post(
  "/",
  authenticateToken,
  requirePermission("CONTRACT_MANAGEMENT", "canCreate"),
  contractController.createContract
);

/**
 * @route   PUT /api/contracts/:id
 * @desc    Update a contract
 * @access  Private (requires authentication and update permission)
 */
router.put(
  "/:id",
  authenticateToken,
  requirePermission("CONTRACT_MANAGEMENT", "canUpdate"),
  contractController.updateContract
);

/**
 * @route   DELETE /api/contracts/:id
 * @desc    Delete a contract (soft delete)
 * @access  Private (requires authentication and delete permission)
 */
router.delete(
  "/:id",
  authenticateToken,
  requirePermission("CONTRACT_MANAGEMENT", "canDelete"),
  contractController.deleteContract
);

export default router;
