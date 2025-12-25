"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeController = void 0;
const employee_service_1 = require("../services/employee.service");
class EmployeeController {
    constructor() {
        this.getEmployees = async (req, res) => {
            try {
                const pagination = {
                    pageIndex: parseInt(req.query.pageIndex) || 0,
                    pageSize: Math.min(parseInt(req.query.pageSize) || 10, 100),
                    sortBy: req.query.sortBy || "createdAt",
                    sortOrder: req.query.sortOrder || "DESC",
                };
                const filters = {};
                if (req.query.search) {
                    filters.search = req.query.search;
                }
                if (req.query.employmentStatus) {
                    const statuses = req.query.employmentStatus.split(",");
                    filters.employmentStatus =
                        statuses.length > 1
                            ? statuses
                            : statuses[0];
                }
                if (req.query.department) {
                    filters.department = req.query.department;
                }
                if (req.query.position) {
                    filters.position = req.query.position;
                }
                if (req.query.reportingManagerId) {
                    filters.reportingManagerId = req.query.reportingManagerId;
                }
                if (req.query.hireDateFrom) {
                    filters.hireDateFrom = new Date(req.query.hireDateFrom);
                }
                if (req.query.hireDateTo) {
                    filters.hireDateTo = new Date(req.query.hireDateTo);
                }
                const result = await this.employeeService.getEmployees(pagination, filters);
                res.status(200).json({
                    success: true,
                    ...result,
                });
            }
            catch (error) {
                console.error("Error fetching employees:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch employees",
                    error: error.message,
                });
            }
        };
        this.getEmployeeById = async (req, res) => {
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
            }
            catch (error) {
                console.error("Error fetching employee:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch employee",
                    error: error.message,
                });
            }
        };
        this.getEmployeeByCode = async (req, res) => {
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
            }
            catch (error) {
                console.error("Error fetching employee:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch employee",
                    error: error.message,
                });
            }
        };
        this.createEmployee = async (req, res) => {
            try {
                const employeeData = req.body;
                if (req.user?.userId) {
                    employeeData.createdBy = req.user.userId;
                }
                const employee = await this.employeeService.createEmployee(employeeData);
                res.status(201).json({
                    success: true,
                    data: employee,
                    message: "Employee created successfully",
                });
            }
            catch (error) {
                console.error("Error creating employee:", error);
                res.status(400).json({
                    success: false,
                    message: error.message || "Failed to create employee",
                });
            }
        };
        this.updateEmployee = async (req, res) => {
            try {
                const { id } = req.params;
                const employeeData = req.body;
                if (req.user?.userId) {
                    employeeData.updatedBy = req.user.userId;
                }
                const employee = await this.employeeService.updateEmployee(id, employeeData);
                res.status(200).json({
                    success: true,
                    data: employee,
                    message: "Employee updated successfully",
                });
            }
            catch (error) {
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
        this.deleteEmployee = async (req, res) => {
            try {
                const { id } = req.params;
                await this.employeeService.deleteEmployee(id);
                res.status(200).json({
                    success: true,
                    message: "Employee deleted successfully",
                });
            }
            catch (error) {
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
        this.getStatistics = async (req, res) => {
            try {
                const statistics = await this.employeeService.getEmployeeStatistics();
                res.status(200).json({
                    success: true,
                    data: statistics,
                });
            }
            catch (error) {
                console.error("Error fetching statistics:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch statistics",
                    error: error.message,
                });
            }
        };
        this.getExpiringContracts = async (req, res) => {
            try {
                const days = parseInt(req.query.days) || 30;
                const employees = await this.employeeService.getEmployeesWithExpiringContracts(days);
                res.status(200).json({
                    success: true,
                    data: employees,
                    count: employees.length,
                });
            }
            catch (error) {
                console.error("Error fetching expiring contracts:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch expiring contracts",
                    error: error.message,
                });
            }
        };
        this.getEmployeesByDepartment = async (req, res) => {
            try {
                const { department } = req.params;
                const pagination = {
                    pageIndex: parseInt(req.query.pageIndex) || 0,
                    pageSize: Math.min(parseInt(req.query.pageSize) || 10, 100),
                    sortBy: req.query.sortBy || "firstName",
                    sortOrder: req.query.sortOrder || "ASC",
                };
                const result = await this.employeeService.getEmployeesByDepartment(department, pagination);
                res.status(200).json({
                    success: true,
                    ...result,
                });
            }
            catch (error) {
                console.error("Error fetching employees by department:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch employees",
                    error: error.message,
                });
            }
        };
        this.getEmployeesByManager = async (req, res) => {
            try {
                const { managerId } = req.params;
                const pagination = {
                    pageIndex: parseInt(req.query.pageIndex) || 0,
                    pageSize: Math.min(parseInt(req.query.pageSize) || 10, 100),
                    sortBy: req.query.sortBy || "firstName",
                    sortOrder: req.query.sortOrder || "ASC",
                };
                const result = await this.employeeService.getEmployeesByManager(managerId, pagination);
                res.status(200).json({
                    success: true,
                    ...result,
                });
            }
            catch (error) {
                console.error("Error fetching employees by manager:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch employees",
                    error: error.message,
                });
            }
        };
        this.employeeService = new employee_service_1.EmployeeService();
    }
}
exports.EmployeeController = EmployeeController;
//# sourceMappingURL=employee.controller.js.map