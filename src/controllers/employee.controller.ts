import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  EmployeeService,
  PaginationParams,
  EmployeeFilterDTO,
} from "../services/employee.service";
import { EmploymentStatus } from "../models/entities/employee";
import * as XLSX from "xlsx";

export class EmployeeController {
  private employeeService: EmployeeService;

  constructor() {
    this.employeeService = new EmployeeService();
  }

  /**
   * Get all employees with pagination and filtering
   * GET /api/employees
   * Query params: pageIndex, pageSize, sortBy, sortOrder, search, employmentStatus, departmentId, positionId, hireDateFrom, hireDateTo
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

      if (req.query.departmentId) {
        filters.departmentId = req.query.departmentId as string;
      }

      if (req.query.positionId) {
        filters.positionId = req.query.positionId as string;
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
   * GET /api/employees/department/:departmentId
   */
  getEmployeesByDepartment = async (req: AuthRequest, res: Response) => {
    try {
      const { departmentId } = req.params;
      const pagination: PaginationParams = {
        pageIndex: parseInt(req.query.pageIndex as string) || 0,
        pageSize: Math.min(parseInt(req.query.pageSize as string) || 10, 100),
        sortBy: (req.query.sortBy as string) || "firstName",
        sortOrder: (req.query.sortOrder as "ASC" | "DESC") || "ASC",
      };

      const result = await this.employeeService.getEmployeesByDepartment(
        departmentId,
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
      const search = req.query.search as string;
      const pagination: PaginationParams = {
        pageIndex: parseInt(req.query.pageIndex as string) || 0,
        pageSize: Math.min(parseInt(req.query.pageSize as string) || 10, 100),
        sortBy: (req.query.sortBy as string) || "firstName",
        sortOrder: (req.query.sortOrder as "ASC" | "DESC") || "ASC",
      };

      const result = await this.employeeService.getEmployeesByManager(
        managerId,
        pagination,
        search
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

  /**
   * Export employees to Excel
   * GET /api/employees/export
   * Query params: pageIndex, pageSize, search, departmentId, positionId (same as getEmployees)
   */
  exportEmployees = async (req: AuthRequest, res: Response) => {
    try {
      // Parse pagination params (allow larger pageSize for export)
      const pagination: PaginationParams = {
        pageIndex: parseInt(req.query.pageIndex as string) || 0,
        pageSize: Math.min(
          parseInt(req.query.pageSize as string) || 1000,
          10000
        ), // Max 10000 for export
        sortBy: (req.query.sortBy as string) || "createdAt",
        sortOrder: (req.query.sortOrder as "ASC" | "DESC") || "DESC",
      };

      // Parse filter params (same as getEmployees)
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

      if (req.query.departmentId) {
        filters.departmentId = req.query.departmentId as string;
      }

      if (req.query.positionId) {
        filters.positionId = req.query.positionId as string;
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

      // Get employees with filters
      const result = await this.employeeService.getEmployees(
        pagination,
        filters
      );

      // Transform data for Excel export
      const excelData = result.data.map((employee) => ({
        "Employee Code": employee.employeeCode || "",
        "First Name": employee.firstName || "",
        "Last Name": employee.lastName || "",
        Email: employee.email || "",
        "Phone Number": employee.phoneNumber || "",
        Position: employee.positionEntity?.name || "",
        Department:
          employee.departments
            ?.filter((ed: any) => ed.isActive && ed.isPrimary)
            .map((ed: any) => ed.department?.name)
            .filter(Boolean)
            .join(", ") || "N/A",
        "Employment Status": employee.employmentStatus || "",
        "Contract Type": employee.contracts?.[0]?.contractType || "",
        "Hire Date": employee.hireDate
          ? new Date(employee.hireDate).toLocaleDateString()
          : "",
        Address: employee.currentAddress || "",
        City: employee.city || "",
        State: employee.state || "",
        "Postal Code": employee.postalCode || "",
        Country: employee.country || "",
        "Emergency Contact Name": employee.emergencyContactName || "",
        "Emergency Contact Phone": employee.emergencyContactNumber || "",
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 15 }, // Employee Code
        { wch: 15 }, // First Name
        { wch: 15 }, // Last Name
        { wch: 25 }, // Email
        { wch: 15 }, // Phone Number
        { wch: 20 }, // Position
        { wch: 20 }, // Department
        { wch: 18 }, // Employment Status
        { wch: 15 }, // Contract Type
        { wch: 12 }, // Hire Date
        { wch: 30 }, // Address
        { wch: 15 }, // City
        { wch: 15 }, // State
        { wch: 12 }, // Postal Code
        { wch: 15 }, // Country
        { wch: 20 }, // Emergency Contact Name
        { wch: 18 }, // Emergency Contact Phone
      ];
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Employees");

      // Generate buffer
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      // Set headers for file download
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=employees_${
          new Date().toISOString().split("T")[0]
        }.xlsx`
      );

      res.send(buffer);
    } catch (error: any) {
      console.error("Error exporting employees:", error);
      res.status(500).json({
        success: false,
        message: "Failed to export employees",
        error: error.message,
      });
    }
  };

  /**
   * Import employees from Excel
   * POST /api/employees/import
   * Expects multipart/form-data with file field named 'file'
   */
  importEmployees = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // Read the Excel file from buffer
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const rawData: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (!rawData || rawData.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Excel file is empty",
        });
      }

      // Transform Excel data to employee objects
      const employeesData = rawData.map((row) => {
        const employeeData: any = {
          employeeCode: row["Employee Code"] || undefined,
          firstName: row["First Name"],
          lastName: row["Last Name"],
          email: row["Email"],
          phoneNumber: row["Phone Number"] || undefined,
          position: row["Position"] || undefined,
          department: row["Department"] || undefined,
          employmentStatus: row["Employment Status"] || "Active",
          hireDate: row["Hire Date"] ? new Date(row["Hire Date"]) : undefined,
          address: row["Address"] || undefined,
          city: row["City"] || undefined,
          state: row["State"] || undefined,
          postalCode: row["Postal Code"] || undefined,
          country: row["Country"] || undefined,
          emergencyContactName: row["Emergency Contact Name"] || undefined,
          emergencyContactPhone: row["Emergency Contact Phone"] || undefined,
        };

        // Add audit info
        if (req.user?.userId) {
          employeeData.createdBy = req.user.userId;
        }

        return employeeData;
      });

      // Validate required fields
      const errors: string[] = [];
      employeesData.forEach((emp, index) => {
        if (!emp.firstName) {
          errors.push(`Row ${index + 2}: First Name is required`);
        }
        if (!emp.lastName) {
          errors.push(`Row ${index + 2}: Last Name is required`);
        }
        if (!emp.email) {
          errors.push(`Row ${index + 2}: Email is required`);
        }
      });

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors,
        });
      }

      // Import employees (create in bulk)
      const results = await this.employeeService.bulkCreateEmployees(
        employeesData
      );

      res.status(201).json({
        success: true,
        message: `Successfully imported ${results.successful.length} employees`,
        data: {
          successful: results.successful.length,
          failed: results.failed.length,
          errors: results.failed,
        },
      });
    } catch (error: any) {
      console.error("Error importing employees:", error);
      res.status(500).json({
        success: false,
        message: "Failed to import employees",
        error: error.message,
      });
    }
  };
}
