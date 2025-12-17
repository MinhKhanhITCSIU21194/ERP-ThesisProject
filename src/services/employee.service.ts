import { createAsyncThunk } from "@reduxjs/toolkit";
import { TableFilterState } from "../redux/store";
import { Employee } from "../data/employee/employee";
import { GET, POST, PUT, DELETE } from "./axios";
import AxiosInstance from "./axios";
import axios from "axios";
import { saveAs } from "file-saver";
export interface GetEmployeesByDepartmentParams {
  departmentId: string;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface EmployeeListResponse {
  success: boolean;
  data: Employee[];
  total: number;
}

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
  async (id: string, { rejectWithValue }) => {
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
    { id, data }: { id: string; data: Partial<Employee> },
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
  async (id: string, { rejectWithValue }) => {
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

// Export employees to Excel
export const exportEmployees = async (params: TableFilterState) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    const response = await axios.get(`${apiUrl}/employees/export`, {
      params,
      withCredentials: true, // Use cookie-based authentication
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileName = `employees_${new Date().toISOString().split("T")[0]}.xlsx`;
    saveAs(blob, fileName);

    return { success: true, message: "Export successful" };
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to export employees"
    );
  }
};

// Import employees from Excel
export const importEmployees = async (file: File) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${apiUrl}/employees/import`, formData, {
      withCredentials: true, // Use cookie-based authentication
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    const errorData = error.response?.data;
    throw {
      message:
        errorData?.message || error.message || "Failed to import employees",
      errors: errorData?.errors || [],
    };
  }
};

export const getEmployeesByDepartment = async (
  params: GetEmployeesByDepartmentParams & { search?: string }
): Promise<EmployeeListResponse> => {
  const {
    departmentId,
    pageIndex = 0,
    pageSize = 100,
    sortBy,
    sortOrder,
    search,
  } = params;

  const response = await AxiosInstance.get(
    `/employees/department/${departmentId}`,
    {
      params: {
        pageIndex,
        pageSize,
        sortBy,
        sortOrder,
        search,
      },
    }
  );

  return response.data;
};
export const getEmployeeByIdService = async (
  employeeId: string
): Promise<{ success: boolean; data: Employee; message: string }> => {
  const response = await AxiosInstance.get(`/employees/${employeeId}`);
  return response.data;
};

export const getEmployeesByManager = async (
  managerId: string,
  params?: { pageIndex?: number; pageSize?: number; search?: string }
): Promise<EmployeeListResponse> => {
  const { pageIndex = 0, pageSize = 100, search } = params || {};
  const response = await AxiosInstance.get(`/employees/manager/${managerId}`, {
    params: { pageIndex, pageSize, search },
  });
  return response.data;
};
