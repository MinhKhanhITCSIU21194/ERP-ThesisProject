import axios from "../axios";
import { Employee } from "../../data/employee/employee";

export interface GetEmployeesByDepartmentParams {
  department: string;
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

export const getEmployeesByDepartment = async (
  params: GetEmployeesByDepartmentParams & { search?: string }
): Promise<EmployeeListResponse> => {
  const {
    department,
    pageIndex = 0,
    pageSize = 100,
    sortBy,
    sortOrder,
    search,
  } = params;

  const response = await axios.get(`/employees/department/${department}`, {
    params: {
      pageIndex,
      pageSize,
      sortBy,
      sortOrder,
      search,
    },
  });

  return response.data;
};

export const getAllEmployees = async (params?: {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
}): Promise<EmployeeListResponse> => {
  const response = await axios.get("/employees", {
    params: {
      pageIndex: params?.pageIndex || 0,
      pageSize: params?.pageSize || 100,
      search: params?.search,
    },
  });

  return response.data;
};

export const getEmployeeById = async (
  employeeId: string
): Promise<{ success: boolean; data: Employee }> => {
  const response = await axios.get(`/employees/${employeeId}`);
  return response.data;
};
