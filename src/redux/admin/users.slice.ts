import { createSlice } from "@reduxjs/toolkit";
import { User } from "../../data/auth/auth";
import { RootState } from "../store";
import { getUserList } from "../../services/auth/users.service";

export type UserState = {
  users: User[];
  totalCount: number;
  success: boolean;
  isLoading: boolean;
  error?: string;
};
export const initUserState: UserState = {
  success: false,
  users: [],
  error: undefined,
  isLoading: false,
  totalCount: 0,
};

export const usersSlice = createSlice({
  name: "user",
  initialState: initUserState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUserList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.totalCount = action.payload?.totalCount;
        state.success = true;
      })
      .addCase(getUserList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export const selectUser = (state: RootState) => state.user;

export default usersSlice.reducer;
