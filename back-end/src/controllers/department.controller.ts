import { Request, Response } from "express";
import { DepartmentService } from "../services/department.service";

const departmentService = new DepartmentService();

export class DepartmentController {
  /**
   * GET /api/departments
   * Get all departments with optional filters
   */
  async getAllDepartments(req: Request, res: Response) {
    try {
      const { isActive, search, parentId } = req.query;

      const filters: any = {};

      if (isActive !== undefined) {
        filters.isActive = isActive === "true";
      }

      if (search) {
        filters.search = search as string;
      }

      if (parentId !== undefined) {
        filters.parentId = parentId === "null" ? null : (parentId as string);
      }

      const departments = await departmentService.getAllDepartments(filters);

      res.status(200).json({
        success: true,
        data: departments,
        count: departments.length,
      });
    } catch (error: any) {
      console.error("Error getting departments:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to get departments",
      });
    }
  }

  /**
   * GET /api/departments/hierarchy
   * Get department hierarchy tree
   */
  async getDepartmentHierarchy(req: Request, res: Response) {
    try {
      const hierarchy = await departmentService.getDepartmentHierarchy();

      res.status(200).json({
        success: true,
        data: hierarchy,
      });
    } catch (error: any) {
      console.error("Error getting department hierarchy:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to get department hierarchy",
      });
    }
  }

  /**
   * GET /api/departments/:id
   * Get department by ID
   */
  async getDepartmentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const department = await departmentService.getDepartmentById(id);

      res.status(200).json({
        success: true,
        data: department,
      });
    } catch (error: any) {
      console.error("Error getting department:", error);
      const statusCode = error.message === "Department not found" ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || "Failed to get department",
      });
    }
  }

  /**
   * GET /api/departments/:id/employees
   * Get employees in a department
   */
  async getDepartmentEmployees(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { includeInactive } = req.query;

      const employees = await departmentService.getDepartmentEmployees(
        id,
        includeInactive === "true"
      );

      res.status(200).json({
        success: true,
        data: employees,
        count: employees.length,
      });
    } catch (error: any) {
      console.error("Error getting department employees:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to get department employees",
      });
    }
  }

  /**
   * GET /api/departments/:id/stats
   * Get department statistics
   */
  async getDepartmentStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stats = await departmentService.getDepartmentStats(id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error("Error getting department stats:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to get department statistics",
      });
    }
  }

  /**
   * POST /api/departments
   * Create a new department
   */
  async createDepartment(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const departmentData = {
        ...req.body,
        createdBy: userId,
      };

      const department = await departmentService.createDepartment(
        departmentData
      );

      res.status(201).json({
        success: true,
        data: department,
        message: "Department created successfully",
      });
    } catch (error: any) {
      console.error("Error creating department:", error);
      const statusCode =
        error.message.includes("not found") ||
        error.message.includes("already exists")
          ? 400
          : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || "Failed to create department",
      });
    }
  }

  /**
   * PUT /api/departments/:id
   * Update department
   */
  async updateDepartment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const updateData = {
        ...req.body,
        updatedBy: userId,
      };

      const department = await departmentService.updateDepartment(
        id,
        updateData
      );

      res.status(200).json({
        success: true,
        data: department,
        message: "Department updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating department:", error);
      const statusCode =
        error.message.includes("not found") ||
        error.message.includes("already exists") ||
        error.message.includes("cannot")
          ? 400
          : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || "Failed to update department",
      });
    }
  }

  /**
   * DELETE /api/departments/:id
   * Soft delete department
   */
  async deleteDepartment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      const department = await departmentService.deleteDepartment(id, userId);

      res.status(200).json({
        success: true,
        data: department,
        message: "Department deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting department:", error);
      const statusCode =
        error.message.includes("not found") ||
        error.message.includes("Cannot delete")
          ? 400
          : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || "Failed to delete department",
      });
    }
  }

  /**
   * DELETE /api/departments/:id/hard
   * Permanently delete department
   */
  async hardDeleteDepartment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await departmentService.hardDeleteDepartment(id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      console.error("Error permanently deleting department:", error);
      const statusCode =
        error.message.includes("not found") || error.message.includes("Cannot")
          ? 400
          : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || "Failed to permanently delete department",
      });
    }
  }

  /**
   * POST /api/departments/move-employees
   * Move employees from one department to another
   */
  async moveEmployees(req: Request, res: Response) {
    try {
      const { fromDepartmentId, toDepartmentId, employeeIds } = req.body;

      if (!fromDepartmentId || !toDepartmentId) {
        return res.status(400).json({
          success: false,
          error: "Both fromDepartmentId and toDepartmentId are required",
        });
      }

      const result = await departmentService.moveEmployees(
        fromDepartmentId,
        toDepartmentId,
        employeeIds
      );

      res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error: any) {
      console.error("Error moving employees:", error);
      const statusCode = error.message.includes("not found") ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || "Failed to move employees",
      });
    }
  }
}

export default new DepartmentController();
