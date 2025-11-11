import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { authSlice } from "./auth/auth.slice";
import { employeeSlice } from "./auth/employee.slice";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    employee: employeeSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch<AppDispatch>;

export const useAppSelector = useSelector.withTypes<RootState>();

export type StateStatus = "idle" | "loading" | "success" | "failed";

export type ModalState = {
  open: boolean;
  objectId?: string;
  mode: "add" | "update";
};

export type TableFilterState = {
  pageIndex: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  sortBy?: string;
  orderBy?: string;
};
