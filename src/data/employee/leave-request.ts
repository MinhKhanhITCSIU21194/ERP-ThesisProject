export enum LeaveRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export enum LeaveType {
  SICK = "SICK",
  PERSONAL = "PERSONAL",
  VACATION = "VACATION",
  OTHER = "OTHER",
}

export type LeaveRequest = {
  leaveRequestId: string;
  employeeId: string;
  employeeName?: string; // For approver view - flattened employee name
  startDate: string;
  endDate: string;
  leavePeriodStartDate: number;
  leavePeriodEndDate: number;
  totalDays: number;
  leaveType: LeaveType;
  reason?: string;
  status: LeaveRequestStatus;
  approverId: string;
  approverComment?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateLeaveRequestData = {
  employeeId: string;
  startDate: string;
  endDate: string;
  leavePeriodStartDate: number;
  leavePeriodEndDate: number;
  totalDays: number;
  leaveType: LeaveType;
  reason?: string;
  approverId: string;
};

export type LeaveRequestResponse = {
  success: boolean;
  data: LeaveRequest;
  message?: string;
};

export type LeaveRequestListResponse = {
  success: boolean;
  data: LeaveRequest[];
  total: number;
};

export type ApproverUser = {
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
};

export type ApproversResponse = {
  success: boolean;
  data: ApproverUser[];
};
