import { createAsyncThunk } from "@reduxjs/toolkit";
import { TableFilterState } from "../../redux/store";
import { GET, PATCH, POST, PUT } from "../axios";

export const getUserList = createAsyncThunk(
  "user/get-list",
  async (params: TableFilterState, { rejectWithValue }) => {
    try {
      const response = await GET("/users", { params });
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch users";
      return rejectWithValue(message);
    }
  }
);

export const createUser = createAsyncThunk(
  "user/create",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await POST("/users", data);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create user";
      return rejectWithValue(message);
    }
  }
);

export const updateUser = createAsyncThunk(
  "user/update",
  async (
    { userId, data }: { userId: string; data: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await PUT(`/users/${userId}`, data);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update user";
      return rejectWithValue(message);
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  "user/update-status",
  async (
    { userId, isActive }: { userId: string; isActive: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await PATCH(`/users/${userId}/status`, { isActive });
      return { userId, isActive, ...response.data };
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update user status";
      return rejectWithValue(message);
    }
  }
);

export const resendUserSetup = createAsyncThunk(
  "user/resend-setup",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await POST(`/users/${userId}/resend-setup`, {});
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to resend setup email";
      return rejectWithValue(message);
    }
  }
);
