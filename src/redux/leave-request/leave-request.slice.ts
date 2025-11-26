import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  LeaveRequest,
  LeaveRequestStatus,
  ApproverUser,
} from "../../data/employee/leave-request";
import {
  createLeaveRequest,
  getMyLeaveRequests,
  getLeaveRequestsToApprove,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest,
  getApprovers,
} from "../../services/leave-request.service";

export interface LeaveRequestState {
  myRequests: LeaveRequest[];
  requestsToApprove: LeaveRequest[];
  approvers: ApproverUser[];
  isLoading: boolean;
  error: string | undefined;
  success: boolean;
  totalMyRequests: number;
  totalRequestsToApprove: number;
}

const initialState: LeaveRequestState = {
  myRequests: [],
  requestsToApprove: [],
  approvers: [],
  isLoading: false,
  error: undefined,
  success: false,
  totalMyRequests: 0,
  totalRequestsToApprove: 0,
};

const leaveRequestSlice = createSlice({
  name: "leaveRequest",
  initialState,
  reducers: {
    resetLeaveRequestState: (state) => {
      state.error = undefined;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    // Create leave request
    builder
      .addCase(createLeaveRequest.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
        state.success = false;
      })
      .addCase(createLeaveRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        // Don't add to myRequests here - let the list view refetch
        // This prevents showing stale or incorrect data
      })
      .addCase(createLeaveRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      });

    // Get my leave requests
    builder
      .addCase(getMyLeaveRequests.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getMyLeaveRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myRequests = action.payload.data;
        state.totalMyRequests = action.payload.total;
      })
      .addCase(getMyLeaveRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get leave requests to approve
    builder
      .addCase(getLeaveRequestsToApprove.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getLeaveRequestsToApprove.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log("Redux received requests:", action.payload.data);
        console.log("Total from backend:", action.payload.data.length);

        // Deduplicate by leaveRequestId just in case
        const uniqueRequests = Array.from(
          new Map(
            action.payload.data.map((req) => [req.leaveRequestId, req])
          ).values()
        );
        console.log("After deduplication:", uniqueRequests.length);

        state.requestsToApprove = uniqueRequests;
        state.totalRequestsToApprove = action.payload.total;
      })
      .addCase(getLeaveRequestsToApprove.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Approve leave request
    builder
      .addCase(approveLeaveRequest.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
        state.success = false;
      })
      .addCase(approveLeaveRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        // Don't update local state - let the component refetch for fresh data
      })
      .addCase(approveLeaveRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      });

    // Reject leave request
    builder
      .addCase(rejectLeaveRequest.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
        state.success = false;
      })
      .addCase(rejectLeaveRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        // Don't update local state - let the component refetch for fresh data
      })
      .addCase(rejectLeaveRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      });

    // Cancel leave request
    builder
      .addCase(cancelLeaveRequest.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
        state.success = false;
      })
      .addCase(cancelLeaveRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        // Don't update local state - let the component refetch for fresh data
      })
      .addCase(cancelLeaveRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      });

    // Get approvers
    builder
      .addCase(getApprovers.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getApprovers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.approvers = action.payload;
      })
      .addCase(getApprovers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetLeaveRequestState } = leaveRequestSlice.actions;
export const selectLeaveRequest = (state: {
  leaveRequest: LeaveRequestState;
}) => state.leaveRequest;
export default leaveRequestSlice.reducer;
