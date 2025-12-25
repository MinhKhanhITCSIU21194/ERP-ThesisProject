import { Sprint } from "./sprint";
import { Employee } from "./employee";
export declare enum SprintMemberRole {
    DEVELOPER = "DEVELOPER",
    TESTER = "TESTER",
    REVIEWER = "REVIEWER",
    SCRUM_MASTER = "SCRUM_MASTER",
    PRODUCT_OWNER = "PRODUCT_OWNER",
    OBSERVER = "OBSERVER"
}
export declare class SprintMember {
    sprintMemberId: string;
    sprintId: string;
    sprint: Sprint;
    employeeId: string;
    employee: Employee;
    role: SprintMemberRole;
    joinedAt: Date;
    leftAt?: Date;
    isActive(): boolean;
    leave(): void;
}
//# sourceMappingURL=sprint-member.d.ts.map