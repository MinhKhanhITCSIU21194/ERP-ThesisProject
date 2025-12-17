import { Button } from "@mui/material";
import React from "react";
import { Permission, UserPermission } from "../../../data/auth/role";

interface CustomButtonProps {
  requiredPermission?: UserPermission;
  requiredAction?: keyof Permission; // e.g., "canCreate", "canUpdate", "canDelete"
  userPermissions?: Permission[];
  sx?: any;
  color?:
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning";
  variant?: "text" | "outlined" | "contained";
  size?: "small" | "medium" | "large";
  onClick?: () => void;
  content: string | React.ReactNode;
  [key: string]: any;
}

function CustomButton({
  requiredPermission,
  requiredAction,
  userPermissions = [],
  sx,
  color,
  variant,
  size,
  onClick,
  content,
  ...props
}: CustomButtonProps) {
  // Check if user has the required permission with the required action
  const hasPermission = React.useMemo(() => {
    // If no permission required, always show button
    if (!requiredPermission) {
      return true;
    }

    // If no permissions array provided, deny access
    if (!userPermissions || userPermissions.length === 0) {
      console.warn(
        `No permissions found for user. Required: ${requiredPermission}`
      );
      return false;
    }

    // Find the permission that matches the required permission
    const matchingPermission = userPermissions.find(
      (permission) => permission.permission === requiredPermission
    );

    // If permission not found, deny access
    if (!matchingPermission) {
      console.warn(
        `Permission ${requiredPermission} not found in user permissions`
      );
      return false;
    }

    // If no specific action required, just check if permission exists
    if (!requiredAction) {
      return true;
    }

    // Check if the specific action is allowed (e.g., canCreate, canUpdate, canDelete)
    const hasAction = matchingPermission[requiredAction] === true;
    if (!hasAction) {
      console.warn(
        `Action ${requiredAction} not allowed for ${requiredPermission}`
      );
    }
    return hasAction;
  }, [requiredPermission, requiredAction, userPermissions]);

  // Don't render button if permission check fails
  if (!hasPermission) {
    return null;
  }

  return (
    <Button
      size={size}
      color={color}
      sx={{ fontWeight: "bold", ...sx }}
      variant={variant}
      onClick={onClick}
      {...props}
    >
      {content}
    </Button>
  );
}

export default CustomButton;
