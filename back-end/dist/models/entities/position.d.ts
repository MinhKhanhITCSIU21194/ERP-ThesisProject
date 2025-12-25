import { Employee } from "./employee";
export declare enum PositionLevel {
    INTERN = "INTERN",
    JUNIOR = "JUNIOR",
    INTERMEDIATE = "INTERMEDIATE",
    SENIOR = "SENIOR",
    LEAD = "LEAD",
    PRINCIPAL = "PRINCIPAL",
    MANAGER = "MANAGER",
    SENIOR_MANAGER = "SENIOR_MANAGER",
    DIRECTOR = "DIRECTOR",
    SENIOR_DIRECTOR = "SENIOR_DIRECTOR",
    VP = "VP",
    SVP = "SVP",
    C_LEVEL = "C_LEVEL"
}
export declare class Position {
    id: string;
    name: string;
    description?: string;
    level?: PositionLevel;
    employees?: Employee[];
    parentId?: string;
    parentPosition?: Position;
    subPositions?: Position[];
    minSalary?: number;
    maxSalary?: number;
    salaryCurrency: string;
    code?: string;
    isActive: boolean;
    requirements?: string;
    responsibilities?: string;
    headcount: number;
    createdBy?: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    getSalaryRange(): string;
}
//# sourceMappingURL=position.d.ts.map