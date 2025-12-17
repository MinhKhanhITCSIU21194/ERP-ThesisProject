import { Employee } from "./employee";
import { Department } from "./department";
export declare class EmployeeDepartment {
    id: string;
    employeeId: string;
    departmentId: string;
    employee: Employee;
    department: Department;
    isManager: boolean;
    isPrimary: boolean;
    startDate?: Date;
    endDate?: Date;
    role?: string;
    responsibilities?: string;
    isActive: boolean;
    createdBy?: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    isCurrentlyActive(): boolean;
}
//# sourceMappingURL=employee-department.d.ts.map