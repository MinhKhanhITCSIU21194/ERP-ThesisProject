import React, { useEffect } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { paths } from "../paths";
import { authRoutes } from "../authRoutes";
import { ProtectedRoute } from "../protectedRoutes";
import { adminRoutes, dashboardRoutes } from "./main";
import { DashboardLayout } from "../../pages/dashboard";
import { AdminLayout } from "../../pages/admin";

function Router() {
  const routes = useRoutes([
    // Public routes (không cần authentication)
    {
      path: "/auth/*",
      children: authRoutes,
    },
    // Protected routes (cần authentication)
    {
      path: "/dashboard/*",
      children: dashboardRoutes,
    },
    // Admin only routes
    {
      path: "/admin/*",
      children: adminRoutes,
    },
    // Root redirect
    {
      path: "/",
      element: <Navigate to={paths.dashboard.root} replace />,
    },
  ]);

  return routes;
}
export default Router;
