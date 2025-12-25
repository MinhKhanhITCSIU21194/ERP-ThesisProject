import { Request, Response } from "express";
export declare class LeaveRequestController {
    createLeaveRequest(req: Request, res: Response): Promise<void>;
    getMyLeaveRequests(req: Request, res: Response): Promise<void>;
    getLeaveRequestsToApprove(req: Request, res: Response): Promise<void>;
    getLeaveRequestById(req: Request, res: Response): Promise<void>;
    approveLeaveRequest(req: Request, res: Response): Promise<void>;
    rejectLeaveRequest(req: Request, res: Response): Promise<void>;
    cancelLeaveRequest(req: Request, res: Response): Promise<void>;
    getApprovers(req: Request, res: Response): Promise<void>;
}
export declare const leaveRequestController: LeaveRequestController;
//# sourceMappingURL=leave-request.controller.d.ts.map