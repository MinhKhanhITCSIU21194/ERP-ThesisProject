import { Paper } from "@mui/material";
import React from "react";
import LeaveRequestListView from "../components/leave-requests-list-view";
import RequestLeaveView from "../components/request-leave-view";

function EmployeeRequestLeaveView() {
  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        m: { xs: 1, sm: 2 },
        gap: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <RequestLeaveView />
      <LeaveRequestListView />
    </Paper>
  );
}

export default EmployeeRequestLeaveView;
