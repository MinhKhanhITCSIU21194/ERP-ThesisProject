import { Employee } from "../employee/employee";

export enum DepartmentType {
  Operation = "Operation",
  Delivery = "Delivery",
}

export const departmentTypes = Object.values(DepartmentType);

export type Department = {
  isChild: boolean;
  id: string;
  name: string;
  manager?: Employee;
  orderNumber: number;
  parentId: string;
  childrenDepartment: Department[];
  employeeQuantity: number;
  type: string;
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
  type: string;
  childrenDepartment: Department[];
};
