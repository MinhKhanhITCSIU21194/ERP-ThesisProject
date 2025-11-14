import React from "react";
import { DashboardLayout } from "../../pages/dashboard";
import { ProtectedRoute } from "../protectedRoutes";
import Dashboard from "../../pages/dashboard/components/dashboard";
import Projects from "../../pages/dashboard/sections/Projects/view/project-list-view";
import EmployeeListView from "../../pages/dashboard/sections/HR/view/employee-list-view";
import ContractListView from "../../pages/dashboard/sections/HR/view/contract-list-view";
import DepartmentListView from "../../pages/dashboard/sections/Admin/view/department-list-view";
import UserListView from "../../pages/dashboard/sections/Admin/view/user-list-view";
import RoleListView from "../../pages/dashboard/sections/Admin/view/role-list-view";
import PositionListView from "../../pages/dashboard/sections/Admin/view/position-list-view";
import EmployeeContractView from "../../pages/dashboard/sections/HR/view/employee/employee-contract-view";

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
        path: "employee/contract/:id",
        element: <EmployeeContractView />,
      },
    ],
  },
];

export const adminRoutes = [
  {
    path: "",
    element: (
      <ProtectedRoute requiredRole="Admin">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "settings/department",
        element: <DepartmentListView />,
      },
      {
        path: "settings/position",
        element: <PositionListView />,
      },
      {
        path: "settings/user",
        element: <UserListView />,
      },
      {
        path: "settings/role",
        element: <RoleListView />,
      },
    ],
  },
];
