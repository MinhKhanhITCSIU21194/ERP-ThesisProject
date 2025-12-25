"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leave_request_controller_1 = require("../controllers/leave-request.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.get("/approvers", leave_request_controller_1.leaveRequestController.getApprovers);
router.get("/to-approve", leave_request_controller_1.leaveRequestController.getLeaveRequestsToApprove);
router.get("/my-requests", leave_request_controller_1.leaveRequestController.getMyLeaveRequests);
router.get("/:id", leave_request_controller_1.leaveRequestController.getLeaveRequestById);
router.post("/", leave_request_controller_1.leaveRequestController.createLeaveRequest);
router.patch("/:id/approve", leave_request_controller_1.leaveRequestController.approveLeaveRequest);
router.patch("/:id/reject", leave_request_controller_1.leaveRequestController.rejectLeaveRequest);
router.patch("/:id/cancel", leave_request_controller_1.leaveRequestController.cancelLeaveRequest);
exports.default = router;
//# sourceMappingURL=leave-requests.js.map