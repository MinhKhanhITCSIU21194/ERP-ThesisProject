import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { authSlice } from "./auth/auth.slice";
import { employeeSlice } from "./employee/employee.slice";
import { departmentSlice } from "./admin/department.slice";
import { positionSlice } from "./admin/position.slice";
import notificationReducer from "./notification/notification.slice";
import { usersSlice } from "./admin/users.slice";
import { roleSlice } from "./auth/role.slice";
import { contractSlice } from "./employee/contract.slice";
import leaveRequestReducer from "./leave-request/leave-request.slice";
import projectReducer from "./project/project.slice";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    employee: employeeSlice.reducer,
    department: departmentSlice.reducer,
    position: positionSlice.reducer,
    notification: notificationReducer,
    user: usersSlice.reducer,
    role: roleSlice.reducer,
    contract: contractSlice.reducer,
    leaveRequest: leaveRequestReducer,
    project: projectReducer,
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
  search?: string;
};
