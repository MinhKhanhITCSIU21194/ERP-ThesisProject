import { Router } from "express";
import { leaveRequestController } from "../controllers/leave-request.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get approvers
router.get("/approvers", leaveRequestController.getApprovers);

// Get leave requests to approve (for managers)
router.get("/to-approve", leaveRequestController.getLeaveRequestsToApprove);

// Get my leave requests
router.get("/my-requests", leaveRequestController.getMyLeaveRequests);

// Get single leave request
router.get("/:id", leaveRequestController.getLeaveRequestById);

// Create leave request
router.post("/", leaveRequestController.createLeaveRequest);

// Approve leave request
router.patch("/:id/approve", leaveRequestController.approveLeaveRequest);

// Reject leave request
router.patch("/:id/reject", leaveRequestController.rejectLeaveRequest);

// Cancel leave request
router.patch("/:id/cancel", leaveRequestController.cancelLeaveRequest);

export default router;
