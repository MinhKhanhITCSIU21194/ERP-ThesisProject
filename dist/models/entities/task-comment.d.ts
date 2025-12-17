import { Task } from "./task";
import { Employee } from "./employee";
export declare class TaskComment {
    commentId: string;
    taskId: string;
    authorId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    task: Task;
    author: Employee;
}
//# sourceMappingURL=task-comment.d.ts.map