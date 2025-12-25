"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveRequestService = void 0;
const typeorm_1 = require("../config/typeorm");
const leave_request_1 = require("../models/entities/leave-request");
const employee_1 = require("../models/entities/employee");
const user_1 = require("../models/entities/user");
const notification_service_1 = require("./notification.service");
const notification_1 = require("../models/entities/notification");
class LeaveRequestService {
    constructor() {
        this.leaveRequestRepository = typeorm_1.AppDataSource.getRepository(leave_request_1.LeaveRequest);
        this.employeeRepository = typeorm_1.AppDataSource.getRepository(employee_1.Employee);
        this.userRepository = typeorm_1.AppDataSource.getRepository(user_1.User);
    }
    async createLeaveRequest(data) {
        const employee = await this.employeeRepository.findOne({
            where: { employeeId: data.employeeId },
            relations: ["user"],
        });
        if (!employee) {
            throw new Error("Employee not found");
        }
        const approver = await this.userRepository.findOne({
            where: { userId: data.approverId },
        });
        if (!approver) {
            throw new Error("Approver not found");
        }
        const leaveRequest = this.leaveRequestRepository.create({
            employeeId: data.employeeId,
            startDate: data.startDate,
            endDate: data.endDate,
            leavePeriodStartDate: data.leavePeriodStartDate,
            leavePeriodEndDate: data.leavePeriodEndDate,
            totalDays: data.totalDays,
            leaveType: data.leaveType,
            reason: data.reason,
            approverId: data.approverId,
            status: leave_request_1.LeaveRequestStatus.PENDING,
        });
        const savedRequest = await this.leaveRequestRepository.save(leaveRequest);
        await notification_service_1.notificationService.createNotification({
            title: "New Leave Request",
            message: `${employee.fullName} has requested ${data.totalDays} day(s) of leave from ${new Date(data.startDate).toLocaleDateString()} to ${new Date(data.endDate).toLocaleDateString()}`,
            type: notification_1.NotificationType.INFO,
            recipientUserId: data.approverId,
            sentByUserId: employee.userId || undefined,
        });
        return savedRequest;
    }
    async getEmployeeLeaveRequests(employeeId, options) {
        const queryBuilder = this.leaveRequestRepository
            .createQueryBuilder("leaveRequest")
            .leftJoinAndSelect("leaveRequest.employee", "employee")
            .leftJoinAndSelect("leaveRequest.approver", "approver")
            .where("leaveRequest.employeeId = :employeeId", { employeeId })
            .orderBy("leaveRequest.createdAt", "DESC");
        if (options?.status) {
            queryBuilder.andWhere("leaveRequest.status = :status", {
                status: options.status,
            });
        }
        const total = await queryBuilder.getCount();
        if (options?.limit) {
            queryBuilder.limit(options.limit);
        }
        if (options?.offset) {
            queryBuilder.offset(options.offset);
        }
        const requests = await queryBuilder.getMany();
        return { requests, total };
    }
    async getApproverLeaveRequests(approverId, options) {
        const queryBuilder = this.leaveRequestRepository
            .createQueryBuilder("leaveRequest")
            .leftJoin("leaveRequest.employee", "employee")
            .addSelect([
            "employee.employeeId",
            "employee.firstName",
            "employee.lastName",
        ])
            .where("leaveRequest.approverId = :approverId", { approverId })
            .orderBy("leaveRequest.createdAt", "DESC");
        if (options?.status) {
            queryBuilder.andWhere("leaveRequest.status = :status", {
                status: options.status,
            });
        }
        const total = await queryBuilder.getCount();
        if (options?.limit) {
            queryBuilder.limit(options.limit);
        }
        if (options?.offset) {
            queryBuilder.offset(options.offset);
        }
        const requests = await queryBuilder.getMany();
        const mappedRequests = requests.map((req) => ({
            ...req,
            employeeName: req.employee
                ? `${req.employee.firstName} ${req.employee.lastName}`
                : "N/A",
            employee: undefined,
        }));
        return { requests: mappedRequests, total };
    }
    async getLeaveRequestById(leaveRequestId) {
        return await this.leaveRequestRepository.findOne({
            where: { leaveRequestId },
            relations: ["employee", "approver"],
        });
    }
    async approveLeaveRequest(leaveRequestId, approverId, comment) {
        const leaveRequest = await this.getLeaveRequestById(leaveRequestId);
        if (!leaveRequest) {
            throw new Error("Leave request not found");
        }
        if (leaveRequest.approverId !== approverId) {
            throw new Error("You are not authorized to approve this request");
        }
        if (!leaveRequest.canBeModified()) {
            throw new Error("This leave request cannot be modified");
        }
        leaveRequest.approve(approverId, comment);
        const updatedRequest = await this.leaveRequestRepository.save(leaveRequest);
        if (leaveRequest.employee.userId) {
            await notification_service_1.notificationService.createNotification({
                title: "Leave Request Approved",
                message: `Your leave request from ${new Date(leaveRequest.startDate).toLocaleDateString()} to ${new Date(leaveRequest.endDate).toLocaleDateString()} has been approved${comment ? `: ${comment}` : ""}`,
                type: notification_1.NotificationType.SUCCESS,
                recipientUserId: leaveRequest.employee.userId,
                sentByUserId: approverId,
            });
        }
        return updatedRequest;
    }
    async rejectLeaveRequest(leaveRequestId, approverId, comment) {
        const leaveRequest = await this.getLeaveRequestById(leaveRequestId);
        if (!leaveRequest) {
            throw new Error("Leave request not found");
        }
        if (leaveRequest.approverId !== approverId) {
            throw new Error("You are not authorized to reject this request");
        }
        if (!leaveRequest.canBeModified()) {
            throw new Error("This leave request cannot be modified");
        }
        leaveRequest.reject(approverId, comment);
        const updatedRequest = await this.leaveRequestRepository.save(leaveRequest);
        if (leaveRequest.employee.userId) {
            await notification_service_1.notificationService.createNotification({
                title: "Leave Request Rejected",
                message: `Your leave request from ${new Date(leaveRequest.startDate).toLocaleDateString()} to ${new Date(leaveRequest.endDate).toLocaleDateString()} has been rejected${comment ? `: ${comment}` : ""}`,
                type: notification_1.NotificationType.ERROR,
                recipientUserId: leaveRequest.employee.userId,
                sentByUserId: approverId,
            });
        }
        return updatedRequest;
    }
    async cancelLeaveRequest(leaveRequestId, employeeId) {
        const leaveRequest = await this.getLeaveRequestById(leaveRequestId);
        if (!leaveRequest) {
            throw new Error("Leave request not found");
        }
        if (leaveRequest.employeeId !== employeeId) {
            throw new Error("You are not authorized to cancel this request");
        }
        if (!leaveRequest.canBeModified()) {
            throw new Error("This leave request cannot be cancelled");
        }
        leaveRequest.cancel();
        const updatedRequest = await this.leaveRequestRepository.save(leaveRequest);
        await notification_service_1.notificationService.createNotification({
            title: "Leave Request Cancelled",
            message: `${leaveRequest.employee.fullName} has cancelled their leave request from ${new Date(leaveRequest.startDate).toLocaleDateString()} to ${new Date(leaveRequest.endDate).toLocaleDateString()}`,
            type: notification_1.NotificationType.INFO,
            recipientUserId: leaveRequest.approverId,
            sentByUserId: leaveRequest.employee.userId || undefined,
        });
        return updatedRequest;
    }
    async getApprovers() {
        const managers = await this.employeeRepository
            .createQueryBuilder("employee")
            .leftJoinAndSelect("employee.user", "user")
            .leftJoinAndSelect("employee.departments", "dept")
            .where("dept.isManager = :isManager", { isManager: true })
            .andWhere("user.userId IS NOT NULL")
            .getMany();
        return managers
            .filter((emp) => emp.user)
            .map((emp) => emp.user);
    }
}
exports.leaveRequestService = new LeaveRequestService();
//# sourceMappingURL=leave-request.service.js.map