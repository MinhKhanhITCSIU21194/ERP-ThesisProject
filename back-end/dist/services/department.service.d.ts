import { Department } from "../models/entities/department";
import { EmployeeDepartment } from "../models/entities/employee-department";
export declare class DepartmentService {
    private departmentRepository;
    private employeeDepartmentRepository;
    getAllDepartments(filters?: {
        isActive?: boolean;
        search?: string;
        parentId?: string | null;
    }): Promise<Department[]>;
    getDepartmentById(id: string): Promise<Department>;
    getDepartmentHierarchy(): Promise<Department[]>;
    createDepartment(data: {
        name: string;
        description?: string;
        parentId?: string;
        code?: string;
        location?: string;
        managerId?: string;
        budget?: string;
        createdBy?: string;
    }): Promise<Department>;
    updateDepartment(id: string, data: {
        name?: string;
        description?: string;
        parentId?: string;
        code?: string;
        location?: string;
        managerId?: string;
        budget?: string;
        isActive?: boolean;
        updatedBy?: string;
    }): Promise<Department>;
    deleteDepartment(id: string, deletedBy?: string): Promise<Department>;
    hardDeleteDepartment(id: string): Promise<{
        message: string;
    }>;
    getDepartmentEmployees(departmentId: string, includeInactive?: boolean): Promise<EmployeeDepartment[]>;
    getDepartmentStats(departmentId: string): Promise<{
        department: Department;
        totalEmployees: number;
        managers: number;
        subDepartmentsCount: number;
    }>;
    private isDescendant;
    moveEmployees(fromDepartmentId: string, toDepartmentId: string, employeeIds?: string[]): Promise<{
        message: string;
        movedCount: number;
    }>;
}
//# sourceMappingURL=department.service.d.ts.map