import { Employee } from "./employee";
import { Sprint } from "./sprint";
import { ProjectMember } from "./project-member";
export declare enum ProjectStatus {
    PLANNING = "PLANNING",
    ACTIVE = "ACTIVE",
    ON_HOLD = "ON_HOLD",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum ProjectPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare class Project {
    projectId: string;
    name: string;
    description?: string;
    status: ProjectStatus;
    priority: ProjectPriority;
    startDate?: Date;
    endDate?: Date;
    projectManagerId: string;
    projectManager: Employee;
    lastAccessedAt?: Date;
    isRecent: boolean;
    sprints: Sprint[];
    members: ProjectMember[];
    createdAt: Date;
    updatedAt: Date;
    markAsRecent(): void;
    markAsActive(): void;
    complete(): void;
    cancel(): void;
}
//# sourceMappingURL=project.d.ts.map