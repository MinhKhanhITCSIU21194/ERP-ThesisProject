import { Role } from "./role";

export type Account = {
  email: string;
  password: string;
};
export type User = {
  firstName: string;
  lastName: string;
  fullName: string;
  userId: string;
  email: string;
  isEmailVerified: boolean;
  role: Role;
  accessToken: string;
  refreshToken: string;
  employeeID: string;
};
export enum UserStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  DISABLED = "DISABLED",
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
export interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}
