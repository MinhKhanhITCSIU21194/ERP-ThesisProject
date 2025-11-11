import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/hooks/useAuth";
import { paths } from "./paths";
import { Box } from "@mui/material";

type ProtectedRouteProps = {
  children: ReactNode;
  requiredRole?: string;
};

export const ProtectedRoute = ({
  children,
  requiredRole,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isAuthorized, user, sessionValid, isLoading } =
    useAuth();

  // Debug logging
  // Show loading while checking session OR while loading is true
  if (isLoading) {
    return (
      <Box
        sx={{
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          gap: 2,
          padding: 2,
        }}
      >
        Loading...
      </Box>
    );
  }

  // Important: Also wait if we haven't validated the session yet
  // This prevents redirecting to login before session validation completes
  if (!sessionValid && !isLoading) {
    return (
      <Box
        sx={{
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          gap: 2,
          padding: 2,
        }}
      >
        Checking authentication...
      </Box>
    );
  }

  if (isAuthenticated === false) {
    return <Navigate to={paths.auth.signIn} replace />;
  }

  if (requiredRole && !isAuthorized(requiredRole)) {
    alert("You do not have permission to access this page.");
    return <Navigate to={paths.dashboard.root} replace />;
  }
  return <>{children}</>;
};
