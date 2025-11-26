import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  EmployeeService,
  PaginationParams,
  EmployeeFilterDTO,
} from "../services/employee.service";
import { EmploymentStatus } from "../models/entities/employee";

export class EmployeeController {
  private employeeService: EmployeeService;

  constructor() {
    this.employeeService = new EmployeeService();
  }

  /**
   * Get all employees with pagination and filtering
   * GET /api/employees
   * Query params: pageIndex, pageSize, sortBy, sortOrder, search, employmentStatus, contractType, department, position, hireDateFrom, hireDateTo
   */
  getEmployees = async (req: AuthRequest, res: Response) => {
    try {
      // Parse pagination params
      const pagination: PaginationParams = {
        pageIndex: parseInt(req.query.pageIndex as string) || 0,
        pageSize: Math.min(parseInt(req.query.pageSize as string) || 10, 100), // Max 100 per page
        sortBy: (req.query.sortBy as string) || "createdAt",
        sortOrder: (req.query.sortOrder as "ASC" | "DESC") || "DESC",
      };

      // Parse filter params
      const filters: EmployeeFilterDTO = {};

      if (req.query.search) {
        filters.search = req.query.search as string;
      }

      if (req.query.employmentStatus) {
        const statuses = (req.query.employmentStatus as string).split(",");
        filters.employmentStatus =
          statuses.length > 1
            ? (statuses as EmploymentStatus[])
            : (statuses[0] as EmploymentStatus);
      }

      // Note: contractType filter removed - use /api/contracts endpoints to filter by contract type

      if (req.query.department) {
        filters.department = req.query.department as string;
      }

      if (req.query.position) {
        filters.position = req.query.position as string;
      }

      if (req.query.reportingManagerId) {
        filters.reportingManagerId = req.query.reportingManagerId as string;
      }

      if (req.query.hireDateFrom) {
        filters.hireDateFrom = new Date(req.query.hireDateFrom as string);
      }

      if (req.query.hireDateTo) {
        filters.hireDateTo = new Date(req.query.hireDateTo as string);
      }

      const result = await this.employeeService.getEmployees(
        pagination,
        filters
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("Error fetching employees:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch employees",
        error: error.message,
      });
    }
  };

  /**
   * Get employee by ID
   * GET /api/employees/:id
   */
  getEmployeeById = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const employee = await this.employeeService.getEmployeeById(id);

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (error: any) {
      console.error("Error fetching employee:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch employee",
        error: error.message,
      });
    }
  };

  /**
   * Get employee by employee code
   * GET /api/employees/code/:code
   */
  getEmployeeByCode = async (req: AuthRequest, res: Response) => {
    try {
      const { code } = req.params;
      const employee = await this.employeeService.getEmployeeByCode(code);

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (error: any) {
      console.error("Error fetching employee:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch employee",
        error: error.message,
      });
    }
  };

  /**
   * Create a new employee
   * POST /api/employees
   */
  createEmployee = async (req: AuthRequest, res: Response) => {
    try {
      const employeeData = req.body;

      // Add audit info from authenticated user
      if (req.user?.userId) {
        employeeData.createdBy = req.user.userId;
      }

      const employee = await this.employeeService.createEmployee(employeeData);

      res.status(201).json({
        success: true,
        data: employee,
        message: "Employee created successfully",
      });
    } catch (error: any) {
      console.error("Error creating employee:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create employee",
      });
    }
  };

  /**
   * Update an employee
   * PUT /api/employees/:id
   */
  updateEmployee = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const employeeData = req.body;

      // Add audit info from authenticated user
      if (req.user?.userId) {
        employeeData.updatedBy = req.user.userId;
      }

      const employee = await this.employeeService.updateEmployee(
        id,
        employeeData
      );

      res.status(200).json({
        success: true,
        data: employee,
        message: "Employee updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating employee:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(400).json({
        success: false,
        message: error.message || "Failed to update employee",
      });
    }
  };

  /**
   * Delete an employee (soft delete)
   * DELETE /api/employees/:id
   */
  deleteEmployee = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      await this.employeeService.deleteEmployee(id);

      res.status(200).json({
        success: true,
        message: "Employee deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting employee:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to delete employee",
        error: error.message,
      });
    }
  };

  /**
   * Get employee statistics
   * GET /api/employees/statistics
   */
  getStatistics = async (req: AuthRequest, res: Response) => {
    try {
      const statistics = await this.employeeService.getEmployeeStatistics();

      res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error: any) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch statistics",
        error: error.message,
      });
    }
  };

  /**
   * Get employees with expiring contracts
   * GET /api/employees/expiring-contracts?days=30
   */
  getExpiringContracts = async (req: AuthRequest, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const employees =
        await this.employeeService.getEmployeesWithExpiringContracts(days);

      res.status(200).json({
        success: true,
        data: employees,
        count: employees.length,
      });
    } catch (error: any) {
      console.error("Error fetching expiring contracts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch expiring contracts",
        error: error.message,
      });
    }
  };

  /**
   * Get employees by department
   * GET /api/employees/department/:department
   */
  getEmployeesByDepartment = async (req: AuthRequest, res: Response) => {
    try {
      const { department } = req.params;
      const pagination: PaginationParams = {
        pageIndex: parseInt(req.query.pageIndex as string) || 0,
        pageSize: Math.min(parseInt(req.query.pageSize as string) || 10, 100),
        sortBy: (req.query.sortBy as string) || "firstName",
        sortOrder: (req.query.sortOrder as "ASC" | "DESC") || "ASC",
      };

      const result = await this.employeeService.getEmployeesByDepartment(
        department,
        pagination
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("Error fetching employees by department:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch employees",
        error: error.message,
      });
    }
  };

  /**
   * Get employees by manager
   * GET /api/employees/manager/:managerId
   */
  getEmployeesByManager = async (req: AuthRequest, res: Response) => {
    try {
      const { managerId } = req.params;
      const pagination: PaginationParams = {
        pageIndex: parseInt(req.query.pageIndex as string) || 0,
        pageSize: Math.min(parseInt(req.query.pageSize as string) || 10, 100),
        sortBy: (req.query.sortBy as string) || "firstName",
        sortOrder: (req.query.sortOrder as "ASC" | "DESC") || "ASC",
      };

      const result = await this.employeeService.getEmployeesByManager(
        managerId,
        pagination
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("Error fetching employees by manager:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch employees",
        error: error.message,
      });
    }
  };
}
