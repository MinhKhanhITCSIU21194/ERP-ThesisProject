import { Project } from "./project";
import { Task } from "./task";
import { SprintMember } from "./sprint-member";
export declare enum SprintStatus {
    PLANNED = "PLANNED",
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class Sprint {
    sprintId: string;
    name: string;
    goal?: string;
    projectId: string;
    project: Project;
    status: SprintStatus;
    startDate: Date;
    endDate: Date;
    tasks: Task[];
    members: SprintMember[];
    createdAt: Date;
    updatedAt: Date;
    start(): void;
    complete(): void;
    cancel(): void;
    isActive(): boolean;
}
//# sourceMappingURL=sprint.d.ts.map