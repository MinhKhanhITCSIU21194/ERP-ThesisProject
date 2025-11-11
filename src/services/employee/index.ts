import { createAsyncThunk } from "@reduxjs/toolkit";
import { TableFilterState } from "../../redux/store";
import { Employee } from "../../data/employee/employee";
import { GET, POST, PUT, DELETE } from "../axios";

// GET - Fetch employee list with pagination
export const getEmployeeList = createAsyncThunk(
  "employee/get-list",
  async (params: TableFilterState, { rejectWithValue }) => {
    try {
      const response = await GET("/employees", { params });
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch employees";
      return rejectWithValue(message);
    }
  }
);

// GET - Fetch single employee by ID
export const getEmployeeById = createAsyncThunk(
  "employee/get-by-id",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await GET(`/employees/${id}`);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch employee";
      return rejectWithValue(message);
    }
  }
);

// POST - Create new employee
export const createEmployee = createAsyncThunk(
  "employee/create",
  async (employeeData: Partial<Employee>, { rejectWithValue }) => {
    try {
      const response = await POST("/employees", employeeData);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create employee";
      return rejectWithValue(message);
    }
  }
);

// PUT - Update existing employee
export const updateEmployee = createAsyncThunk(
  "employee/update",
  async (
    { id, data }: { id: number; data: Partial<Employee> },
    { rejectWithValue }
  ) => {
    try {
      const response = await PUT(`/employees/${id}`, data);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update employee";
      return rejectWithValue(message);
    }
  }
);

// DELETE - Delete employee(s)
export const deleteEmployee = createAsyncThunk(
  "employee/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await DELETE(`/employees/${id}`);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete employee";
      return rejectWithValue(message);
    }
  }
);

// DELETE - Bulk delete employees
export const bulkDeleteEmployees = createAsyncThunk(
  "employee/bulk-delete",
  async (ids: number[], { rejectWithValue }) => {
    try {
      const response = await POST("/employees/bulk-delete", { ids });
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete employees";
      return rejectWithValue(message);
    }
  }
);
