import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { CustomTable } from "../../../../components/Table";
import { useAppDispatch, useAppSelector } from "../../../../../redux/store";
import { selectAuth } from "../../../../../redux/auth/auth.slice";
import { selectLeaveRequest } from "../../../../../redux/leave-request/leave-request.slice";
import {
  getMyLeaveRequests,
  cancelLeaveRequest,
} from "../../../../../services/leave-request.service";
import {
  LeaveRequestStatus,
  LeaveType,
  LeaveRequest,
} from "../../../../../data/employee/leave-request";
import dayjs from "dayjs";

function LeaveRequestListView() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);
  const { myRequests, isLoading, totalMyRequests } =
    useAppSelector(selectLeaveRequest);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    request: LeaveRequest | null;
  }>({ open: false, request: null });

  useEffect(() => {
    if (user?.employeeId) {
      dispatch(
        getMyLeaveRequests({
          employeeId: user.employeeId,
          limit: paginationModel.pageSize,
          offset: paginationModel.page * paginationModel.pageSize,
        })
      );
    }
  }, [dispatch, user, paginationModel]);

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPaginationModel({ page, pageSize });
  };

  const handleCancelClick = (request: LeaveRequest) => {
    setActionDialog({ open: true, request });
  };

  const handleCancelConfirm = async () => {
    if (!actionDialog.request || !user?.employeeId) return;

    try {
      await dispatch(
        cancelLeaveRequest({
          id: actionDialog.request.leaveRequestId,
          employeeId: user.employeeId,
        })
      ).unwrap();

      // Refetch the list to get fresh data from backend
      dispatch(
        getMyLeaveRequests({
          employeeId: user.employeeId,
          limit: paginationModel.pageSize,
          offset: paginationModel.page * paginationModel.pageSize,
        })
      );

      setActionDialog({ open: false, request: null });
    } catch (error) {
      console.error("Cancel failed:", error);
    }
  };

  const getStatusColor = (status: LeaveRequestStatus) => {
    switch (status) {
      case LeaveRequestStatus.PENDING:
        return "warning";
      case LeaveRequestStatus.APPROVED:
        return "success";
      case LeaveRequestStatus.REJECTED:
        return "error";
      case LeaveRequestStatus.CANCELLED:
        return "default";
      default:
        return "default";
    }
  };

  const getLeaveTypeLabel = (type: LeaveType) => {
    switch (type) {
      case LeaveType.SICK:
        return "Sick Leave";
      case LeaveType.PERSONAL:
        return "Personal Leave";
      case LeaveType.VACATION:
        return "Vacation";
      case LeaveType.OTHER:
        return "Other";
      default:
        return type;
    }
  };

  const columns = [
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 1,
      valueGetter: (value: any, row: LeaveRequest) =>
        dayjs(row.startDate).format("MMM DD, YYYY"),
    },
    {
      field: "endDate",
      headerName: "End Date",
      flex: 1,
      valueGetter: (value: any, row: LeaveRequest) =>
        dayjs(row.endDate).format("MMM DD, YYYY"),
    },
    {
      field: "totalDays",
      headerName: "Days",
      flex: 0.5,
      align: "center" as const,
    },
    {
      field: "leaveType",
      headerName: "Type",
      flex: 1,
      valueGetter: (value: any, row: LeaveRequest) =>
        getLeaveTypeLabel(row.leaveType),
    },
    {
      field: "reason",
      headerName: "Reason",
      flex: 1.5,
      valueGetter: (value: any, row: LeaveRequest) => row.reason || "-",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params: any) => (
        <Chip
          label={params.row.status}
          color={getStatusColor(params.row.status)}
          size="small"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5,
      sortable: false,
      renderCell: (params: any) => {
        const request = params.row as LeaveRequest;
        if (request.status === LeaveRequestStatus.PENDING) {
          return (
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => handleCancelClick(request)}
            >
              Cancel
            </Button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          My Leave Requests
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          View your leave request history and status
        </Typography>
      </Box>

      <CustomTable
        checkboxSelection={false}
        columns={columns}
        rows={myRequests.map((req) => ({
          ...req,
          id: req.leaveRequestId,
        }))}
        loading={isLoading}
        paginationMode="server"
        rowCount={totalMyRequests}
        paginationModel={paginationModel}
        onPaginationChange={handlePaginationChange}
        sx={{}}
      />

      {/* Cancel Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, request: null })}
      >
        <DialogTitle>Cancel Leave Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to cancel this leave request?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setActionDialog({ open: false, request: null })}
          >
            No
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelConfirm}
          >
            Yes, Cancel Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default LeaveRequestListView;
