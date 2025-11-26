import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/navbar";
import { Box, Typography } from "@mui/material";
import Header from "./components/header";
import { Breadcrumbs } from "../components/breadcrumbs";

// Map routes to their titles
const getPageTitle = (pathname: string): string => {
  const routes: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/profile": "My Profile",
    "/dashboard/request-leave": "Request Leave",
    "/dashboard/employee/list": "Employees List",
    "/dashboard/employee/contract": "Contract Management",
    "/dashboard/employee/leave-requests": "Leave Requests",
    "/dashboard/projects": "Projects",
    "/admin/settings/department": "Department Management",
    "/admin/settings/position": "Position Management",
    "/admin/settings/holiday": "Holiday Management",
    "/admin/settings/leave-type": "Leave Type Management",
    "/admin/settings/user": "User Management",
    "/admin/settings/role": "Role Management",
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
          {/* Breadcrumbs navigation */}
          <Breadcrumbs />
          {/* Dynamic page title based on current route */}
          <Outlet /> {/* This renders the current route's component */}
        </Box>
      </Box>
    </Box>
  );
};
