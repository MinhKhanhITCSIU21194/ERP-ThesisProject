import { Permission } from "./auth/role";

export type BaseResponse<T> = {
  data: T;
  success: boolean;
  message: string;
  session: Session;
};

export type Session = {
  userId: string;
  employeeId: string;
  roles: string[];
  permissions: Permission[];
  accessToken: string;
};

export type PaginatedResult<T> = {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
};
