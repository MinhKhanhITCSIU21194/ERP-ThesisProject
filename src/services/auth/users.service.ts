import { createAsyncThunk } from "@reduxjs/toolkit";
import { TableFilterState } from "../../redux/store";
import { GET } from "../axios";

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
