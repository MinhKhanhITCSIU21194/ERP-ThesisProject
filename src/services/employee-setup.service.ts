import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface ValidateTokenResponse {
  success: boolean;
  message?: string;
  data?: {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    employeeCode: string;
  };
}

export interface SetPasswordResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  user?: any;
}

export interface CompleteSetupResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Validate employee setup token
 */
export const validateSetupToken = async (
  token: string
): Promise<ValidateTokenResponse> => {
  try {
    const response = await axios.get(
      `${API_URL}/employee-setup/validate/${token}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to validate token"
    );
  }
};

/**
 * Set password for new employee
 */
export const setEmployeePassword = async (
  token: string,
  password: string
): Promise<SetPasswordResponse> => {
  try {
    const response = await axios.post(
      `${API_URL}/employee-setup/set-password`,
      { token, password },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to set password");
  }
};

/**
 * Complete employee setup with general information
 */
export const completeEmployeeSetup = async (
  token: string,
  employeeData: any
): Promise<CompleteSetupResponse> => {
  try {
    const response = await axios.put(
      `${API_URL}/employee-setup/complete`,
      { token, ...employeeData },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to complete setup"
    );
  }
};
