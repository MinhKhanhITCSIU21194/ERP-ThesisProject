import { Request, Response } from "express";
import { PositionService } from "../services/position.service";
import { PositionLevel } from "../models/entities/position";

const positionService = new PositionService();

export class PositionController {
  /**
   * GET /api/positions
   * Get all positions with optional filters
   */
  async getAllPositions(req: Request, res: Response) {
    try {
      const { isActive, level, search, parentId, minSalary, maxSalary } =
        req.query;

      const filters: any = {};

      if (isActive !== undefined) {
        filters.isActive = isActive === "true";
      }

      if (
        level &&
        Object.values(PositionLevel).includes(level as PositionLevel)
      ) {
        filters.level = level as PositionLevel;
      }

      if (search) {
        filters.search = search as string;
      }

      if (parentId !== undefined) {
        filters.parentId = parentId === "null" ? null : (parentId as string);
      }

      if (minSalary) {
        filters.minSalary = parseFloat(minSalary as string);
      }

      if (maxSalary) {
        filters.maxSalary = parseFloat(maxSalary as string);
      }

      const positions = await positionService.getAllPositions(filters);

      res.status(200).json({
        success: true,
        data: positions,
        count: positions.length,
      });
    } catch (error: any) {
      console.error("Error getting positions:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to get positions",
      });
    }
  }

  /**
   * GET /api/positions/hierarchy
   * Get position hierarchy tree
   */
  async getPositionHierarchy(req: Request, res: Response) {
    try {
      const hierarchy = await positionService.getPositionHierarchy();

      res.status(200).json({
        success: true,
        data: hierarchy,
      });
    } catch (error: any) {
      console.error("Error getting position hierarchy:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to get position hierarchy",
      });
    }
  }

  /**
   * GET /api/positions/by-level/:level
   * Get positions by level
   */
  async getPositionsByLevel(req: Request, res: Response) {
    try {
      const { level } = req.params;

      if (!Object.values(PositionLevel).includes(level as PositionLevel)) {
        return res.status(400).json({
          success: false,
          error: "Invalid position level",
        });
      }

      const positions = await positionService.getPositionsByLevel(
        level as PositionLevel
      );

      res.status(200).json({
        success: true,
        data: positions,
        count: positions.length,
      });
    } catch (error: any) {
      console.error("Error getting positions by level:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to get positions by level",
      });
    }
  }

  /**
   * GET /api/positions/by-salary
   * Get positions within salary range
   */
  async getPositionsBySalaryRange(req: Request, res: Response) {
    try {
      const { minSalary, maxSalary } = req.query;

      if (!minSalary || !maxSalary) {
        return res.status(400).json({
          success: false,
          error: "Both minSalary and maxSalary are required",
        });
      }

      const positions = await positionService.getPositionsBySalaryRange(
        parseFloat(minSalary as string),
        parseFloat(maxSalary as string)
      );

      res.status(200).json({
        success: true,
        data: positions,
        count: positions.length,
      });
    } catch (error: any) {
      console.error("Error getting positions by salary range:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to get positions by salary range",
      });
    }
  }

  /**
   * GET /api/positions/:id
   * Get position by ID
   */
  async getPositionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const position = await positionService.getPositionById(id);

      res.status(200).json({
        success: true,
        data: position,
      });
    } catch (error: any) {
      console.error("Error getting position:", error);
      const statusCode = error.message === "Position not found" ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || "Failed to get position",
      });
    }
  }

  /**
   * GET /api/positions/:id/employees
   * Get employees in a position
   */
  async getPositionEmployees(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { activeOnly } = req.query;

      const employees = await positionService.getPositionEmployees(
        id,
        activeOnly !== "false"
      );

      res.status(200).json({
        success: true,
        data: employees,
        count: employees.length,
      });
    } catch (error: any) {
      console.error("Error getting position employees:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to get position employees",
      });
    }
  }

  /**
   * GET /api/positions/:id/stats
   * Get position statistics
   */
  async getPositionStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stats = await positionService.getPositionStats(id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error("Error getting position stats:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to get position statistics",
      });
    }
  }

  /**
   * POST /api/positions
   * Create a new position
   */
  async createPosition(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const positionData = {
        ...req.body,
        createdBy: userId,
      };

      const position = await positionService.createPosition(positionData);

      res.status(201).json({
        success: true,
        data: position,
        message: "Position created successfully",
      });
    } catch (error: any) {
      console.error("Error creating position:", error);
      const statusCode =
        error.message.includes("not found") ||
        error.message.includes("already exists") ||
        error.message.includes("cannot")
          ? 400
          : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || "Failed to create position",
      });
    }
  }

  /**
   * PUT /api/positions/:id
   * Update position
   */
  async updatePosition(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const updateData = {
        ...req.body,
        updatedBy: userId,
      };

      const position = await positionService.updatePosition(id, updateData);

      res.status(200).json({
        success: true,
        data: position,
        message: "Position updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating position:", error);
      const statusCode =
        error.message.includes("not found") ||
        error.message.includes("already exists") ||
        error.message.includes("cannot")
          ? 400
          : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || "Failed to update position",
      });
    }
  }

  /**
   * DELETE /api/positions/:id
   * Soft delete position
   */
  async deletePosition(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      const position = await positionService.deletePosition(id, userId);

      res.status(200).json({
        success: true,
        data: position,
        message: "Position deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting position:", error);
      const statusCode =
        error.message.includes("not found") ||
        error.message.includes("Cannot delete")
          ? 400
          : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || "Failed to delete position",
      });
    }
  }

  /**
   * DELETE /api/positions/:id/hard
   * Permanently delete position
   */
  async hardDeletePosition(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await positionService.hardDeletePosition(id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      console.error("Error permanently deleting position:", error);
      const statusCode =
        error.message.includes("not found") || error.message.includes("Cannot")
          ? 400
          : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || "Failed to permanently delete position",
      });
    }
  }

  /**
   * POST /api/positions/update-headcounts
   * Update headcount for all positions
   */
  async updateAllHeadcounts(req: Request, res: Response) {
    try {
      const result = await positionService.updateAllHeadcounts();

      res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error: any) {
      console.error("Error updating headcounts:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to update headcounts",
      });
    }
  }
}

export default new PositionController();
