// Project Types
export enum ProjectStatus {
  PLANNING = "PLANNING",
  ACTIVE = "ACTIVE",
  ON_HOLD = "ON_HOLD",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum ProjectPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum ProjectMemberRole {
  DEVELOPER = "DEVELOPER",
  DESIGNER = "DESIGNER",
  QA = "QA",
  BUSINESS_ANALYST = "BUSINESS_ANALYST",
  PRODUCT_OWNER = "PRODUCT_OWNER",
  SCRUM_MASTER = "SCRUM_MASTER",
}

export type ProjectMember = {
  memberId: string;
  projectId: string;
  employeeId: string;
  employee?: {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  role: ProjectMemberRole;
  joinedAt: string;
  leftAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  projectId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate?: string;
  endDate?: string;
  projectManagerId: string;
  projectManager?: {
    employeeId: string;
    firstName: string;
    lastName: string;
  };
  members?: ProjectMember[];
  lastAccessedAt?: string;
  isRecent: boolean;
  sprints?: Sprint[];
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectData = {
  projectManagerId?: string;
  name: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: string;
  endDate?: string;
  members?: Array<{
    employeeId: string;
    role: ProjectMemberRole;
  }>;
};

// Sprint Types
export enum SprintStatus {
  PLANNED = "PLANNED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export type Sprint = {
  sprintId: string;
  name: string;
  goal?: string;
  projectId: string;
  status: SprintStatus;
  project: Project;
  startDate: string;
  endDate: string;
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
};

export type CreateSprintData = {
  name: string;
  goal?: string;
  projectId: string;
  startDate: string;
  endDate: string;
  status?: SprintStatus;
};

export type UpdateSprintData = Partial<CreateSprintData>;

// Task Types
export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE",
  BLOCKED = "BLOCKED",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum TaskType {
  STORY = "STORY",
  BUG = "BUG",
  TASK = "TASK",
  EPIC = "EPIC",
}

export type TaskComment = {
  commentId: string;
  taskId: string;
  authorId: string;
  content: string;
  author: {
    employeeId: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
};

export enum AttachmentType {
  IMAGE = "IMAGE",
  DOCUMENT = "DOCUMENT",
  OTHER = "OTHER",
}

export type TaskAttachment = {
  attachmentId: string;
  taskId: string;
  uploadedById: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  type: AttachmentType;
  uploadedBy: {
    employeeId: string;
    firstName: string;
    lastName: string;
  };
  uploadedAt: string;
};

export type Task = {
  taskId: string;
  title: string;
  description?: string;
  sprintId: string;
  status: TaskStatus;
  sprint: Sprint;
  priority: TaskPriority;
  taskType: TaskType;
  assignedTo?: string;
  assignee?: {
    employeeId: string;
    firstName: string;
    lastName: string;
  };
  storyPoints?: number;
  estimatedHours?: number;
  actualHours?: number;
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskData = {
  title: string;
  description?: string;
  sprintId: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  taskType?: TaskType;
  assignedTo?: string;
  storyPoints?: number;
  estimatedHours?: number;
};

export type UpdateTaskData = Partial<CreateTaskData> & {
  actualHours?: number;
};

// API Response Types
export type ProjectResponse = {
  success: boolean;
  data: Project;
  message?: string;
};

export type ProjectListResponse = {
  success: boolean;
  data: Project[];
  total: number;
};

export type SprintResponse = {
  success: boolean;
  data: Sprint;
  message?: string;
};

export type SprintListResponse = {
  success: boolean;
  data: Sprint[];
  total: number;
};

export type TaskResponse = {
  success: boolean;
  data: Task;
  message?: string;
};

export type TaskListResponse = {
  success: boolean;
  data: Task[];
  total: number;
};
