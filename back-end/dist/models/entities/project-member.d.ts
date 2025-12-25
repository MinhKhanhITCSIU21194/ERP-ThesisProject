import { Project } from "./project";
import { Employee } from "./employee";
export declare enum ProjectMemberRole {
    PROJECT_MANAGER = "PROJECT_MANAGER",
    TECH_LEAD = "TECH_LEAD",
    DEVELOPER = "DEVELOPER",
    DESIGNER = "DESIGNER",
    QA = "QA",
    BUSINESS_ANALYST = "BUSINESS_ANALYST",
    PRODUCT_OWNER = "PRODUCT_OWNER",
    SCRUM_MASTER = "SCRUM_MASTER"
}
export declare class ProjectMember {
    memberId: string;
    projectId: string;
    project: Project;
    employeeId: string;
    employee: Employee;
    role: ProjectMemberRole;
    joinedAt: Date;
    leftAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    leave(): void;
    isActive(): boolean;
    rejoin(): void;
}
//# sourceMappingURL=project-member.d.ts.map