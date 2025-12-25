import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface ValidateUserTokenResponse {
  success: boolean;
  message?: string;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface CompleteUserSetupResponse {
  success: boolean;
  message: string;
}

/**
 * Validate user setup token
 */
export const validateUserSetupToken = async (
  token: string
): Promise<ValidateUserTokenResponse> => {
  try {
    const response = await axios.get(
      `${API_URL}/users/setup/validate/${token}`,
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
 * Complete user setup with password
 */
export const completeUserSetup = async (
  token: string,
  password: string
): Promise<CompleteUserSetupResponse> => {
  try {
    const response = await axios.post(
      `${API_URL}/users/setup/complete`,
      { token, password },
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
