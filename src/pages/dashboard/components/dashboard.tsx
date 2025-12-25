import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { useAppSelector } from "../../../redux/store";
import { selectAuth } from "../../../redux/auth/auth.slice";

const Dashboard: React.FC = () => {
  const { user } = useAppSelector(selectAuth);
  console.log(user?.role);
  return (
    <Box sx={{ p: 3, width: "100%" }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Welcome back, {user?.fullName}!
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is your main dashboard. Use the navigation menu to access
          different sections of the application.
        </Typography>
        {user?.role && (
          <Typography variant="body2" sx={{ mt: 2 }}>
            Role: {user.role.name}
          </Typography>
        )}
      </Paper>

      {/* You can add more dashboard content here */}
    </Box>
  );
};

export default Dashboard;
