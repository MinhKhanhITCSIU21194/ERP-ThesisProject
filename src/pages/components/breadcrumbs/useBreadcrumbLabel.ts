import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface BreadcrumbOverride {
  [path: string]: string;
}

// Global store for dynamic breadcrumb labels
const breadcrumbOverrides: BreadcrumbOverride = {};

/**
 * Hook to set custom breadcrumb labels for the current route
 * Useful for showing entity names instead of IDs
 *
 * @example
 * // In a component that displays a specific employee
 * useBreadcrumbLabel(`Employee: ${employee.firstName} ${employee.lastName}`);
 *
 * // Or with multiple segments
 * useBreadcrumbLabel({
 *   '/dashboard/employee/contract/123': 'Contract: John Doe - Software Engineer',
 * });
 */
export const useBreadcrumbLabel = (label: string | BreadcrumbOverride) => {
  const location = useLocation();

  useEffect(() => {
    if (typeof label === "string") {
      breadcrumbOverrides[location.pathname] = label;
    } else {
      Object.assign(breadcrumbOverrides, label);
    }

    // Cleanup on unmount
    return () => {
      if (typeof label === "string") {
        delete breadcrumbOverrides[location.pathname];
      } else {
        Object.keys(label).forEach((key) => {
          delete breadcrumbOverrides[key];
        });
      }
    };
  }, [label, location.pathname]);
};

/**
 * Get custom breadcrumb label for a path
 */
export const getBreadcrumbOverride = (path: string): string | undefined => {
  return breadcrumbOverrides[path];
};
