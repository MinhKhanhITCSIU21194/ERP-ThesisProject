import { Employee } from "./employee";
export declare enum ContractStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    EXPIRED = "EXPIRED",
    TERMINATED = "TERMINATED"
}
export declare enum ContractType {
    FULL_TIME = "FULL_TIME",
    PART_TIME = "PART_TIME",
    CONTRACT = "CONTRACT",
    INTERNSHIP = "INTERNSHIP",
    TEMPORARY = "TEMPORARY",
    FREELANCE = "FREELANCE"
}
export declare enum WorkingType {
    ONSITE = "ONSITE",
    REMOTE = "REMOTE",
    HYBRID = "HYBRID"
}
export declare class Contract {
    id: string;
    contractNumber: string;
    employeeId: string;
    employee: Employee;
    contractType: ContractType;
    workingType: WorkingType;
    status: ContractStatus;
    startDate: Date;
    endDate?: Date;
    contractFile?: string;
    terms?: string;
    salary?: number;
    salaryCurrency: string;
    salaryFrequency: string;
    weeklyWorkHours: number;
    notes?: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    isExpiringSoon(days?: number): boolean;
    isExpired(): boolean;
}
//# sourceMappingURL=contract.d.ts.map