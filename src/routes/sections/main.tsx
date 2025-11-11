import React from "react";
import { DashboardLayout } from "../../pages/dashboard";
import { ProtectedRoute } from "../protectedRoutes";
import Dashboard from "../../pages/dashboard/components/dashboard";
import Projects from "../../pages/dashboard/sections/Projects/view/project-list-view";
import EmployeeListView from "../../pages/dashboard/sections/HR/view/employee-list-view";
import ContractListView from "../../pages/dashboard/sections/HR/view/contract-list-view";
import DepartmentListView from "../../pages/dashboard/sections/Admin/view/department-list-view";

export const dashboardRoutes = [
  {
    path: "",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "projects",
        element: <Projects />,
      },
      // Add more routes here as you create new pages
      // Example:
      {
        path: "employee/list",
        element: <EmployeeListView />,
      },
      {
        path: "employee/contract",
        element: <ContractListView />,
      },
      {
        path: "settings/department",
        element: <DepartmentListView />,
      },
    ],
  },
];

export const adminRoutes = [];
