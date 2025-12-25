import { Request, Response } from "express";
import { leaveRequestService } from "../services/leave-request.service";
import { LeaveRequestStatus } from "../models/entities/leave-request";

export class LeaveRequestController {
  /**
   * Create a new leave request
   * POST /api/leave-requests
   */
  async createLeaveRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const {
        employeeId,
        startDate,
        endDate,
        leavePeriodStartDate,
        leavePeriodEndDate,
        totalDays,
        leaveType,
        reason,
        approverId,
      } = req.body;

      if (
        !employeeId ||
        !startDate ||
        !endDate ||
        !leaveType ||
        !approverId ||
        leavePeriodStartDate === undefined ||
        leavePeriodEndDate === undefined ||
        totalDays === undefined
      ) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const leaveRequest = await leaveRequestService.createLeaveRequest({
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
    } catch (error: any) {
      console.error("Error creating leave request:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  /**
   * Get leave requests for the authenticated employee
   * GET /api/leave-requests/my-requests
   */
  async getMyLeaveRequests(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { status, limit, offset, employeeId } = req.query;

      if (!employeeId) {
        res.status(400).json({ error: "Employee ID is required" });
        return;
      }

      const { requests, total } =
        await leaveRequestService.getEmployeeLeaveRequests(
          employeeId as string,
          {
            status: status as LeaveRequestStatus | undefined,
            limit: limit ? parseInt(limit as string) : undefined,
            offset: offset ? parseInt(offset as string) : undefined,
          }
        );

      res.status(200).json({
        success: true,
        data: requests,
        total,
      });
    } catch (error: any) {
      console.error("Error fetching leave requests:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  /**
   * Get leave requests to approve (for managers)
   * GET /api/leave-requests/to-approve
   */
  async getLeaveRequestsToApprove(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { status, limit, offset } = req.query;

      const { requests, total } =
        await leaveRequestService.getApproverLeaveRequests(userId, {
          status: status as LeaveRequestStatus | undefined,
          limit: limit ? parseInt(limit as string) : undefined,
          offset: offset ? parseInt(offset as string) : undefined,
        });

      res.status(200).json({
        success: true,
        data: requests,
        total,
      });
    } catch (error: any) {
      console.error("Error fetching leave requests to approve:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  /**
   * Get a single leave request by ID
   * GET /api/leave-requests/:id
   */
  async getLeaveRequestById(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { id } = req.params;

      const leaveRequest = await leaveRequestService.getLeaveRequestById(id);

      if (!leaveRequest) {
        res.status(404).json({ error: "Leave request not found" });
        return;
      }

      res.status(200).json({
        success: true,
        data: leaveRequest,
      });
    } catch (error: any) {
      console.error("Error fetching leave request:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  /**
   * Approve a leave request
   * PATCH /api/leave-requests/:id/approve
   */
  async approveLeaveRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { id } = req.params;
      const { comment } = req.body;

      const leaveRequest = await leaveRequestService.approveLeaveRequest(
        id,
        userId,
        comment
      );

      res.status(200).json({
        success: true,
        data: leaveRequest,
        message: "Leave request approved successfully",
      });
    } catch (error: any) {
      console.error("Error approving leave request:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  /**
   * Reject a leave request
   * PATCH /api/leave-requests/:id/reject
   */
  async rejectLeaveRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { id } = req.params;
      const { comment } = req.body;

      const leaveRequest = await leaveRequestService.rejectLeaveRequest(
        id,
        userId,
        comment
      );

      res.status(200).json({
        success: true,
        data: leaveRequest,
        message: "Leave request rejected successfully",
      });
    } catch (error: any) {
      console.error("Error rejecting leave request:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  /**
   * Cancel a leave request
   * PATCH /api/leave-requests/:id/cancel
   */
  async cancelLeaveRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

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

      const leaveRequest = await leaveRequestService.cancelLeaveRequest(
        id,
        employeeId
      );

      res.status(200).json({
        success: true,
        data: leaveRequest,
        message: "Leave request cancelled successfully",
      });
    } catch (error: any) {
      console.error("Error cancelling leave request:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  /**
   * Get all approvers (managers)
   * GET /api/leave-requests/approvers
   */
  async getApprovers(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const approvers = await leaveRequestService.getApprovers();

      res.status(200).json({
        success: true,
        data: approvers,
      });
    } catch (error: any) {
      console.error("Error fetching approvers:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }
}

export const leaveRequestController = new LeaveRequestController();
