import { Router } from "express";
import { EmployeeController } from "../controllers/employee.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router = Router();
const employeeController = new EmployeeController();

/**
 * @route   GET /api/employees/statistics
 * @desc    Get employee statistics
 * @access  Private (requires authentication and view permission)
 */
router.get(
  "/statistics",
  authenticateToken,
  requirePermission("EMPLOYEE_MANAGEMENT", "canView"),
  employeeController.getStatistics
);

/**
 * @route   GET /api/employees/expiring-contracts
 * @desc    Get employees with expiring contracts
 * @access  Private (requires authentication and view permission)
 * @query   days - Number of days threshold (default: 30)
 */
router.get(
  "/expiring-contracts",
  authenticateToken,
  requirePermission("EMPLOYEE_MANAGEMENT", "canView"),
  employeeController.getExpiringContracts
);

/**
 * @route   GET /api/employees/code/:code
 * @desc    Get employee by employee code
 * @access  Private (requires authentication and view permission)
 */
router.get(
  "/code/:code",
  authenticateToken,
  requirePermission("EMPLOYEE_MANAGEMENT", "canView"),
  employeeController.getEmployeeByCode
);

/**
 * @route   GET /api/employees/department/:department
 * @desc    Get employees by department
 * @access  Private (requires authentication and view permission)
 * @query   pageIndex, pageSize, sortBy, sortOrder
 */
router.get(
  "/department/:department",
  authenticateToken,
  requirePermission("EMPLOYEE_MANAGEMENT", "canView"),
  employeeController.getEmployeesByDepartment
);

/**
 * @route   GET /api/employees/manager/:managerId
 * @desc    Get employees by reporting manager
 * @access  Private (requires authentication and view permission)
 * @query   pageIndex, pageSize, sortBy, sortOrder
 */
router.get(
  "/manager/:managerId",
  authenticateToken,
  requirePermission("EMPLOYEE_MANAGEMENT", "canView"),
  employeeController.getEmployeesByManager
);

/**
 * @route   GET /api/employees/:id
 * @desc    Get employee by ID
 * @access  Private (requires authentication and view permission)
 */
router.get(
  "/:id",
  authenticateToken,
  requirePermission("EMPLOYEE_MANAGEMENT", "canView"),
  employeeController.getEmployeeById
);

/**
 * @route   GET /api/employees
 * @desc    Get all employees with pagination and filtering
 * @access  Private (requires authentication and view permission)
 * @query   pageIndex, pageSize, sortBy, sortOrder, search, employmentStatus, contractType, department, position, hireDateFrom, hireDateTo
 */
router.get(
  "/",
  authenticateToken,
  requirePermission("EMPLOYEE_MANAGEMENT", "canView"),
  employeeController.getEmployees
);

/**
 * @route   POST /api/employees
 * @desc    Create a new employee
 * @access  Private (requires authentication and create permission)
 */
router.post(
  "/",
  authenticateToken,
  requirePermission("EMPLOYEE_MANAGEMENT", "canCreate"),
  employeeController.createEmployee
);

/**
 * @route   PUT /api/employees/:id
 * @desc    Update an employee
 * @access  Private (requires authentication and update permission)
 */
router.put(
  "/:id",
  authenticateToken,
  requirePermission("EMPLOYEE_MANAGEMENT", "canUpdate"),
  employeeController.updateEmployee
);

/**
 * @route   DELETE /api/employees/:id
 * @desc    Delete an employee (soft delete)
 * @access  Private (requires authentication and delete permission)
 */
router.delete(
  "/:id",
  authenticateToken,
  requirePermission("EMPLOYEE_MANAGEMENT", "canDelete"),
  employeeController.deleteEmployee
);

export default router;
