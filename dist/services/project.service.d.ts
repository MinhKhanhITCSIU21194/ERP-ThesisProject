import { Project, ProjectStatus, ProjectPriority, ProjectMember, ProjectMemberRole, Sprint, SprintStatus, Task, TaskStatus, TaskPriority, TaskType, SprintMember, SprintMemberRole, TaskComment, TaskAttachment, AttachmentType } from "../models";
export declare class ProjectService {
    private projectRepository;
    private projectMemberRepository;
    private sprintRepository;
    private taskRepository;
    private sprintMemberRepository;
    private employeeRepository;
    private commentRepository;
    private attachmentRepository;
    createProject(data: {
        name: string;
        description?: string;
        status?: ProjectStatus;
        priority?: ProjectPriority;
        startDate?: Date;
        endDate?: Date;
        projectManagerId: string;
        members?: Array<{
            employeeId: string;
            role: string;
        }>;
    }): Promise<Project>;
    getProjects(options?: {
        status?: ProjectStatus;
        employeeId?: string;
        isRecent?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<{
        projects: Project[];
        total: number;
    }>;
    getProjectsByEmployeeId(options: {
        employeeId: string;
        status?: ProjectStatus;
        isRecent?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<{
        projects: Project[];
        total: number;
    }>;
    getProjectById(projectId: string): Promise<Project | null>;
    updateProject(projectId: string, data: Partial<Project> & {
        members?: Array<{
            employeeId: string;
            role: string;
        }>;
    }): Promise<Project | null>;
    markProjectAsRecent(projectId: string): Promise<Project | null>;
    deleteProject(projectId: string): Promise<boolean>;
    createSprint(data: {
        name: string;
        goal?: string;
        projectId: string;
        startDate: Date;
        endDate: Date;
        status?: SprintStatus;
    }): Promise<Sprint>;
    getSprintsByProject(projectId: string, options?: {
        status?: SprintStatus;
        limit?: number;
        offset?: number;
    }): Promise<{
        sprints: Sprint[];
        total: number;
    }>;
    getSprintById(sprintId: string): Promise<Sprint | null>;
    updateSprint(sprintId: string, data: Partial<Sprint>): Promise<Sprint | null>;
    deleteSprint(sprintId: string): Promise<boolean>;
    createTask(data: {
        title: string;
        description?: string;
        sprintId: string;
        status?: TaskStatus;
        priority?: TaskPriority;
        taskType?: TaskType;
        assignedTo?: string;
        storyPoints?: number;
        estimatedHours?: number;
    }, createdByUserId?: string): Promise<Task>;
    getTasksBySprint(sprintId: string, options?: {
        status?: TaskStatus;
        assignedTo?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        tasks: Task[];
        total: number;
    }>;
    getTaskById(taskId: string): Promise<Task | null>;
    updateTask(taskId: string, data: Partial<Task>, updatedByUserId?: string): Promise<Task | null>;
    deleteTask(taskId: string): Promise<boolean>;
    getTasksByEmployee(employeeId: string, options?: {
        status?: TaskStatus;
        limit?: number;
        offset?: number;
    }): Promise<{
        tasks: Task[];
        total: number;
    }>;
    addSprintMember(data: {
        sprintId: string;
        employeeId: string;
        role?: SprintMemberRole;
    }, addedByUserId?: string): Promise<SprintMember>;
    removeSprintMember(sprintId: string, employeeId: string, removedByUserId?: string): Promise<void>;
    updateSprintMemberRole(sprintId: string, employeeId: string, role: SprintMemberRole): Promise<SprintMember | null>;
    getSprintMembers(sprintId: string): Promise<SprintMember[]>;
    getActiveSprintMembers(sprintId: string): Promise<SprintMember[]>;
    addComment(data: {
        taskId: string;
        authorId: string;
        content: string;
    }): Promise<TaskComment>;
    getCommentsByTask(taskId: string): Promise<TaskComment[]>;
    updateComment(commentId: string, content: string): Promise<TaskComment | null>;
    deleteComment(commentId: string): Promise<boolean>;
    addAttachment(data: {
        taskId: string;
        uploadedById: string;
        fileName: string;
        filePath: string;
        fileSize: number;
        mimeType: string;
        type: AttachmentType;
    }): Promise<TaskAttachment>;
    getAttachmentsByTask(taskId: string): Promise<TaskAttachment[]>;
    deleteAttachment(attachmentId: string): Promise<boolean>;
    getAttachmentById(attachmentId: string): Promise<TaskAttachment | null>;
    addProjectMember(data: {
        projectId: string;
        employeeId: string;
        role?: ProjectMemberRole;
    }, addedByUserId?: string): Promise<ProjectMember>;
    removeProjectMember(projectId: string, employeeId: string, removedByUserId?: string): Promise<void>;
    updateProjectMemberRole(projectId: string, employeeId: string, role: ProjectMemberRole): Promise<ProjectMember | null>;
    getProjectMembers(projectId: string): Promise<ProjectMember[]>;
    getActiveProjectMembers(projectId: string): Promise<ProjectMember[]>;
}
export declare const projectService: ProjectService;
//# sourceMappingURL=project.service.d.ts.map