import { createAsyncThunk } from "@reduxjs/toolkit";
import { GET, POST, PUT, DELETE } from "./axios";

export const getPositionList = createAsyncThunk(
  "position/getPositionList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await GET("/positions");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch positions"
      );
    }
  }
);

export const getPositionById = createAsyncThunk(
  "position/getPositionById",
  async (positionId: string, { rejectWithValue }) => {
    try {
      const response = await GET(`/positions/${positionId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch position"
      );
    }
  }
);

export const createPosition = createAsyncThunk(
  "position/create",
  async (
    positionData: {
      name: string;
      description?: string;
      level?: string;
      code?: string;
      minSalary?: number;
      maxSalary?: number;
      salaryCurrency?: string;
      parentId?: string;
      requirements?: string;
      responsibilities?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await POST("/positions", positionData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create position"
      );
    }
  }
);

export const updatePosition = createAsyncThunk(
  "position/update",
  async (
    {
      positionId,
      positionData,
    }: {
      positionId: string;
      positionData: {
        name?: string;
        description?: string;
        level?: string;
        code?: string;
        minSalary?: number;
        maxSalary?: number;
        salaryCurrency?: string;
        parentId?: string;
        requirements?: string;
        responsibilities?: string;
        isActive?: boolean;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await PUT(`/positions/${positionId}`, positionData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update position"
      );
    }
  }
);

export const deletePosition = createAsyncThunk(
  "position/delete",
  async (positionId: string, { rejectWithValue }) => {
    try {
      const response = await DELETE(`/positions/${positionId}`);
      return { positionId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete position"
      );
    }
  }
);
