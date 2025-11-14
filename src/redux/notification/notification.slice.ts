import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Notification } from "../../data/notifications/notification";
import {
  getNotificationList,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
} from "../../services/notification";

export type NotificationState = {
  notifications: Notification[];
  unreadCount: number;
  totalCount?: number;
  success: boolean;
  isLoading: boolean;
  error?: string;
  hasMore: boolean;
};

export const initNotificationState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  success: false,
  isLoading: false,
  error: undefined,
  hasMore: true,
};

export const notificationSlice = createSlice({
  name: "notification",
  initialState: initNotificationState,
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.totalCount = 0;
      state.hasMore = true;
      state.error = undefined;
    },
    clearError: (state) => {
      state.error = undefined;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Add new notification to the beginning of the list (real-time)
      state.notifications.unshift(action.payload);
      if (state.totalCount !== undefined) {
        state.totalCount += 1;
      }
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    updateNotification: (state, action: PayloadAction<Notification>) => {
      const index = state.notifications.findIndex(
        (n) => n.notificationId === action.payload.notificationId
      );
      if (index !== -1) {
        const oldNotification = state.notifications[index];
        state.notifications[index] = action.payload;

        // Update unread count if read status changed
        if (!oldNotification.isRead && action.payload.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (oldNotification.isRead && !action.payload.isRead) {
          state.unreadCount += 1;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get notification list
      .addCase(getNotificationList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getNotificationList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.data || [];
        state.totalCount = action.payload.total || action.payload?.length;
        state.unreadCount = action.payload.unreadCount || 0;
        state.hasMore =
          (action.payload.data?.length || 0) < (action.payload.total || 0);
        state.success = true;
      })
      .addCase(getNotificationList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      // Get unread count
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count || 0;
      })
      .addCase(getUnreadCount.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(
          (n) => n.notificationId === action.payload.data?.notificationId
        );
        if (index !== -1 && action.payload.data) {
          const wasUnread = !state.notifications[index].isRead;
          state.notifications[index] = action.payload.data;
          if (wasUnread) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Mark all as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          isRead: true,
          readAt: new Date().toISOString(),
        }));
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notificationId = action.payload.notificationId;
        const notification = state.notifications.find(
          (n) => n.notificationId === notificationId
        );
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(
          (n) => n.notificationId !== notificationId
        );
        if (state.totalCount !== undefined) {
          state.totalCount = Math.max(0, state.totalCount - 1);
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Delete all read
      .addCase(deleteAllReadNotifications.fulfilled, (state) => {
        const readCount = state.notifications.filter((n) => n.isRead).length;
        state.notifications = state.notifications.filter((n) => !n.isRead);
        if (state.totalCount !== undefined) {
          state.totalCount = Math.max(0, state.totalCount - readCount);
        }
      })
      .addCase(deleteAllReadNotifications.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  clearNotifications,
  clearError,
  addNotification,
  updateNotification,
} = notificationSlice.actions;

export const selectNotification = (state: RootState) => state.notification;

export default notificationSlice.reducer;
