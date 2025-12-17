import { EmployeeDepartment } from "./employee-department";
export declare class Department {
    id: string;
    name: string;
    description?: string;
    parentId?: string;
    parentDepartment?: Department;
    subDepartments?: Department[];
    employees: EmployeeDepartment[];
    isActive: boolean;
    code?: string;
    location?: string;
    managerId?: string;
    budget?: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    getFullPath(): string;
}
//# sourceMappingURL=department.d.ts.map