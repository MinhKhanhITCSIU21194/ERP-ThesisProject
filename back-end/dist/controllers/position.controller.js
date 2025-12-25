"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionController = void 0;
const position_service_1 = require("../services/position.service");
const position_1 = require("../models/entities/position");
const positionService = new position_service_1.PositionService();
class PositionController {
    async getAllPositions(req, res) {
        try {
            const { isActive, level, search, parentId, minSalary, maxSalary } = req.query;
            const filters = {};
            if (isActive !== undefined) {
                filters.isActive = isActive === "true";
            }
            if (level &&
                Object.values(position_1.PositionLevel).includes(level)) {
                filters.level = level;
            }
            if (search) {
                filters.search = search;
            }
            if (parentId !== undefined) {
                filters.parentId = parentId === "null" ? null : parentId;
            }
            if (minSalary) {
                filters.minSalary = parseFloat(minSalary);
            }
            if (maxSalary) {
                filters.maxSalary = parseFloat(maxSalary);
            }
            const positions = await positionService.getAllPositions(filters);
            res.status(200).json({
                success: true,
                data: positions,
                count: positions.length,
            });
        }
        catch (error) {
            console.error("Error getting positions:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to get positions",
            });
        }
    }
    async getPositionHierarchy(req, res) {
        try {
            const hierarchy = await positionService.getPositionHierarchy();
            res.status(200).json({
                success: true,
                data: hierarchy,
            });
        }
        catch (error) {
            console.error("Error getting position hierarchy:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to get position hierarchy",
            });
        }
    }
    async getPositionsByLevel(req, res) {
        try {
            const { level } = req.params;
            if (!Object.values(position_1.PositionLevel).includes(level)) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid position level",
                });
            }
            const positions = await positionService.getPositionsByLevel(level);
            res.status(200).json({
                success: true,
                data: positions,
                count: positions.length,
            });
        }
        catch (error) {
            console.error("Error getting positions by level:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to get positions by level",
            });
        }
    }
    async getPositionsBySalaryRange(req, res) {
        try {
            const { minSalary, maxSalary } = req.query;
            if (!minSalary || !maxSalary) {
                return res.status(400).json({
                    success: false,
                    error: "Both minSalary and maxSalary are required",
                });
            }
            const positions = await positionService.getPositionsBySalaryRange(parseFloat(minSalary), parseFloat(maxSalary));
            res.status(200).json({
                success: true,
                data: positions,
                count: positions.length,
            });
        }
        catch (error) {
            console.error("Error getting positions by salary range:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to get positions by salary range",
            });
        }
    }
    async getPositionById(req, res) {
        try {
            const { id } = req.params;
            const position = await positionService.getPositionById(id);
            res.status(200).json({
                success: true,
                data: position,
            });
        }
        catch (error) {
            console.error("Error getting position:", error);
            const statusCode = error.message === "Position not found" ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                error: error.message || "Failed to get position",
            });
        }
    }
    async getPositionEmployees(req, res) {
        try {
            const { id } = req.params;
            const { activeOnly } = req.query;
            const employees = await positionService.getPositionEmployees(id, activeOnly !== "false");
            res.status(200).json({
                success: true,
                data: employees,
                count: employees.length,
            });
        }
        catch (error) {
            console.error("Error getting position employees:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to get position employees",
            });
        }
    }
    async getPositionStats(req, res) {
        try {
            const { id } = req.params;
            const stats = await positionService.getPositionStats(id);
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            console.error("Error getting position stats:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to get position statistics",
            });
        }
    }
    async createPosition(req, res) {
        try {
            const userId = req.user?.userId;
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
        }
        catch (error) {
            console.error("Error creating position:", error);
            const statusCode = error.message.includes("not found") ||
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
    async updatePosition(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
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
        }
        catch (error) {
            console.error("Error updating position:", error);
            const statusCode = error.message.includes("not found") ||
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
    async deletePosition(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
            const position = await positionService.deletePosition(id, userId);
            res.status(200).json({
                success: true,
                data: position,
                message: "Position deleted successfully",
            });
        }
        catch (error) {
            console.error("Error deleting position:", error);
            const statusCode = error.message.includes("not found") ||
                error.message.includes("Cannot delete")
                ? 400
                : 500;
            res.status(statusCode).json({
                success: false,
                error: error.message || "Failed to delete position",
            });
        }
    }
    async hardDeletePosition(req, res) {
        try {
            const { id } = req.params;
            const result = await positionService.hardDeletePosition(id);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            console.error("Error permanently deleting position:", error);
            const statusCode = error.message.includes("not found") || error.message.includes("Cannot")
                ? 400
                : 500;
            res.status(statusCode).json({
                success: false,
                error: error.message || "Failed to permanently delete position",
            });
        }
    }
    async updateAllHeadcounts(req, res) {
        try {
            const result = await positionService.updateAllHeadcounts();
            res.status(200).json({
                success: true,
                data: result,
                message: result.message,
            });
        }
        catch (error) {
            console.error("Error updating headcounts:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to update headcounts",
            });
        }
    }
}
exports.PositionController = PositionController;
exports.default = new PositionController();
//# sourceMappingURL=position.controller.js.map