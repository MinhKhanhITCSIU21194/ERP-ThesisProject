import { Employee } from "../employee/employee";

export type Department = {
  isChild: boolean;
  id: string;
  name: string;
  manager?: Employee;
  orderNumber: number;
  parentId: string;
  childrenDepartment: Department[];
  employeeQuantity: number;
};

export type DepartmentResponse = {
  department: Department;
};

export type DepartmentsResponse = {
  departments: Department[];
  pageSize: number;
  pageIndex: number;
  count: number;
  employeeQuantity: number;
};

export type DepartmentRequest = {
  id?: string;
  name: string;
  managerId?: string;
  orderNumber: number;
  parentId: any;
  childrenDepartment: Department[];
};
