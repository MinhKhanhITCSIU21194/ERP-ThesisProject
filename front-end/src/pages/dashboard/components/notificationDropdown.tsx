import React, { useEffect, useState } from "react";
import {
  Popover,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Button,
  Badge,
  Chip,
  CircularProgress,
  Menu,
  MenuItem,
  Stack,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import {
  selectNotification,
  clearError,
} from "../../../redux/notification/notification.slice";
import {
  getNotificationList,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
} from "../../../services/notification";
import {
  Notification,
  NotificationType,
} from "../../../data/notifications/notification";

// Helper function to format relative time
const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
};

interface NotificationDropdownProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  anchorEl,
  open,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, isLoading, hasMore, error, totalCount } =
    useAppSelector(selectNotification);

  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  useEffect(() => {
    if (open) {
      dispatch(getNotificationList({ limit: 20 }));
    }
  }, [open, dispatch]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await dispatch(markNotificationAsRead(notification.notificationId));
    }
    // You can add navigation logic here based on notification type/data
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllNotificationsAsRead());
  };

  const handleDeleteAllRead = async () => {
    await dispatch(deleteAllReadNotifications());
  };

  const handleLoadMore = () => {
    dispatch(
      getNotificationList({
        limit: 20,
        offset: notifications.length,
      })
    );
  };

  const handleActionMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    notification: Notification
  ) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedNotification(null);
  };

  const handleDeleteNotification = async () => {
    if (selectedNotification) {
      await dispatch(deleteNotification(selectedNotification.notificationId));
      handleActionMenuClose();
    }
  };

  const handleMarkAsRead = async () => {
    if (selectedNotification && !selectedNotification.isRead) {
      await dispatch(
        markNotificationAsRead(selectedNotification.notificationId)
      );
      handleActionMenuClose();
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return <CheckCircleIcon sx={{ color: "success.main" }} />;
      case NotificationType.WARNING:
        return <WarningIcon sx={{ color: "warning.main" }} />;
      case NotificationType.ERROR:
        return <ErrorIcon sx={{ color: "error.main" }} />;
      default:
        return <InfoIcon sx={{ color: "info.main" }} />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return "success";
      case NotificationType.WARNING:
        return "warning";
      case NotificationType.ERROR:
        return "error";
      default:
        return "info";
    }
  };

  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              width: 400,
              maxHeight: 600,
              mt: 1.5,
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6">Notifications</Typography>
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                size="small"
                color="primary"
                sx={{ height: 20, minWidth: 20 }}
              />
            )}
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Actions */}
        <Box
          sx={{
            px: 2,
            py: 1,
            display: "flex",
            gap: 1,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Button
            size="small"
            variant="text"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || isLoading}
          >
            Mark all read
          </Button>
          <Button
            size="small"
            variant="text"
            color="error"
            onClick={handleDeleteAllRead}
            disabled={
              notifications.filter((n) => n.isRead).length === 0 || isLoading
            }
          >
            Clear read
          </Button>
        </Box>

        {/* Notifications List */}
        <Box sx={{ maxHeight: 400, overflow: "auto" }}>
          {isLoading && notifications.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
              }}
            >
              <CircularProgress size={40} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
                gap: 1,
              }}
            >
              <NotificationsIcon
                sx={{ fontSize: 48, color: "text.disabled" }}
              />
              <Typography variant="body2" color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.notificationId}>
                  <ListItemButton
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      bgcolor: notification.isRead
                        ? "transparent"
                        : "action.hover",
                      "&:hover": {
                        bgcolor: notification.isRead
                          ? "action.hover"
                          : "action.selected",
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ width: "100%" }}>
                      {/* Icon */}
                      <Box sx={{ pt: 0.5 }}>
                        {getNotificationIcon(notification.type)}
                      </Box>

                      {/* Content */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: notification.isRead ? 400 : 600,
                            mb: 0.5,
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            mb: 0.5,
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="caption" color="text.disabled">
                            {getRelativeTime(notification.createdAt)}
                          </Typography>
                          {!notification.isRead && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: "primary.main",
                              }}
                            />
                          )}
                        </Box>
                      </Box>

                      {/* Action Menu */}
                      <Box>
                        <IconButton
                          size="small"
                          onClick={(e) => handleActionMenuOpen(e, notification)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Stack>
                  </ListItemButton>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Load More */}
        {hasMore && notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1, textAlign: "center" }}>
              <Button
                size="small"
                variant="text"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load more"}
              </Button>
            </Box>
          </>
        )}

        {/* Error */}
        {error && (
          <Box sx={{ p: 2, bgcolor: "error.lighter" }}>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </Box>
        )}
      </Popover>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        {selectedNotification && !selectedNotification.isRead && (
          <MenuItem onClick={handleMarkAsRead}>Mark as read</MenuItem>
        )}
        <MenuItem
          onClick={handleDeleteNotification}
          sx={{ color: "error.main" }}
        >
          Delete
        </MenuItem>
      </Menu>
    </>
  );
};

export default NotificationDropdown;
