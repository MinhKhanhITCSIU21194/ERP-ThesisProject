import {
  Paper,
  Box,
  Typography,
  Stack,
  Select,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Button,
  Alert,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import CustomDatePicker from "../../../../components/DatePicker";
import { useAppDispatch, useAppSelector } from "../../../../../redux/store";
import { selectAuth } from "../../../../../redux/auth/auth.slice";
import {
  selectLeaveRequest,
  resetLeaveRequestState,
} from "../../../../../redux/leave-request/leave-request.slice";
import {
  createLeaveRequest,
  getApprovers,
  getMyLeaveRequests,
} from "../../../../../services/leave-request.service";
import { LeaveType } from "../../../../../data/employee/leave-request";

function RequestLeaveView() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);
  const { approvers, isLoading, error, success } =
    useAppSelector(selectLeaveRequest);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [requestLeaveType, setRequestLeaveType] = useState<LeaveType>(
    LeaveType.VACATION
  );
  const [leavePeriodStartDate, setLeavePeriodStartDate] = useState<number>(1);
  const [leavePeriodEndDate, setLeavePeriodEndDate] = useState<number>(1);
  const [reasonForLeave, setReasonForLeave] = useState<string>("");
  const [approverId, setApproverId] = useState<string>("");

  useEffect(() => {
    dispatch(getApprovers());
  }, [dispatch]);

  const handleSubmit = async () => {
    if (!user?.employeeId || !startDate || !endDate || !approverId) {
      console.error("Missing required fields:", {
        employeeId: user?.employeeId,
        startDate,
        endDate,
        approverId,
      });
      return;
    }

    try {
      const result = await dispatch(
        createLeaveRequest({
          employeeId: user.employeeId,
          startDate: startDate.format("YYYY-MM-DD"),
          endDate: endDate.format("YYYY-MM-DD"),
          leavePeriodStartDate,
          leavePeriodEndDate,
          totalDays: daysOfLeave,
          leaveType: requestLeaveType,
          reason: reasonForLeave,
          approverId,
        })
      ).unwrap();

      // Refetch the leave requests list
      if (user?.employeeId) {
        dispatch(
          getMyLeaveRequests({
            employeeId: user.employeeId,
            limit: 10,
            offset: 0,
          })
        );
      }

      // Reset form
      setStartDate(null);
      setEndDate(null);
      setLeavePeriodStartDate(1);
      setLeavePeriodEndDate(1);
      setReasonForLeave(LeaveType.VACATION);
      setApproverId("");

      // Reset success/error state after a delay
      setTimeout(() => {
        dispatch(resetLeaveRequestState());
      }, 3000);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit leave request:", error);
    }
  };
  const isValid = useMemo(() => {
    if (!startDate || !endDate || !reasonForLeave || !approverId) return false;
    return true;
  }, [startDate, endDate, reasonForLeave, approverId]);
  const isSameDay = useMemo(() => {
    if (!startDate || !endDate) return false;
    return startDate.isSame(endDate, "day");
  }, [startDate, endDate]);

  const daysOfLeave = useMemo(() => {
    if (!startDate || !endDate) return 0;

    if (isSameDay) {
      // Same day - only use start date period
      return leavePeriodStartDate;
    } else {
      // Different days - calculate total days
      const totalDays = endDate.diff(startDate, "day") + 1;

      // If only one day, return the period
      if (totalDays === 1) return leavePeriodStartDate;

      // Calculate: (full days between) + start period + end period
      const fullDaysBetween = totalDays - 2; // Exclude start and end days
      const startPeriod = leavePeriodStartDate;
      const endPeriod = leavePeriodEndDate;

      return fullDaysBetween + startPeriod + endPeriod;
    }
  }, [startDate, endDate, leavePeriodStartDate, leavePeriodEndDate, isSameDay]);

  return (
    <Box
      sx={{
        p: 3,
        display: "inline-flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: 3,
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Submit a new leave request for approval
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        {isSubmitted && (
          <Alert severity="success">
            Leave request submitted successfully!
          </Alert>
        )}
        <Box sx={{ display: "flex", gap: 3 }}>
          <Stack spacing={3} sx={{ width: 250 }}>
            <CustomDatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              minDate={dayjs()}
              required
            />
            <FormControl fullWidth>
              <InputLabel id="leave-period-start-label">
                Leave Period of Start Day
              </InputLabel>
              <Select
                labelId="leave-period-start-label"
                name="leavePeriodStartDate"
                value={leavePeriodStartDate}
                onChange={(e) =>
                  setLeavePeriodStartDate(e.target.value as number)
                }
                label="Leave Period of Start Day"
              >
                <MenuItem value={1}>All Day</MenuItem>
                <MenuItem value={0.5}>Half Day</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="leave-reason-label">Reason for Leave</InputLabel>
              <Select
                labelId="leave-reason-label"
                name="leaveType"
                value={requestLeaveType}
                onChange={(e) =>
                  setRequestLeaveType(e.target.value as LeaveType)
                }
                label="Leave Type"
              >
                <MenuItem value={LeaveType.SICK}>Sick Leave</MenuItem>
                <MenuItem value={LeaveType.PERSONAL}>Personal Leave</MenuItem>
                <MenuItem value={LeaveType.VACATION}>Vacation</MenuItem>
                <MenuItem value={LeaveType.OTHER}>Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="approver-label">Select Approver</InputLabel>
              <Select
                labelId="approver-label"
                name="approver"
                value={approverId}
                onChange={(e) => setApproverId(e.target.value)}
                label="Select Approver"
              >
                {approvers.map((approver) => (
                  <MenuItem key={approver.userId} value={approver.userId}>
                    {approver.fullName ||
                      `${approver.firstName} ${approver.lastName}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Stack spacing={3} sx={{ width: 250 }}>
            <CustomDatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              minDate={startDate || dayjs()}
              disabled={!startDate}
              required
            />
            {!isSameDay && (
              <FormControl fullWidth>
                <InputLabel id="leave-period-end-label">
                  Leave Period of End Day
                </InputLabel>
                <Select
                  labelId="leave-period-end-label"
                  name="leavePeriodEndDate"
                  value={leavePeriodEndDate}
                  onChange={(e) =>
                    setLeavePeriodEndDate(e.target.value as number)
                  }
                  label="Leave Period of End Day"
                  disabled={!endDate || isSameDay}
                >
                  <MenuItem value={1}>All Day</MenuItem>
                  <MenuItem value={0.5}>Half Day</MenuItem>
                </Select>
              </FormControl>
            )}
            <TextField
              name="daysOfLeave"
              label="Total Days of Leave"
              value={daysOfLeave}
              fullWidth
              disabled
            />
            <TextField
              name="reasonOfLeave"
              label="Reason for Leave"
              value={reasonForLeave}
              onChange={(e) => setReasonForLeave(e.target.value as string)}
              fullWidth
            />
            <Box
              sx={{
                display: "flex",
                width: "100%",
                gap: 2,
                justifyContent: "space-between",
              }}
            >
              <Button
                size="medium"
                sx={{ height: 50 }}
                variant="outlined"
                onClick={() => {
                  setEndDate(null);
                  setStartDate(null);
                  setLeavePeriodStartDate(1);
                  setLeavePeriodEndDate(1);
                  setReasonForLeave(LeaveType.VACATION);
                  setApproverId("");
                }}
                color="error"
              >
                Reset
              </Button>
              <Button
                size="medium"
                sx={{ height: 50, minWidth: 160 }}
                variant="contained"
                disabled={!isValid || isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? "Submitting..." : "Submit Leave Request"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export default RequestLeaveView;
