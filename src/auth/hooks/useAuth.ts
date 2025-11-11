import { useAppDispatch, useAppSelector } from "../../redux/store";
import { selectAuth } from "../../redux/auth/auth.slice";
import { useEffect } from "react";
import { checkSession, logoutAsync } from "../../services/auth";
import { Permission, Role } from "../../data/auth/role";

/**
 * Custom hook to access Redux authentication state and actions
 * Updated to work with cookie-based authentication
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector(selectAuth);

  // Check session on hook initialization
  useEffect(() => {
    // Only check session if no user and session not validated yet
    if (!authState.user && !authState.sessionValid && !authState.isLoading) {
      dispatch(checkSession());
    }
  }, []); // ✅ Empty array - only run once on mount

  const handleLogout = () => {
    dispatch(logoutAsync());
  };

  const isAuthenticated = authState.sessionValid && !!authState.user;

  const isAuthorized = (requiredRole: string) => {
    return (
      authState.user &&
      authState.user.role.permissions.some(
        (permission) =>
          permission.name === requiredRole ||
          permission.permission === requiredRole
      )
    );
  };

  return {
    // User data
    user: authState.user,
    isAuthenticated,
    success: authState.success,
    sessionValid: authState.sessionValid,

    // Loading and error states
    isLoading: authState.isLoading,
    error: authState.error,

    // Email check states
    emailChecked: authState.emailChecked,
    userName: authState.userName,

    // Actions
    logout: handleLogout,
    isAuthorized,
  };
};
