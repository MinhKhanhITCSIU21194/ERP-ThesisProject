import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { User } from "../../data/auth/auth";
import {
  checkEmailExists,
  checkSession,
  logoutAsync,
  requestEmailVerification,
  requestSignIn,
  verifyEmailCode,
} from "../../services/auth";
import TokenService from "../../services/token.service";

export type AuthState = {
  success: boolean;
  user?: User;
  email?: string;
  error?: string;
  isLoading: boolean;
  emailChecked: boolean;
  userName?: string;
  sessionValid: boolean;
  accessToken?: string;
  refreshToken?: string;
};

export const initUserState: AuthState = {
  success: false,
  user: undefined,
  error: undefined,
  isLoading: false,
  emailChecked: false,
  userName: undefined,
  sessionValid: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState: initUserState,
  reducers: {
    logout: (state) => {
      state.success = false;
      state.isLoading = false;
      state.emailChecked = false;
      state.user = undefined;
      state.sessionValid = false;
      state.error = undefined;
      state.accessToken = undefined;
      state.refreshToken = undefined;
      // Clear tokens from localStorage
    },
    clearError: (state) => {
      state.error = undefined;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.success = true;
      state.sessionValid = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.sessionValid = true;
        state.error = undefined;
        // Tokens are stored in httpOnly cookies by server - no localStorage needed
      })
      .addCase(checkSession.rejected, (state, action) => {
        state.isLoading = false;
        state.success = false;
        state.user = undefined;
        state.sessionValid = true;
      })
      .addCase(logoutAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        // Even if server logout fails, clear local state
        state.success = false;
        state.isLoading = false;
        state.user = undefined;
        state.sessionValid = true;
        state.error = action.payload as string;
        state.accessToken = undefined;
        state.refreshToken = undefined;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.success = false;
        state.isLoading = false;
        state.emailChecked = false;
        state.user = undefined;
        state.sessionValid = true;
        state.error = undefined;
        state.accessToken = undefined;
        state.refreshToken = undefined;
      })
      .addCase(requestSignIn.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(requestSignIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.sessionValid = true;
        state.error = undefined;
        // Tokens are stored in httpOnly cookies by server - no localStorage needed
      })
      .addCase(requestSignIn.rejected, (state, action) => {
        state.isLoading = false;
        state.success = false;
        state.error = action.payload as string;
      })
      .addCase(checkEmailExists.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
        state.emailChecked = false;
      })
      .addCase(checkEmailExists.fulfilled, (state, action) => {
        state.isLoading = false;
        state.emailChecked = true;
        state.userName = action.payload.name;
        state.error = undefined;
      })
      .addCase(checkEmailExists.rejected, (state, action) => {
        state.isLoading = false;
        state.emailChecked = false;
        state.userName = undefined;
        state.error = action.payload as string;
      })
      .addCase(requestEmailVerification.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
        state.emailChecked = false;
      })
      .addCase(requestEmailVerification.fulfilled, (state, action) => {
        state.isLoading = false;
        state.email = action.payload.email;
        state.emailChecked = true;
        state.error = undefined;
      })
      .addCase(requestEmailVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.email = undefined;
        state.emailChecked = false;
        state.error = action.payload as string;
      })
      .addCase(verifyEmailCode.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(verifyEmailCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.emailChecked = true;
        state.user = action.payload.user;
        state.success = true;
        state.error = undefined;
        // Tokens are stored in httpOnly cookies by server - no localStorage needed
        if (action.payload.accessToken) {
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
        }
      })
      .addCase(verifyEmailCode.rejected, (state, action) => {
        state.isLoading = false;
        state.success = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;

export default authSlice.reducer;
