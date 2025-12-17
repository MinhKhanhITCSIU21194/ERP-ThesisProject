import { Outlet, Navigate } from "react-router-dom";
import SignIn from "../pages/auth/sign-in";
import ForgotPassword from "../pages/auth/forgot-password";
import SetPassword from "../pages/auth/set-password";
import EmailVerification from "../pages/auth/email-verification";
import EmployeeSetup from "../pages/auth/employee-setup/employee-setup";

export const authRoutes = [
  {
    path: "",
    element: <Outlet />, // Layout cho auth pages
    children: [
      {
        index: true, // Default route cho /auth
        element: <Navigate to="sign-in" replace />,
      },
      {
        path: "sign-in",
        element: <SignIn />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "verify-email",
        element: <EmailVerification />,
      },
      {
        path: "reset-password",
        element: <SetPassword />,
      },
      {
        path: "employee-setup/:token",
        element: <EmployeeSetup />,
      },
    ],
  },
];
