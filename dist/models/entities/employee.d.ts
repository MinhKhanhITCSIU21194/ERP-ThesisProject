import { User } from "./user";
import { Position } from "./position";
import { EmployeeDepartment } from "./employee-department";
import { Contract } from "./contract";
export declare enum EmploymentStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    ON_LEAVE = "ON_LEAVE",
    TERMINATED = "TERMINATED",
    RESIGNED = "RESIGNED",
    RETIRED = "RETIRED"
}
export declare enum MaritalStatus {
    SINGLE = "SINGLE",
    MARRIED = "MARRIED",
    DIVORCED = "DIVORCED",
    WIDOWED = "WIDOWED",
    SEPARATED = "SEPARATED"
}
export declare enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER",
    PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY"
}
export declare class Employee {
    employeeId: string;
    user?: User;
    userId?: string;
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
    terminationDate?: Date;
    employmentStatus: EmploymentStatus;
    department?: string;
    departments?: EmployeeDepartment[];
    contracts?: Contract[];
    positionId?: string;
    positionEntity?: Position;
    position?: string;
    jobTitle?: string;
    workLocation?: string;
    reportingManagerId?: string;
    weeklyWorkHours: number;
    salary?: number;
    salaryCurrency: string;
    salaryFrequency: string;
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
    createdBy?: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    get fullName(): string;
    get age(): number;
    get yearsOfService(): number;
    isActive(): boolean;
}
//# sourceMappingURL=employee.d.ts.map