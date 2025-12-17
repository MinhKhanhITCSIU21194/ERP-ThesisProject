import { Task } from "./task";
import { Employee } from "./employee";
export declare enum AttachmentType {
    IMAGE = "IMAGE",
    DOCUMENT = "DOCUMENT",
    OTHER = "OTHER"
}
export declare class TaskAttachment {
    attachmentId: string;
    taskId: string;
    uploadedById: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    type: AttachmentType;
    uploadedAt: Date;
    task: Task;
    uploadedBy: Employee;
}
//# sourceMappingURL=task-attachment.d.ts.map