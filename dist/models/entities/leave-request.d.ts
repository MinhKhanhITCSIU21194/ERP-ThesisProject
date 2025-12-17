import { Employee } from "./employee";
import { User } from "./user";
export declare enum LeaveRequestStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED"
}
export declare enum LeaveType {
    SICK = "SICK",
    PERSONAL = "PERSONAL",
    VACATION = "VACATION",
    OTHER = "OTHER"
}
export declare class LeaveRequest {
    leaveRequestId: string;
    employeeId: string;
    employee: Employee;
    startDate: Date;
    endDate: Date;
    leavePeriodStartDate: number;
    leavePeriodEndDate: number;
    totalDays: number;
    leaveType: LeaveType;
    reason?: string;
    status: LeaveRequestStatus;
    approverId: string;
    approver: User;
    approverComment?: string;
    approvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    approve(approverId: string, comment?: string): void;
    reject(approverId: string, comment?: string): void;
    cancel(): void;
    canBeModified(): boolean;
}
//# sourceMappingURL=leave-request.d.ts.map