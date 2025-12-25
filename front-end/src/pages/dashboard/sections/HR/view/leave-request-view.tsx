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
import { selectLeaveRequest } from "../../../../../redux/leave-request/leave-request.slice";
import {
  getLeaveRequestsToApprove,
  approveLeaveRequest,
  rejectLeaveRequest,
} from "../../../../../services/leave-request.service";
import {
  LeaveRequestStatus,
  LeaveType,
  LeaveRequest,
} from "../../../../../data/employee/leave-request";
import dayjs from "dayjs";

function LeaveRequestView() {
  const dispatch = useAppDispatch();
  const { requestsToApprove, isLoading, totalRequestsToApprove } =
    useAppSelector(selectLeaveRequest);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: "approve" | "reject" | null;
    request: LeaveRequest | null;
  }>({ open: false, type: null, request: null });
  const [comment, setComment] = useState("");

  useEffect(() => {
    dispatch(
      getLeaveRequestsToApprove({
        limit: paginationModel.pageSize,
        offset: paginationModel.page * paginationModel.pageSize,
      })
    );
  }, [dispatch, paginationModel]);

  useEffect(() => {
    console.log("Component received requestsToApprove:", requestsToApprove);
    console.log("Total requests:", requestsToApprove.length);
    const uniqueIds = new Set(requestsToApprove.map((r) => r.leaveRequestId));
    console.log("Unique request IDs:", uniqueIds.size);
    if (uniqueIds.size !== requestsToApprove.length) {
      console.error("DUPLICATE REQUEST IDs FOUND!");
    }
    requestsToApprove.forEach((req, idx) => {
      console.log(
        `Request ${idx} - ID: ${req.leaveRequestId}, EmployeeId: ${req.employeeId}, Status: ${req.status}`
      );
    });
  }, [requestsToApprove]);

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPaginationModel({ page, pageSize });
  };

  const handleActionClick = (
    type: "approve" | "reject",
    request: LeaveRequest
  ) => {
    setActionDialog({ open: true, type, request });
    setComment("");
  };

  const handleActionConfirm = async () => {
    if (!actionDialog.request) return;

    try {
      if (actionDialog.type === "approve") {
        await dispatch(
          approveLeaveRequest({
            id: actionDialog.request.leaveRequestId,
            comment,
          })
        ).unwrap();
      } else if (actionDialog.type === "reject") {
        await dispatch(
          rejectLeaveRequest({
            id: actionDialog.request.leaveRequestId,
            comment,
          })
        ).unwrap();
      }

      // Refetch the list to get fresh data from backend
      dispatch(
        getLeaveRequestsToApprove({
          limit: paginationModel.pageSize,
          offset: paginationModel.page * paginationModel.pageSize,
        })
      );

      setActionDialog({ open: false, type: null, request: null });
      setComment("");
    } catch (error) {
      console.error("Action failed:", error);
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
      field: "fullName",
      headerName: "Employee",
      flex: 1.5,
      valueGetter: (value: any, row: LeaveRequest) => row.employeeName || "N/A",
    },
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
      renderCell: (params: any) => {
        console.log(
          "Rendering status chip for row:",
          params.row.leaveRequestId,
          "Status:",
          params.row.status
        );
        return (
          <Chip
            label={params.row.status}
            color={getStatusColor(params.row.status)}
            size="small"
          />
        );
      },
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => handleActionClick("approve", request)}
              >
                Approve
              </Button>
              <Button
                size="small"
                variant="contained"
                color="error"
                onClick={() => handleActionClick("reject", request)}
              >
                Reject
              </Button>
            </Box>
          );
        }
        return null;
      },
    },
  ];

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Review and approve or reject leave requests from employees
        </Typography>
      </Box>

      <CustomTable
        checkboxSelection={false}
        columns={columns}
        rows={requestsToApprove.map((req) => ({
          ...req,
          id: req.leaveRequestId,
        }))}
        loading={isLoading}
        rowCount={totalRequestsToApprove}
        paginationModel={paginationModel}
        onPaginationChange={handlePaginationChange}
        sx={{}}
      />

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() =>
          setActionDialog({ open: false, type: null, request: null })
        }
      >
        <DialogTitle>
          {actionDialog.type === "approve" && "Approve Leave Request"}
          {actionDialog.type === "reject" && "Reject Leave Request"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to {actionDialog.type} this leave request?
          </Typography>
          <TextField
            fullWidth
            label="Comment (optional)"
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setActionDialog({ open: false, type: null, request: null })
            }
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={actionDialog.type === "approve" ? "success" : "error"}
            onClick={handleActionConfirm}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default LeaveRequestView;
