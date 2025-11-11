import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/navbar";
import { Box, Typography } from "@mui/material";
import Header from "./components/header";

// Map routes to their titles
const getPageTitle = (pathname: string): string => {
  const routes: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/employee/list": "Employees List",
    "/dashboard/employee/contract": "Contract Management",
    "/dashboard/employee/leave": "Leave Requests",
    "/dashboard/projects": "Projects",
    "/dashboard/settings/department": "Department Management",
    "/dashboard/settings/position": "Position Management",
    "/dashboard/settings/holiday": "Holiday Management",
    "/dashboard/settings/leave-type": "Leave Type Management",
    "/dashboard/settings/user": "User Management",
    "/dashboard/settings/role": "Role Management",
  };

  return routes[pathname] || "Dashboard";
};

export const DashboardLayout = () => {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {/* Header stays fixed at the top */}
      <Header />

      {/* Main content area with Navbar and dynamic content */}
      <Box sx={{ display: "flex", flexGrow: 1, flexDirection: "row" }}>
        {/* Navbar stays fixed on the left */}
        <Navbar />

        {/* Dynamic content area - this changes based on the route */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: "auto",
            bgcolor: "#f5f5f5",
          }}
        >
          {/* Dynamic page title based on current route */}
          <Typography
            variant="h5"
            sx={{ p: 3, pb: 0, fontWeight: 600, color: "#222" }}
          >
            {pageTitle}
          </Typography>
          <Outlet /> {/* This renders the current route's component */}
        </Box>
      </Box>
    </Box>
  );
};
