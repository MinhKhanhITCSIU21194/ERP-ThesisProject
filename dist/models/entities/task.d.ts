import { Sprint } from "./sprint";
import { Employee } from "./employee";
import { TaskComment } from "./task-comment";
import { TaskAttachment } from "./task-attachment";
export declare enum TaskStatus {
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    IN_REVIEW = "IN_REVIEW",
    DONE = "DONE",
    BLOCKED = "BLOCKED"
}
export declare enum TaskPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare enum TaskType {
    STORY = "STORY",
    BUG = "BUG",
    TASK = "TASK",
    EPIC = "EPIC"
}
export declare class Task {
    taskId: string;
    title: string;
    description?: string;
    sprintId: string;
    sprint: Sprint;
    status: TaskStatus;
    priority: TaskPriority;
    taskType: TaskType;
    assignedTo?: string;
    assignee?: Employee;
    storyPoints?: number;
    estimatedHours?: number;
    actualHours?: number;
    createdAt: Date;
    updatedAt: Date;
    comments: TaskComment[];
    attachments: TaskAttachment[];
    moveToInProgress(): void;
    moveToReview(): void;
    complete(): void;
    block(): void;
    assign(employeeId: string): void;
}
//# sourceMappingURL=task.d.ts.map