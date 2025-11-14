import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { selectAuth } from "../../../redux/auth/auth.slice";
import {
  Box,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  EventAvailable as EventAvailableIcon,
} from "@mui/icons-material";
import { logoutAsync } from "../../../services/auth";
import { Link, useNavigate } from "react-router-dom";
import { selectNotification } from "../../../redux/notification/notification.slice";
import { getUnreadCount } from "../../../services/notification";
import { useSocket } from "../../../context/socket-provider";
import NotificationDropdown from "./notificationDropdown";

function Header() {
  const AuthState = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { unreadCount } = useAppSelector(selectNotification);
  const { isConnected } = useSocket();

  const [notificationAnchor, setNotificationAnchor] =
    useState<HTMLElement | null>(null);
  const notificationOpen = Boolean(notificationAnchor);

  const [avatarAnchor, setAvatarAnchor] = useState<HTMLElement | null>(null);
  const avatarMenuOpen = Boolean(avatarAnchor);

  useEffect(() => {
    if (AuthState.accessToken && AuthState.user && isConnected) {
      const timer = setTimeout(() => {
        console.log("🔔 Fetching unread notification count");
        dispatch(getUnreadCount());
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [dispatch, AuthState.accessToken, AuthState.user, isConnected]);

  const handleLogout = async () => {
    await dispatch(logoutAsync());
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAvatarAnchor(event.currentTarget);
  };

  const handleAvatarMenuClose = () => {
    setAvatarAnchor(null);
  };

  const handleViewProfile = () => {
    handleAvatarMenuClose();
    navigate("/dashboard/profile");
  };

  const handleRequestLeave = () => {
    handleAvatarMenuClose();
    navigate("/dashboard/leave/request");
  };

  const handleLogoutClick = async () => {
    handleAvatarMenuClose();
    await handleLogout();
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Box
      sx={{
        display: "flex",
        background: "#b0b0b0",
        height: "70px",
        alignItems: "center",
      }}
    >
      <Link to="/dashboard">
        {" "}
        <img
          src="/src/assets/ERP.png"
          alt="Logo"
          style={{ width: 50, height: 50, borderRadius: 10, margin: 10 }}
        />
      </Link>
      <Box
        sx={{
          flexGrow: 1,
          width: "90%",
          justifyContent: "flex-end",
          display: "flex",
          alignItems: "center",
          gap: 1,
          pr: 2,
        }}
      >
        <IconButton
          onClick={handleNotificationClick}
          sx={{
            color: "black",
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: "primary.main",
              cursor: "pointer",
              "&:hover": {
                bgcolor: "primary.dark",
              },
            }}
          >
            {getInitials(AuthState.user?.fullName || AuthState.user?.email)}
          </Avatar>
        </IconButton>
      </Box>

      {/* Notification Dropdown */}
      <NotificationDropdown
        anchorEl={notificationAnchor}
        open={notificationOpen}
        onClose={handleNotificationClose}
      />

      {/* Avatar Menu Dropdown */}
      <Menu
        anchorEl={avatarAnchor}
        open={avatarMenuOpen}
        onClose={handleAvatarMenuClose}
        onClick={handleAvatarMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
            "& .MuiMenuItem-root": {
              px: 2,
              py: 1.5,
            },
          },
        }}
      >
        <MenuItem onClick={handleViewProfile}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleRequestLeave}>
          <ListItemIcon>
            <EventAvailableIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Request Leave</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogoutClick}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Log Out</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default Header;
