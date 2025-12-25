import { Employee, EmploymentStatus, MaritalStatus, Gender } from "../models/entities/employee";
import { ContractType } from "../models/entities/contract";
export interface CreateEmployeeDTO {
    employeeCode: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: Date;
    gender: Gender;
    maritalStatus: MaritalStatus;
    nationality?: string;
    nationalId?: string;
    passportNumber?: string;
    email: string;
    phoneNumber?: string;
    emergencyContactNumber?: string;
    emergencyContactName?: string;
    emergencyContactRelationship?: string;
    currentAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    permanentAddress?: string;
    hireDate: Date;
    confirmationDate?: Date;
    employmentStatus?: EmploymentStatus;
    department?: string;
    position?: string;
    positionId?: string;
    jobTitle?: string;
    workLocation?: string;
    reportingManagerId?: string;
    weeklyWorkHours?: number;
    salary?: number;
    salaryCurrency?: string;
    salaryFrequency?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountHolderName?: string;
    bankBranchCode?: string;
    bloodGroup?: string;
    medicalConditions?: string;
    allergies?: string;
    profilePicture?: string;
    skills?: string;
    qualifications?: string;
    notes?: string;
    userId?: string;
    createdBy?: string;
}
export interface UpdateEmployeeDTO extends Partial<CreateEmployeeDTO> {
    updatedBy?: string;
}
export interface EmployeeFilterDTO {
    search?: string;
    employmentStatus?: EmploymentStatus | EmploymentStatus[];
    department?: string;
    position?: string;
    hireDateFrom?: Date;
    hireDateTo?: Date;
    reportingManagerId?: string;
}
export interface PaginationParams {
    pageIndex: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}
export declare class EmployeeService {
    private employeeRepository;
    constructor();
    getEmployees(pagination: PaginationParams, filters?: EmployeeFilterDTO): Promise<PaginatedResponse<Employee>>;
    getEmployeeById(employeeId: string): Promise<Employee | null>;
    getEmployeeByCode(employeeCode: string): Promise<Employee | null>;
    getEmployeeByUserId(userId: string): Promise<Employee | null>;
    getEmployeeByEmail(email: string): Promise<Employee | null>;
    createEmployee(data: CreateEmployeeDTO): Promise<Employee>;
    updateEmployee(employeeId: string, data: UpdateEmployeeDTO): Promise<Employee>;
    deleteEmployee(employeeId: string): Promise<void>;
    restoreEmployee(employeeId: string): Promise<void>;
    permanentlyDeleteEmployee(employeeId: string): Promise<void>;
    getActiveEmployeesCount(): Promise<number>;
    getEmployeesWithExpiringContracts(daysThreshold?: number): Promise<Employee[]>;
    getEmployeesByDepartment(department: string, pagination?: PaginationParams): Promise<PaginatedResponse<Employee>>;
    getEmployeesByManager(managerId: string, pagination?: PaginationParams): Promise<PaginatedResponse<Employee>>;
    getEmployeeStatistics(): Promise<{
        total: number;
        active: number;
        inactive: number;
        onLeave: number;
        byContractType: Record<ContractType, number>;
        byDepartment: Record<string, number>;
    }>;
}
//# sourceMappingURL=employee.service.d.ts.map