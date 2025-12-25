"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveRequestController = exports.LeaveRequestController = void 0;
const leave_request_service_1 = require("../services/leave-request.service");
class LeaveRequestController {
    async createLeaveRequest(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const { employeeId, startDate, endDate, leavePeriodStartDate, leavePeriodEndDate, totalDays, leaveType, reason, approverId, } = req.body;
            if (!employeeId ||
                !startDate ||
                !endDate ||
                !leaveType ||
                !approverId ||
                leavePeriodStartDate === undefined ||
                leavePeriodEndDate === undefined ||
                totalDays === undefined) {
                res.status(400).json({ error: "Missing required fields" });
                return;
            }
            const leaveRequest = await leave_request_service_1.leaveRequestService.createLeaveRequest({
                employeeId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                leavePeriodStartDate,
                leavePeriodEndDate,
                totalDays,
                leaveType,
                reason,
                approverId,
            });
            res.status(201).json({
                success: true,
                data: leaveRequest,
                message: "Leave request created successfully",
            });
        }
        catch (error) {
            console.error("Error creating leave request:", error);
            res.status(500).json({ error: error.message || "Internal server error" });
        }
    }
    async getMyLeaveRequests(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const { status, limit, offset, employeeId } = req.query;
            if (!employeeId) {
                res.status(400).json({ error: "Employee ID is required" });
                return;
            }
            const { requests, total } = await leave_request_service_1.leaveRequestService.getEmployeeLeaveRequests(employeeId, {
                status: status,
                limit: limit ? parseInt(limit) : undefined,
                offset: offset ? parseInt(offset) : undefined,
            });
            res.status(200).json({
                success: true,
                data: requests,
                total,
            });
        }
        catch (error) {
            console.error("Error fetching leave requests:", error);
            res.status(500).json({ error: error.message || "Internal server error" });
        }
    }
    async getLeaveRequestsToApprove(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const { status, limit, offset } = req.query;
            const { requests, total } = await leave_request_service_1.leaveRequestService.getApproverLeaveRequests(userId, {
                status: status,
                limit: limit ? parseInt(limit) : undefined,
                offset: offset ? parseInt(offset) : undefined,
            });
            res.status(200).json({
                success: true,
                data: requests,
                total,
            });
        }
        catch (error) {
            console.error("Error fetching leave requests to approve:", error);
            res.status(500).json({ error: error.message || "Internal server error" });
        }
    }
    async getLeaveRequestById(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const { id } = req.params;
            const leaveRequest = await leave_request_service_1.leaveRequestService.getLeaveRequestById(id);
            if (!leaveRequest) {
                res.status(404).json({ error: "Leave request not found" });
                return;
            }
            res.status(200).json({
                success: true,
                data: leaveRequest,
            });
        }
        catch (error) {
            console.error("Error fetching leave request:", error);
            res.status(500).json({ error: error.message || "Internal server error" });
        }
    }
    async approveLeaveRequest(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const { id } = req.params;
            const { comment } = req.body;
            const leaveRequest = await leave_request_service_1.leaveRequestService.approveLeaveRequest(id, userId, comment);
            res.status(200).json({
                success: true,
                data: leaveRequest,
                message: "Leave request approved successfully",
            });
        }
        catch (error) {
            console.error("Error approving leave request:", error);
            res.status(500).json({ error: error.message || "Internal server error" });
        }
    }
    async rejectLeaveRequest(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const { id } = req.params;
            const { comment } = req.body;
            const leaveRequest = await leave_request_service_1.leaveRequestService.rejectLeaveRequest(id, userId, comment);
            res.status(200).json({
                success: true,
                data: leaveRequest,
                message: "Leave request rejected successfully",
            });
        }
        catch (error) {
            console.error("Error rejecting leave request:", error);
            res.status(500).json({ error: error.message || "Internal server error" });
        }
    }
    async cancelLeaveRequest(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const { id } = req.params;
            const { employeeId } = req.body;
            if (!employeeId) {
                res.status(400).json({ error: "Employee ID is required" });
                return;
            }
            const leaveRequest = await leave_request_service_1.leaveRequestService.cancelLeaveRequest(id, employeeId);
            res.status(200).json({
                success: true,
                data: leaveRequest,
                message: "Leave request cancelled successfully",
            });
        }
        catch (error) {
            console.error("Error cancelling leave request:", error);
            res.status(500).json({ error: error.message || "Internal server error" });
        }
    }
    async getApprovers(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const approvers = await leave_request_service_1.leaveRequestService.getApprovers();
            res.status(200).json({
                success: true,
                data: approvers,
            });
        }
        catch (error) {
            console.error("Error fetching approvers:", error);
            res.status(500).json({ error: error.message || "Internal server error" });
        }
    }
}
exports.LeaveRequestController = LeaveRequestController;
exports.leaveRequestController = new LeaveRequestController();
//# sourceMappingURL=leave-request.controller.js.map