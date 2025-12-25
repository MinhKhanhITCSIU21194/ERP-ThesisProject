import { createAsyncThunk } from "@reduxjs/toolkit";
import { GET, POST, PUT, DELETE, PATCH } from "./axios";
import { GetNotificationsParams } from "../data/notifications/notification";

// GET - Fetch notification list with pagination
export const getNotificationList = createAsyncThunk(
  "notification/get-list",
  async (params: GetNotificationsParams | undefined, { rejectWithValue }) => {
    try {
      const response = await GET("/notifications", { params });
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch notifications";
      return rejectWithValue(message);
    }
  }
);

// GET - Fetch unread notification count
export const getUnreadCount = createAsyncThunk(
  "notification/get-unread-count",
  async (_, { rejectWithValue }) => {
    try {
      const response = await GET("/notifications/unread-count");
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch unread count";
      return rejectWithValue(message);
    }
  }
);

// PATCH - Mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  "notification/mark-as-read",
  async (notificationId: number, { rejectWithValue }) => {
    try {
      const response = await PATCH(`/notifications/${notificationId}/read`, {});
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to mark notification as read";
      return rejectWithValue(message);
    }
  }
);

// PATCH - Mark all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk(
  "notification/mark-all-as-read",
  async (_, { rejectWithValue }) => {
    try {
      const response = await PATCH("/notifications/read-all", {});
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to mark all as read";
      return rejectWithValue(message);
    }
  }
);

// DELETE - Delete notification
export const deleteNotification = createAsyncThunk(
  "notification/delete",
  async (notificationId: number, { rejectWithValue }) => {
    try {
      const response = await DELETE(`/notifications/${notificationId}`);
      return { data: response.data, notificationId };
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete notification";
      return rejectWithValue(message);
    }
  }
);

// DELETE - Delete all read notifications
export const deleteAllReadNotifications = createAsyncThunk(
  "notification/delete-all-read",
  async (_, { rejectWithValue }) => {
    try {
      const response = await DELETE("/notifications/read");
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete read notifications";
      return rejectWithValue(message);
    }
  }
);

// POST - Create notification (for testing/admin)
export const createNotification = createAsyncThunk(
  "notification/create",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await POST("/notifications", data);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create notification";
      return rejectWithValue(message);
    }
  }
);
