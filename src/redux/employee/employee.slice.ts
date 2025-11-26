import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Employee, LeaveRecord } from "../../data/employee/employee";
import { getEmployeeList } from "../../services/employee.service";

export type EmployeeState = {
  employees: Employee[];
  leaveRecords?: LeaveRecord[];
  totalCount?: number;
  selectedEmployee?: Employee;
  employee?: Employee;
  success: boolean;
  isLoading: boolean;
  error?: string;
};

export const initEmployeeState: EmployeeState = {
  employees: [],
  success: false,
  isLoading: false,
  error: undefined,
};

export const employeeSlice = createSlice({
  name: "employee",
  initialState: initEmployeeState,
  reducers: {
    setSelectedEmployee: (state, action) => {
      state.selectedEmployee = action.payload;
    },
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getEmployeeList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getEmployeeList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employees = action.payload.data;
        state.totalCount = action.payload?.total || action.payload?.length;
        state.success = true;
      })
      .addCase(getEmployeeList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export const selectEmployee = (state: RootState) => state.employee;

export default employeeSlice.reducer;
