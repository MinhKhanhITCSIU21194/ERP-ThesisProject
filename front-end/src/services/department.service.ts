import { createAsyncThunk } from "@reduxjs/toolkit";
import { TableFilterState } from "../redux/store";
import { GET, DELETE, POST, PUT } from "./axios";

export const getDepartmentList = createAsyncThunk(
  "department/getDepartmentList",
  async (params?: TableFilterState) => {
    try {
      const response = await GET("/departments", { params });
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch department";
      return Promise.reject(message);
    }
  }
);

export const createDepartment = createAsyncThunk(
  "department/create",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await POST("/departments", data);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create department";
      return rejectWithValue(message);
    }
  }
);

export const updateDepartment = createAsyncThunk(
  "department/update",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await PUT(`/departments/${id}`, data);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update department";
      return rejectWithValue(message);
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  "department/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await DELETE(`/departments/${id}`);
      return { id, ...response.data };
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete department";
      return rejectWithValue(message);
    }
  }
);
