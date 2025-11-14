import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  IconButton,
  Typography,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SettingsIcon from "@mui/icons-material/Settings";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import GroupIcon from "@mui/icons-material/Group";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CategoryIcon from "@mui/icons-material/Category";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import SecurityIcon from "@mui/icons-material/Security";
import { UserPermission } from "../../../data/auth/role";
import { useAppSelector } from "../../../redux/store";
import { selectAuth } from "../../../redux/auth/auth.slice";

const EMPLOYEE_SUBTABS = [
  {
    name: "List of Employee",
    icon: GroupIcon,
    path: "/dashboard/employee/list",
    requiredRole: UserPermission.EMPLOYEE_MANAGEMENT,
    canView: true,
    canUpdate: true,
  },
  {
    name: "Contract Management",
    icon: WorkHistoryIcon,
    path: "/dashboard/employee/contract",
    requiredRole: UserPermission.CONTRACT_MANAGEMENT,
    canView: true,
  },
  {
    name: "Leave Requests",
    icon: EventBusyIcon,
    path: "/dashboard/employee/leave",
    requiredRole: UserPermission.LEAVE_MANAGEMENT,
    canView: true,
  },
];

const SETTINGS_SUBTABS = [
  {
    name: "Department",
    icon: ApartmentIcon,
    path: "/admin/settings/department",
    requiredRole: UserPermission.DEPARTMENT_MANAGEMENT,
    canView: true,
  },
  { name: "Position", icon: PersonIcon, path: "/admin/settings/position" },
  {
    name: "Holiday",
    icon: CalendarMonthIcon,
    path: "/admin/settings/holiday",
    requiredRole: UserPermission.HOLIDAY_MANAGEMENT,
    canView: true,
  },
  {
    name: "Leave Type",
    icon: CategoryIcon,
    path: "/admin/settings/leave-type",
    requiredRole: UserPermission.LEAVE_TYPE_MANAGEMENT,
    canView: true,
  },
  {
    name: "User Management",
    icon: ManageAccountsIcon,
    path: "/admin/settings/user",
    requiredRole: UserPermission.USER_MANAGEMENT,
    canView: true,
  },
  {
    name: "Role",
    icon: SecurityIcon,
    path: "/admin/settings/role",
    requiredRole: UserPermission.ROLE_MANAGEMENT,
    canView: true,
  },
];

const TABS = [
  {
    name: "Employee",
    icon: PeopleAltIcon,
    subTabs: EMPLOYEE_SUBTABS,
    requiredRole: UserPermission.EMPLOYEE_MANAGEMENT,
    canView: true,
  },
  {
    name: "Projects",
    icon: AssignmentIcon,
    path: "/dashboard/projects",
    subTabs: [],
    requiredRole: UserPermission.PROJECT_MANAGEMENT,
    canView: true,
  },
  {
    name: "Settings",
    icon: SettingsIcon,
    subTabs: SETTINGS_SUBTABS,
    requiredRole: UserPermission.USER_MANAGEMENT,
    canView: true,
  },
];

const NavbarItem = React.memo(
  ({ tab, user, location, hovered, openDropdown, handleTabClick }: any) => {
    const isActive = location.pathname.startsWith(
      tab.path || `/dashboard/${tab.name.toLowerCase()}`
    );
    const hasSubTabs = tab.subTabs && tab.subTabs.length > 0;

    return (
      <Box>
        <ListItem disablePadding>
          {tab.path ? (
            <ListItemButton
              component={Link}
              to={tab.path}
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: 2,
                bgcolor: isActive ? "#e0e0e0" : "transparent",
                "&:hover": { bgcolor: "#d0d0d0" },
                minHeight: 56,
                width: "100%",
                transition: "background-color 0.15s ease-out",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  width: 40,
                  display: "flex",
                  justifyContent: "center",
                  color: "#222",
                }}
              >
                <tab.icon />
              </ListItemIcon>
              <Box
                sx={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <ListItemText
                  primary={tab.name}
                  sx={{ color: "#222", fontWeight: 600, m: 0 }}
                />
              </Box>
            </ListItemButton>
          ) : (
            <ListItemButton
              onClick={() => handleTabClick(tab.name, hasSubTabs)}
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: 2,
                bgcolor: isActive ? "#e0e0e0" : "transparent",
                "&:hover": { bgcolor: "#d0d0d0" },
                minHeight: 56,
                width: "100%",
                transition: "background-color 0.15s ease-out",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  width: 40,
                  display: "flex",
                  justifyContent: "center",
                  color: "#222",
                }}
              >
                <tab.icon />
              </ListItemIcon>
              <Box
                sx={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <ListItemText
                  primary={tab.name}
                  sx={{ color: "#222", fontWeight: 600, m: 0 }}
                />
                {hasSubTabs &&
                  (openDropdown === tab.name ? (
                    <ArrowDropDownIcon sx={{ ml: 1 }} />
                  ) : (
                    <ArrowRightIcon sx={{ ml: 1 }} />
                  ))}
              </Box>
            </ListItemButton>
          )}
        </ListItem>
        {/* Dropdown for sub-tabs inside navbar */}
        {hasSubTabs && (
          <Collapse in={openDropdown === tab.name} timeout="auto" unmountOnExit>
            <List sx={{ pl: 2, bgcolor: "#c0c0c0" }}>
              {tab.subTabs
                .filter((sub: any) => {
                  if (!sub.requiredRole) return true;
                  return user?.role.permissions.some(
                    (permission: any) =>
                      permission.permission === sub.requiredRole &&
                      permission.canView === sub.canView
                  );
                })
                .map((sub: any) => (
                  <ListItemButton
                    key={sub.name}
                    component={Link}
                    to={sub.path}
                    sx={{
                      py: 1,
                      px: 2,
                      borderRadius: 1,
                      color: "#222",
                      fontSize: "0.875rem",
                      transition: "background-color 0.15s ease-out",
                      "&:hover": { bgcolor: "#d0d0d0" },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, mr: 1.5, color: "#222" }}>
                      <sub.icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={sub.name}
                      primaryTypographyProps={{
                        fontSize: "0.875rem",
                      }}
                    />
                  </ListItemButton>
                ))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  }
);

function Navbar() {
  const { user } = useAppSelector(selectAuth);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();

  const handleTabClick = useCallback((tabName: string, hasSubTabs: boolean) => {
    if (hasSubTabs) {
      setOpenDropdown((prev) => (prev === tabName ? null : tabName));
    }
  }, []);

  // Memoize filtered tabs to prevent re-filtering on every render
  const visibleTabs = useMemo(() => {
    return TABS.filter((tab) =>
      user?.role.permissions.some(
        (permission) =>
          permission.permission === tab.requiredRole &&
          permission.canView === tab.canView
      )
    );
  }, [user?.role.permissions]);

  return (
    <Box
      sx={{
        position: "relative",
        background: "#b0b0b0",
        width: 180,
        minWidth: 180,
        flexShrink: 0,
        zIndex: 100,
        boxShadow: 2,
        overflowX: "hidden",
        overflowY: "auto",
        // Reduce browser reflow cost
        contain: "layout style paint",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: 2,
        }}
      >
        <List sx={{ width: "100%" }}>
          {visibleTabs.map((tab) => (
            <NavbarItem
              key={tab.name}
              tab={tab}
              user={user}
              location={location}
              hovered={true}
              openDropdown={openDropdown}
              handleTabClick={handleTabClick}
            />
          ))}
        </List>
      </Box>
    </Box>
  );
}

export default Navbar;
