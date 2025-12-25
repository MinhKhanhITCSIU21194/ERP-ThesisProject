import { LeaveRequest, LeaveRequestStatus } from "../models/entities/leave-request";
import { User } from "../models/entities/user";
declare class LeaveRequestService {
    private leaveRequestRepository;
    private employeeRepository;
    private userRepository;
    createLeaveRequest(data: {
        employeeId: string;
        startDate: Date;
        endDate: Date;
        leavePeriodStartDate: number;
        leavePeriodEndDate: number;
        totalDays: number;
        leaveType: string;
        reason?: string;
        approverId: string;
    }): Promise<LeaveRequest>;
    getEmployeeLeaveRequests(employeeId: string, options?: {
        status?: LeaveRequestStatus;
        limit?: number;
        offset?: number;
    }): Promise<{
        requests: LeaveRequest[];
        total: number;
    }>;
    getApproverLeaveRequests(approverId: string, options?: {
        status?: LeaveRequestStatus;
        limit?: number;
        offset?: number;
    }): Promise<{
        requests: any[];
        total: number;
    }>;
    getLeaveRequestById(leaveRequestId: string): Promise<LeaveRequest | null>;
    approveLeaveRequest(leaveRequestId: string, approverId: string, comment?: string): Promise<LeaveRequest>;
    rejectLeaveRequest(leaveRequestId: string, approverId: string, comment?: string): Promise<LeaveRequest>;
    cancelLeaveRequest(leaveRequestId: string, employeeId: string): Promise<LeaveRequest>;
    getApprovers(): Promise<User[]>;
}
export declare const leaveRequestService: LeaveRequestService;
export {};
//# sourceMappingURL=leave-request.service.d.ts.map