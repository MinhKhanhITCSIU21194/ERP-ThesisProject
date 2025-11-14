import { createAsyncThunk } from "@reduxjs/toolkit";
import { TableFilterState } from "../redux/store";
import { GET } from "./axios";

export const getDepartmentList = createAsyncThunk(
  "department/",
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
