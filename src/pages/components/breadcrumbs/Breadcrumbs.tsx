import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  Box,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";
import { getBreadcrumbOverride } from "./useBreadcrumbLabel";

interface BreadcrumbConfig {
  label: string;
  path?: string;
}

interface RouteConfig {
  [key: string]:
    | BreadcrumbConfig
    | ((params: Record<string, string>) => BreadcrumbConfig);
}

// Define breadcrumb configuration for each route
const routeConfig: RouteConfig = {
  "/dashboard": { label: "Dashboard", path: "/dashboard" },

  // Projects
  "/dashboard/projects": { label: "Projects", path: "/dashboard/projects" },
  "/dashboard/projects/:id": (params) => ({
    label: `Project #${params.id}`,
    path: `/dashboard/projects/${params.id}`,
  }),
  "/dashboard/projects/tasks": {
    label: "Tasks",
    path: "/dashboard/projects/tasks",
  },
  "/dashboard/projects/tasks/:id": (params) => ({
    label: `Task #${params.name}`,
    path: `/dashboard/projects/tasks/${params.id}`,
  }),

  // Employee Management
  "/dashboard/employee/list": {
    label: "Employee List",
    path: "/dashboard/employee/list",
  },
  "/dashboard/employee/contract": {
    label: "Contracts",
    path: "/dashboard/employee/contract",
  },
  "/dashboard/employee/contract/:id": (params) => ({
    label: `Contract #${params.id}`,
    path: `/dashboard/employee/contract/${params.id}`,
  }),
  "/dashboard/employee/leave-requests": {
    label: "Leave Requests",
    path: "/dashboard/employee/leave-requests",
  },
  "/dashboard/request-leave": {
    label: "Request Leave",
    path: "/dashboard/request-leave",
  },

  // Admin Settings
  "/admin/settings/department": {
    label: "Departments",
    path: "/admin/settings/department",
  },
  "/admin/settings/position": {
    label: "Positions",
    path: "/admin/settings/position",
  },
  "/admin/settings/user": { label: "Users", path: "/admin/settings/user" },
  "/admin/settings/role": { label: "Roles", path: "/admin/settings/role" },
  "/admin/settings/holiday": {
    label: "Holidays",
    path: "/admin/settings/holiday",
  },
  "/admin/settings/leave-type": {
    label: "Leave Types",
    path: "/admin/settings/leave-type",
  },
};

// Helper function to extract params from pathname
const extractParams = (
  pathname: string,
  pattern: string
): Record<string, string> => {
  const params: Record<string, string> = {};
  const patternParts = pattern.split("/");
  const pathnameParts = pathname.split("/");

  patternParts.forEach((part, index) => {
    if (part.startsWith(":")) {
      const paramName = part.slice(1);
      params[paramName] = pathnameParts[index];
    }
  });

  return params;
};

// Match pathname to route config
const matchRoute = (pathname: string): BreadcrumbConfig | null => {
  // Try exact match first
  if (routeConfig[pathname]) {
    const config = routeConfig[pathname];
    return typeof config === "function" ? config({}) : config;
  }

  // Try pattern matching for dynamic routes
  for (const [pattern, config] of Object.entries(routeConfig)) {
    if (pattern.includes(":")) {
      const patternParts = pattern.split("/");
      const pathnameParts = pathname.split("/");

      if (patternParts.length === pathnameParts.length) {
        const isMatch = patternParts.every((part, index) => {
          return part.startsWith(":") || part === pathnameParts[index];
        });

        if (isMatch) {
          const params = extractParams(pathname, pattern);
          return typeof config === "function" ? config(params) : config;
        }
      }
    }
  }

  return null;
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Generate breadcrumb items
  const breadcrumbs: BreadcrumbConfig[] = [];
  let currentPath = "";

  // Always add home
  breadcrumbs.push({ label: "Home", path: "/dashboard" });

  // Build breadcrumbs from pathname segments
  pathnames.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const config = matchRoute(currentPath);

    // Skip if already added (avoid duplicates) or if no config found
    if (config && !breadcrumbs.some((b) => b.path === config.path)) {
      // Check for custom override label
      const overrideLabel = getBreadcrumbOverride(currentPath);
      if (overrideLabel) {
        breadcrumbs.push({ ...config, label: overrideLabel });
      } else {
        breadcrumbs.push(config);
      }
    }
  });

  // Don't show breadcrumbs if only home
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Box sx={{ mb: 2, px: 3, pt: 2 }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{
          "& .MuiBreadcrumbs-ol": {
            flexWrap: "nowrap",
          },
        }}
      >
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isHome = index === 0;

          if (isLast) {
            return (
              <Typography
                key={crumb.path || crumb.label}
                color="text.primary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                {isHome && <HomeIcon sx={{ mr: 0.5, fontSize: "1rem" }} />}
                {crumb.label}
              </Typography>
            );
          }

          return (
            <Link
              key={crumb.path || crumb.label}
              component={RouterLink}
              to={crumb.path || "#"}
              underline="hover"
              color="inherit"
              sx={{
                display: "flex",
                alignItems: "center",
                fontSize: "0.875rem",
                "&:hover": {
                  color: "primary.main",
                },
              }}
            >
              {isHome && <HomeIcon sx={{ mr: 0.5, fontSize: "1rem" }} />}
              {crumb.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};
