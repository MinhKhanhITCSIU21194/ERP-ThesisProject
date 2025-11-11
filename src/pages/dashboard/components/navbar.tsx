import React, { useState } from "react";
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
    path: "/dashboard/settings/department",
    requiredRole: UserPermission.DEPARTMENT_MANAGEMENT,
    canView: true,
  },
  { name: "Position", icon: PersonIcon, path: "/dashboard/settings/position" },
  {
    name: "Holiday",
    icon: CalendarMonthIcon,
    path: "/dashboard/settings/holiday",
    requiredRole: UserPermission.HOLIDAY_MANAGEMENT,
    canView: true,
  },
  {
    name: "Leave Type",
    icon: CategoryIcon,
    path: "/dashboard/settings/leave-type",
    requiredRole: UserPermission.LEAVE_TYPE_MANAGEMENT,
    canView: true,
  },
  {
    name: "User Management",
    icon: ManageAccountsIcon,
    path: "/dashboard/settings/user",
    requiredRole: UserPermission.USER_MANAGEMENT,
    canView: true,
  },
  {
    name: "Role",
    icon: SecurityIcon,
    path: "/dashboard/settings/role",
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

function Navbar() {
  const { user } = useAppSelector(selectAuth);
  const [hovered, setHovered] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();

  const handleTabClick = (tabName: string, hasSubTabs: boolean) => {
    if (hasSubTabs) {
      setOpenDropdown(openDropdown === tabName ? null : tabName);
    }
  };

  const handleMouseEnter = React.useCallback(() => {
    setHovered(true);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setHovered(false);
    setOpenDropdown(null); // Close dropdowns when mouse leaves
  }, []);

  return (
    <Box
      sx={{
        position: "relative",
        background: "#b0b0b0",
        transition: "width 0.2s ease-out",
        width: hovered ? 240 : 70,
        minWidth: 70,
        zIndex: 100,
        boxShadow: 2,
        overflowX: "hidden",
        overflowY: "auto",
        willChange: "width", // Optimize for width transitions
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
          {TABS.map((tab) => {
            if (
              user?.role.permissions.some(
                (permission) =>
                  permission.permission == tab.requiredRole &&
                  permission.canView == tab.canView
              )
            ) {
              const isActive = location.pathname.startsWith(
                tab.path || `/dashboard/${tab.name.toLowerCase()}`
              );
              const hasSubTabs = tab.subTabs && tab.subTabs.length > 0;
              return (
                <Box key={tab.name}>
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
                            opacity: hovered ? 1 : 0,
                            transition: "opacity 0.2s ease-out",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            display: hovered ? "flex" : "none",
                            alignItems: "center",
                            flex: 1,
                            willChange: "opacity",
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
                            opacity: hovered ? 1 : 0,
                            transition: "opacity 0.2s ease-out",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            display: hovered ? "flex" : "none",
                            alignItems: "center",
                            flex: 1,
                            willChange: "opacity",
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
                    <Collapse
                      in={openDropdown === tab.name && hovered}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List sx={{ pl: 2, bgcolor: "#c0c0c0" }}>
                        {tab.subTabs
                          .filter((sub) => {
                            if (!sub.requiredRole) return true;
                            return user?.role.permissions.some(
                              (permission) =>
                                permission.permission === sub.requiredRole &&
                                permission.canView === sub.canView
                            );
                          })
                          .map((sub) => (
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
                              <ListItemIcon
                                sx={{ minWidth: 0, mr: 1.5, color: "#222" }}
                              >
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
          })}
        </List>
      </Box>
    </Box>
  );
}

export default Navbar;
