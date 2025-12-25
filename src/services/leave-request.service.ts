import { createAsyncThunk } from "@reduxjs/toolkit";
import { GET, POST, PATCH } from "./axios";
import {
  CreateLeaveRequestData,
  LeaveRequestResponse,
  LeaveRequestListResponse,
  ApproversResponse,
  LeaveRequest,
  ApproverUser,
  LeaveRequestStatus,
} from "../data/employee/leave-request";

// Create leave request
export const createLeaveRequest = createAsyncThunk<
  LeaveRequest,
  CreateLeaveRequestData,
  { rejectValue: string }
>(
  "leaveRequest/create",
  async (data: CreateLeaveRequestData, { rejectWithValue }) => {
    try {
      const response = await POST<LeaveRequestResponse>(
        "/leave-requests",
        data
      );
      return response.data.data;
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "Failed to create leave request";
      return rejectWithValue(message);
    }
  }
);

// Get my leave requests
export const getMyLeaveRequests = createAsyncThunk<
  LeaveRequestListResponse,
  {
    employeeId: string;
    status?: LeaveRequestStatus;
    limit?: number;
    offset?: number;
  },
  { rejectValue: string }
>(
  "leaveRequest/getMyRequests",
  async ({ employeeId, status, limit, offset }, { rejectWithValue }) => {
    try {
      const params: any = { employeeId };
      if (status) params.status = status;
      if (limit) params.limit = limit;
      if (offset) params.offset = offset;

      const response = await GET<LeaveRequestListResponse>(
        "/leave-requests/my-requests",
        { params }
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch leave requests";
      return rejectWithValue(message);
    }
  }
);

// Get leave requests to approve
export const getLeaveRequestsToApprove = createAsyncThunk<
  LeaveRequestListResponse,
  { status?: LeaveRequestStatus; limit?: number; offset?: number },
  { rejectValue: string }
>(
  "leaveRequest/getRequestsToApprove",
  async ({ status, limit, offset }, { rejectWithValue }) => {
    try {
      const params: any = {};
      if (status) params.status = status;
      if (limit) params.limit = limit;
      if (offset) params.offset = offset;

      const response = await GET<LeaveRequestListResponse>(
        "/leave-requests/to-approve",
        { params }
      );
      console.log("Backend response for to-approve:", response.data);
      console.log("First request status:", response.data.data[0]?.status);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch leave requests to approve";
      return rejectWithValue(message);
    }
  }
);

// Approve leave request
export const approveLeaveRequest = createAsyncThunk<
  LeaveRequest,
  { id: string; comment?: string },
  { rejectValue: string }
>("leaveRequest/approve", async ({ id, comment }, { rejectWithValue }) => {
  try {
    const response = await PATCH<LeaveRequestResponse>(
      `/leave-requests/${id}/approve`,
      { comment }
    );
    return response.data.data;
  } catch (error: any) {
    const message =
      error.response?.data?.error ||
      error.message ||
      "Failed to approve leave request";
    return rejectWithValue(message);
  }
});

// Reject leave request
export const rejectLeaveRequest = createAsyncThunk<
  LeaveRequest,
  { id: string; comment?: string },
  { rejectValue: string }
>("leaveRequest/reject", async ({ id, comment }, { rejectWithValue }) => {
  try {
    const response = await PATCH<LeaveRequestResponse>(
      `/leave-requests/${id}/reject`,
      { comment }
    );
    return response.data.data;
  } catch (error: any) {
    const message =
      error.response?.data?.error ||
      error.message ||
      "Failed to reject leave request";
    return rejectWithValue(message);
  }
});

// Cancel leave request
export const cancelLeaveRequest = createAsyncThunk<
  LeaveRequest,
  { id: string; employeeId: string },
  { rejectValue: string }
>("leaveRequest/cancel", async ({ id, employeeId }, { rejectWithValue }) => {
  try {
    const response = await PATCH<LeaveRequestResponse>(
      `/leave-requests/${id}/cancel`,
      { employeeId }
    );
    return response.data.data;
  } catch (error: any) {
    const message =
      error.response?.data?.error ||
      error.message ||
      "Failed to cancel leave request";
    return rejectWithValue(message);
  }
});

// Get approvers
export const getApprovers = createAsyncThunk<
  ApproverUser[],
  void,
  { rejectValue: string }
>("leaveRequest/getApprovers", async (_, { rejectWithValue }) => {
  try {
    const response = await GET<ApproversResponse>("/leave-requests/approvers");
    return response.data.data;
  } catch (error: any) {
    const message =
      error.response?.data?.error ||
      error.message ||
      "Failed to fetch approvers";
    return rejectWithValue(message);
  }
});
