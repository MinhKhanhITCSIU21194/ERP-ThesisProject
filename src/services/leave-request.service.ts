import { AppDataSource } from "../config/typeorm";
import {
  LeaveRequest,
  LeaveRequestStatus,
  LeaveType,
} from "../models/entities/leave-request";
import { Employee } from "../models/entities/employee";
import { User } from "../models/entities/user";
import { notificationService } from "./notification.service";
import { NotificationType } from "../models/entities/notification";

class LeaveRequestService {
  private leaveRequestRepository = AppDataSource.getRepository(LeaveRequest);
  private employeeRepository = AppDataSource.getRepository(Employee);
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Create a new leave request
   */
  async createLeaveRequest(data: {
    employeeId: string;
    startDate: Date;
    endDate: Date;
    leavePeriodStartDate: number;
    leavePeriodEndDate: number;
    totalDays: number;
    leaveType: string;
    reason?: string;
    approverId: string;
  }): Promise<LeaveRequest> {
    // Verify employee exists
    const employee = await this.employeeRepository.findOne({
      where: { employeeId: data.employeeId },
      relations: ["user"],
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    // Verify approver exists
    const approver = await this.userRepository.findOne({
      where: { userId: data.approverId },
    });

    if (!approver) {
      throw new Error("Approver not found");
    }

    // Create leave request with proper type casting
    const leaveRequest = this.leaveRequestRepository.create({
      employeeId: data.employeeId,
      startDate: data.startDate,
      endDate: data.endDate,
      leavePeriodStartDate: data.leavePeriodStartDate,
      leavePeriodEndDate: data.leavePeriodEndDate,
      totalDays: data.totalDays,
      leaveType: data.leaveType as unknown as LeaveType,
      reason: data.reason,
      approverId: data.approverId,
      status: LeaveRequestStatus.PENDING,
    });

    const savedRequest = await this.leaveRequestRepository.save(leaveRequest);

    // Send notification to approver
    await notificationService.createNotification({
      title: "New Leave Request",
      message: `${employee.fullName} has requested ${
        data.totalDays
      } day(s) of leave from ${new Date(
        data.startDate
      ).toLocaleDateString()} to ${new Date(
        data.endDate
      ).toLocaleDateString()}`,
      type: NotificationType.INFO,
      recipientUserId: data.approverId,
      sentByUserId: employee.userId || undefined,
    });

    return savedRequest;
  }

  /**
   * Get leave requests for an employee
   */
  async getEmployeeLeaveRequests(
    employeeId: string,
    options?: {
      status?: LeaveRequestStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ requests: LeaveRequest[]; total: number }> {
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

  /**
   * Get leave requests for an approver
   */
  async getApproverLeaveRequests(
    approverId: string,
    options?: {
      status?: LeaveRequestStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ requests: any[]; total: number }> {
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

    // Map to flatten employee data
    const mappedRequests = requests.map((req: any) => ({
      ...req,
      employeeName: req.employee
        ? `${req.employee.firstName} ${req.employee.lastName}`
        : "N/A",
      employee: undefined, // Remove nested employee object
    }));

    return { requests: mappedRequests, total };
  }

  /**
   * Get a single leave request by ID
   */
  async getLeaveRequestById(
    leaveRequestId: string
  ): Promise<LeaveRequest | null> {
    return await this.leaveRequestRepository.findOne({
      where: { leaveRequestId },
      relations: ["employee", "approver"],
    });
  }

  /**
   * Approve a leave request
   */
  async approveLeaveRequest(
    leaveRequestId: string,
    approverId: string,
    comment?: string
  ): Promise<LeaveRequest> {
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

    // Send notification to employee
    if (leaveRequest.employee.userId) {
      await notificationService.createNotification({
        title: "Leave Request Approved",
        message: `Your leave request from ${new Date(
          leaveRequest.startDate
        ).toLocaleDateString()} to ${new Date(
          leaveRequest.endDate
        ).toLocaleDateString()} has been approved${
          comment ? `: ${comment}` : ""
        }`,
        type: NotificationType.SUCCESS,
        recipientUserId: leaveRequest.employee.userId,
        sentByUserId: approverId,
      });
    }

    return updatedRequest;
  }

  /**
   * Reject a leave request
   */
  async rejectLeaveRequest(
    leaveRequestId: string,
    approverId: string,
    comment?: string
  ): Promise<LeaveRequest> {
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

    // Send notification to employee
    if (leaveRequest.employee.userId) {
      await notificationService.createNotification({
        title: "Leave Request Rejected",
        message: `Your leave request from ${new Date(
          leaveRequest.startDate
        ).toLocaleDateString()} to ${new Date(
          leaveRequest.endDate
        ).toLocaleDateString()} has been rejected${
          comment ? `: ${comment}` : ""
        }`,
        type: NotificationType.ERROR,
        recipientUserId: leaveRequest.employee.userId,
        sentByUserId: approverId,
      });
    }

    return updatedRequest;
  }

  /**
   * Cancel a leave request (by employee)
   */
  async cancelLeaveRequest(
    leaveRequestId: string,
    employeeId: string
  ): Promise<LeaveRequest> {
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

    // Send notification to approver
    await notificationService.createNotification({
      title: "Leave Request Cancelled",
      message: `${
        leaveRequest.employee.fullName
      } has cancelled their leave request from ${new Date(
        leaveRequest.startDate
      ).toLocaleDateString()} to ${new Date(
        leaveRequest.endDate
      ).toLocaleDateString()}`,
      type: NotificationType.INFO,
      recipientUserId: leaveRequest.approverId,
      sentByUserId: leaveRequest.employee.userId || undefined,
    });

    return updatedRequest;
  }

  /**
   * Get all managers (potential approvers)
   */
  async getApprovers(): Promise<User[]> {
    // Get all employees who are managers in departments
    const managers = await this.employeeRepository
      .createQueryBuilder("employee")
      .leftJoinAndSelect("employee.user", "user")
      .leftJoinAndSelect("employee.departments", "dept")
      .where("dept.isManager = :isManager", { isManager: true })
      .andWhere("user.userId IS NOT NULL")
      .getMany();

    return managers
      .filter((emp: Employee) => emp.user)
      .map((emp: Employee) => emp.user as User);
  }
}

export const leaveRequestService = new LeaveRequestService();
