"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentController = void 0;
const department_service_1 = require("../services/department.service");
const departmentService = new department_service_1.DepartmentService();
class DepartmentController {
    async getAllDepartments(req, res) {
        try {
            const { isActive, search, parentId } = req.query;
            const filters = {};
            if (isActive !== undefined) {
                filters.isActive = isActive === "true";
            }
            if (search) {
                filters.search = search;
            }
            if (parentId !== undefined) {
                filters.parentId = parentId === "null" ? null : parentId;
            }
            const departments = await departmentService.getAllDepartments(filters);
            res.status(200).json({
                success: true,
                data: departments,
                count: departments.length,
            });
        }
        catch (error) {
            console.error("Error getting departments:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to get departments",
            });
        }
    }
    async getDepartmentHierarchy(req, res) {
        try {
            const hierarchy = await departmentService.getDepartmentHierarchy();
            res.status(200).json({
                success: true,
                data: hierarchy,
            });
        }
        catch (error) {
            console.error("Error getting department hierarchy:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to get department hierarchy",
            });
        }
    }
    async getDepartmentById(req, res) {
        try {
            const { id } = req.params;
            const department = await departmentService.getDepartmentById(id);
            res.status(200).json({
                success: true,
                data: department,
            });
        }
        catch (error) {
            console.error("Error getting department:", error);
            const statusCode = error.message === "Department not found" ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                error: error.message || "Failed to get department",
            });
        }
    }
    async getDepartmentEmployees(req, res) {
        try {
            const { id } = req.params;
            const { includeInactive } = req.query;
            const employees = await departmentService.getDepartmentEmployees(id, includeInactive === "true");
            res.status(200).json({
                success: true,
                data: employees,
                count: employees.length,
            });
        }
        catch (error) {
            console.error("Error getting department employees:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to get department employees",
            });
        }
    }
    async getDepartmentStats(req, res) {
        try {
            const { id } = req.params;
            const stats = await departmentService.getDepartmentStats(id);
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            console.error("Error getting department stats:", error);
            res.status(500).json({
                success: false,
                error: error.message || "Failed to get department statistics",
            });
        }
    }
    async createDepartment(req, res) {
        try {
            const userId = req.user?.userId;
            const departmentData = {
                ...req.body,
                createdBy: userId,
            };
            const department = await departmentService.createDepartment(departmentData);
            res.status(201).json({
                success: true,
                data: department,
                message: "Department created successfully",
            });
        }
        catch (error) {
            console.error("Error creating department:", error);
            const statusCode = error.message.includes("not found") ||
                error.message.includes("already exists")
                ? 400
                : 500;
            res.status(statusCode).json({
                success: false,
                error: error.message || "Failed to create department",
            });
        }
    }
    async updateDepartment(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
            const updateData = {
                ...req.body,
                updatedBy: userId,
            };
            const department = await departmentService.updateDepartment(id, updateData);
            res.status(200).json({
                success: true,
                data: department,
                message: "Department updated successfully",
            });
        }
        catch (error) {
            console.error("Error updating department:", error);
            const statusCode = error.message.includes("not found") ||
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
    async deleteDepartment(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
            const department = await departmentService.deleteDepartment(id, userId);
            res.status(200).json({
                success: true,
                data: department,
                message: "Department deleted successfully",
            });
        }
        catch (error) {
            console.error("Error deleting department:", error);
            const statusCode = error.message.includes("not found") ||
                error.message.includes("Cannot delete")
                ? 400
                : 500;
            res.status(statusCode).json({
                success: false,
                error: error.message || "Failed to delete department",
            });
        }
    }
    async hardDeleteDepartment(req, res) {
        try {
            const { id } = req.params;
            const result = await departmentService.hardDeleteDepartment(id);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            console.error("Error permanently deleting department:", error);
            const statusCode = error.message.includes("not found") || error.message.includes("Cannot")
                ? 400
                : 500;
            res.status(statusCode).json({
                success: false,
                error: error.message || "Failed to permanently delete department",
            });
        }
    }
    async moveEmployees(req, res) {
        try {
            const { fromDepartmentId, toDepartmentId, employeeIds } = req.body;
            if (!fromDepartmentId || !toDepartmentId) {
                return res.status(400).json({
                    success: false,
                    error: "Both fromDepartmentId and toDepartmentId are required",
                });
            }
            const result = await departmentService.moveEmployees(fromDepartmentId, toDepartmentId, employeeIds);
            res.status(200).json({
                success: true,
                data: result,
                message: result.message,
            });
        }
        catch (error) {
            console.error("Error moving employees:", error);
            const statusCode = error.message.includes("not found") ? 400 : 500;
            res.status(statusCode).json({
                success: false,
                error: error.message || "Failed to move employees",
            });
        }
    }
}
exports.DepartmentController = DepartmentController;
exports.default = new DepartmentController();
//# sourceMappingURL=department.controller.js.map