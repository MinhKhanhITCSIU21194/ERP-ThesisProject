import { createAsyncThunk } from "@reduxjs/toolkit";
import { TableFilterState } from "../../redux/store";
import { GET, POST, PUT, DELETE } from "../axios";
import { RoleRequest } from "../../data/auth/role";

export const getRoleList = createAsyncThunk(
  "role/get-list",
  async (params: TableFilterState, { rejectWithValue }) => {
    try {
      const response = await GET("/roles", { params });
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch roles";
      return rejectWithValue(message);
    }
  }
);

export const getRoleById = createAsyncThunk(
  "role/get-by-id",
  async (roleId: string, { rejectWithValue }) => {
    try {
      const response = await GET(`/roles/${roleId}`);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch role";
      return rejectWithValue(message);
    }
  }
);

export const createRole = createAsyncThunk(
  "role/create",
  async (roleData: RoleRequest, { rejectWithValue }) => {
    try {
      const response = await POST("/roles", roleData);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create role";
      return rejectWithValue(message);
    }
  }
);

export const updateRole = createAsyncThunk(
  "role/update",
  async (
    { roleId, roleData }: { roleId: string; roleData: Partial<RoleRequest> },
    { rejectWithValue }
  ) => {
    try {
      const response = await PUT(`/roles/${roleId}`, roleData);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update role";
      return rejectWithValue(message);
    }
  }
);

export const deleteRole = createAsyncThunk(
  "role/delete",
  async (roleId: string, { rejectWithValue }) => {
    try {
      const response = await DELETE(`/roles/${roleId}`);
      return { roleId, ...response.data };
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete role";
      return rejectWithValue(message);
    }
  }
);

export const getAllPermissions = createAsyncThunk(
  "role/get-permissions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await GET("/roles/permissions");
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch permissions";
      return rejectWithValue(message);
    }
  }
);
