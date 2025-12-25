import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Department } from "../../data/employer/department";
import { getDepartmentList } from "../../services/department.service";

export type DepartmentState = {
  departments: Department[];
  totalCount?: number;
  success: boolean;
  isLoading: boolean;
  error?: string;
};

export const initDepartmentState: DepartmentState = {
  departments: [],
  success: false,
  isLoading: false,
  error: undefined,
};

export const departmentSlice = createSlice({
  name: "department",
  initialState: initDepartmentState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDepartmentList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDepartmentList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.departments = action.payload.data;
        state.totalCount = action.payload?.total || action.payload?.length;
        state.success = true;
      })
      .addCase(getDepartmentList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export const selectDepartment = (state: RootState) => state.department;

export default departmentSlice.reducer;
