import axiosInstance from "../../utils/axios";
import { CONFIG } from "../../config-global";
import { Account } from "../../data/auth/auth";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { VerificationProps } from "../../auth/view/email-verification-view";

type SignInFirstRequest = {
  email: string;
  name: string;
};

type ChangePasswordRequest = {
  email?: string;
  newPassword: string;
  confirmPassword: string;
  uuID?: string;
};

export const checkEmailExists = createAsyncThunk(
  "auth/check-email",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/auth/check-email`, {
        email,
      });
      return response.data;
    } catch (error: any) {
      console.error("Error checking email existence:", error);

      // Extract meaningful error message from your backend response format
      const errorMessage =
        error.response?.data?.message || "Failed to check email";

      return rejectWithValue(errorMessage);
    }
  }
);

export const requestSignIn = createAsyncThunk(
  "auth/sign-in",
  async (para: Account, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/auth/sign-in`, para);
      return {
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        sessionId: response.data.sessionId,
      };
    } catch (error: any) {
      console.error("Error signing in:", error);

      // Extract meaningful error message from your backend response format
      const errorMessage = error.response?.data?.message || "Sign in failed";
      return rejectWithValue(errorMessage);
    }
  }
);

export const requestEmailVerification = createAsyncThunk(
  "auth/send-verification",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/auth/send-verification`, {
        email,
      });
      return response.data;
    } catch (error: any) {
      console.error("Error requesting email verification:", error);

      // Extract meaningful error message from your backend response format
      const errorMessage =
        error.response?.data?.message || "Email verification request failed";

      return rejectWithValue(errorMessage);
    }
  }
);

export const verifyEmailCode = createAsyncThunk(
  "auth/verify-code",
  async (params: VerificationProps, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/auth/verify-code`, params);
      return response.data;
    } catch (error: any) {
      console.error("Error verifying email code:", error);

      // Extract meaningful error message from your backend response format
      const errorMessage =
        error.response?.data?.message || "Email verification failed";

      return rejectWithValue(errorMessage);
    }
  }
);
// Check session validity
export const checkSession = createAsyncThunk(
  "auth/checkSession",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/auth/validate-session");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Session invalid"
      );
    }
  }
);

// Logout action
export const logoutAsync = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post("/auth/logout");
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (params: ChangePasswordRequest, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/reset-password", params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Change password failed"
      );
    }
  }
);
