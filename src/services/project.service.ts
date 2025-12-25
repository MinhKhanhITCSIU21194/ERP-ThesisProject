import { createAsyncThunk } from "@reduxjs/toolkit";
import { GET, POST, PATCH, DELETE, PUT } from "./axios";
import {
  Project,
  Sprint,
  Task,
  ProjectResponse,
  ProjectListResponse,
  SprintResponse,
  SprintListResponse,
  TaskResponse,
  TaskListResponse,
  CreateProjectData,
  CreateSprintData,
  UpdateSprintData,
  CreateTaskData,
  UpdateTaskData,
  ProjectStatus,
  SprintStatus,
  TaskStatus,
} from "../data/project/project";

// ========== PROJECT THUNKS ==========

export const createProject = createAsyncThunk<
  Project,
  CreateProjectData,
  { rejectValue: string }
>("project/create", async (data: CreateProjectData, { rejectWithValue }) => {
  try {
    const response = await POST<ProjectResponse>("/projects", data);
    return response.data.data;
  } catch (error: any) {
    const message =
      error.response?.data?.error ||
      error.message ||
      "Failed to create project";
    return rejectWithValue(message);
  }
});

export const getProjects = createAsyncThunk<
  ProjectListResponse,
  {
    status?: ProjectStatus;
    employeeId?: string;
    isRecent?: boolean;
    limit?: number;
    offset?: number;
  },
  { rejectValue: string }
>(
  "project/getProjects",
  async (
    { status, employeeId, isRecent, limit, offset },
    { rejectWithValue }
  ) => {
    try {
      const params: any = {};
      if (status) params.status = status;
      if (employeeId) params.employeeId = employeeId;
      if (isRecent !== undefined) params.isRecent = isRecent;
      if (limit) params.limit = limit;
      if (offset) params.offset = offset;

      const response = await GET<ProjectListResponse>("/projects", { params });
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch projects";
      return rejectWithValue(message);
    }
  }
);

export const getProjectsByEmployeeId = createAsyncThunk<
  ProjectListResponse,
  {
    employeeId: string;
    status?: ProjectStatus;
    isRecent?: boolean;
    limit?: number;
    offset?: number;
  },
  { rejectValue: string }
>(
  "project/getByEmployeeId",
  async (
    { employeeId, status, isRecent, limit, offset },
    { rejectWithValue }
  ) => {
    try {
      const params: any = {};
      if (status) params.status = status;
      if (isRecent !== undefined) params.isRecent = isRecent;
      if (limit) params.limit = limit;
      if (offset) params.offset = offset;

      const response = await GET<ProjectListResponse>(
        `/projects/employee/${employeeId}`,
        { params }
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch employee projects";
      return rejectWithValue(message);
    }
  }
);

export const getProjectById = createAsyncThunk<
  Project,
  string,
  { rejectValue: string }
>("project/getById", async (projectId: string, { rejectWithValue }) => {
  try {
    const response = await GET<ProjectResponse>(`/projects/${projectId}`);
    return response.data.data;
  } catch (error: any) {
    const message =
      error.response?.data?.error || error.message || "Failed to fetch project";
    return rejectWithValue(message);
  }
});

export const updateProject = createAsyncThunk<
  Project,
  { id: string; data: CreateProjectData },
  { rejectValue: string }
>(
  "project/update",
  async (
    { id, data }: { id: string; data: CreateProjectData },
    { rejectWithValue }
  ) => {
    try {
      const response = await PUT<ProjectResponse>(`/projects/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "Failed to update project";
      return rejectWithValue(message);
    }
  }
);

export const deleteProject = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("project/delete", async (projectId: string, { rejectWithValue }) => {
  try {
    await DELETE(`/projects/${projectId}`);
    return projectId;
  } catch (error: any) {
    const message =
      error.response?.data?.error ||
      error.message ||
      "Failed to delete project";
    return rejectWithValue(message);
  }
});

// ========== PROJECT MEMBER THUNKS ==========

export const addProjectMember = createAsyncThunk<
  any,
  { projectId: string; employeeId: string; role: string },
  { rejectValue: string }
>(
  "project/addMember",
  async ({ projectId, employeeId, role }, { rejectWithValue }) => {
    try {
      const response = await POST(`/projects/${projectId}/members`, {
        employeeId,
        role,
      });
      return response.data.data;
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "Failed to add project member";
      return rejectWithValue(message);
    }
  }
);

export const removeProjectMember = createAsyncThunk<
  string,
  { projectId: string; memberId: string },
  { rejectValue: string }
>(
  "project/removeMember",
  async ({ projectId, memberId }, { rejectWithValue }) => {
    try {
      await DELETE(`/projects/${projectId}/members/${memberId}`);
      return memberId;
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "Failed to remove project member";
      return rejectWithValue(message);
    }
  }
);

// ========== SPRINT THUNKS ==========

export const createSprint = createAsyncThunk<
  Sprint,
  CreateSprintData,
  { rejectValue: string }
>("sprint/create", async (data: CreateSprintData, { rejectWithValue }) => {
  try {
    const response = await POST<SprintResponse>("/projects/sprints", data);
    return response.data.data;
  } catch (error: any) {
    const message =
      error.response?.data?.error || error.message || "Failed to create sprint";
    return rejectWithValue(message);
  }
});

export const getSprintsByProject = createAsyncThunk<
  SprintListResponse,
  {
    projectId: string;
    status?: SprintStatus;
    limit?: number;
    offset?: number;
  },
  { rejectValue: string }
>(
  "sprint/getByProject",
  async ({ projectId, status, limit, offset }, { rejectWithValue }) => {
    try {
      const params: any = {};
      if (status) params.status = status;
      if (limit) params.limit = limit;
      if (offset) params.offset = offset;

      const response = await GET<SprintListResponse>(
        `/projects/${projectId}/sprints`,
        { params }
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch sprints";
      return rejectWithValue(message);
    }
  }
);

export const getSprintById = createAsyncThunk<
  Sprint,
  string,
  { rejectValue: string }
>("sprint/getById", async (sprintId: string, { rejectWithValue }) => {
  try {
    const response = await GET<SprintResponse>(`/projects/sprints/${sprintId}`);
    return response.data.data;
  } catch (error: any) {
    const message =
      error.response?.data?.error || error.message || "Failed to fetch sprint";
    return rejectWithValue(message);
  }
});

export const updateSprint = createAsyncThunk<
  Sprint,
  { id: string; data: UpdateSprintData },
  { rejectValue: string }
>(
  "sprint/update",
  async (
    { id, data }: { id: string; data: UpdateSprintData },
    { rejectWithValue }
  ) => {
    try {
      const response = await PUT<SprintResponse>(
        `/projects/sprints/${id}`,
        data
      );
      return response.data.data;
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "Failed to update sprint";
      return rejectWithValue(message);
    }
  }
);

export const deleteSprint = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("sprint/delete", async (sprintId: string, { rejectWithValue }) => {
  try {
    await DELETE(`/projects/sprints/${sprintId}`);
    return sprintId;
  } catch (error: any) {
    const message =
      error.response?.data?.error || error.message || "Failed to delete sprint";
    return rejectWithValue(message);
  }
});

// ========== TASK THUNKS ==========

export const createTask = createAsyncThunk<
  Task,
  CreateTaskData,
  { rejectValue: string }
>("task/create", async (data: CreateTaskData, { rejectWithValue }) => {
  try {
    const response = await POST<TaskResponse>("/projects/tasks", data);
    return response.data.data;
  } catch (error: any) {
    const message =
      error.response?.data?.error || error.message || "Failed to create task";
    return rejectWithValue(message);
  }
});

export const getTasksBySprint = createAsyncThunk<
  TaskListResponse,
  {
    sprintId: string;
    status?: TaskStatus;
    assignedTo?: string;
    limit?: number;
    offset?: number;
  },
  { rejectValue: string }
>(
  "task/getBySprint",
  async (
    { sprintId, status, assignedTo, limit, offset },
    { rejectWithValue }
  ) => {
    try {
      const params: any = {};
      if (status) params.status = status;
      if (assignedTo) params.assignedTo = assignedTo;
      if (limit) params.limit = limit;
      if (offset) params.offset = offset;

      const response = await GET<TaskListResponse>(
        `/projects/sprints/${sprintId}/tasks`,
        { params }
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.error || error.message || "Failed to fetch tasks";
      return rejectWithValue(message);
    }
  }
);

export const getTaskById = createAsyncThunk<
  Task,
  string,
  { rejectValue: string }
>("task/getById", async (taskId: string, { rejectWithValue }) => {
  try {
    const response = await GET<TaskResponse>(`/projects/tasks/${taskId}`);
    return response.data.data;
  } catch (error: any) {
    const message =
      error.response?.data?.error || error.message || "Failed to fetch task";
    return rejectWithValue(message);
  }
});

export const updateTask = createAsyncThunk<
  Task,
  { id: string; data: UpdateTaskData },
  { rejectValue: string }
>(
  "task/update",
  async (
    { id, data }: { id: string; data: UpdateTaskData },
    { rejectWithValue }
  ) => {
    try {
      const response = await PUT<TaskResponse>(`/projects/tasks/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      const message =
        error.response?.data?.error || error.message || "Failed to update task";
      return rejectWithValue(message);
    }
  }
);

export const deleteTask = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("task/delete", async (taskId: string, { rejectWithValue }) => {
  try {
    await DELETE(`/projects/tasks/${taskId}`);
    return taskId;
  } catch (error: any) {
    const message =
      error.response?.data?.error || error.message || "Failed to delete task";
    return rejectWithValue(message);
  }
});

export const getTasksByEmployee = createAsyncThunk<
  TaskListResponse,
  {
    employeeId: string;
    status?: TaskStatus;
    limit?: number;
    offset?: number;
  },
  { rejectValue: string }
>(
  "task/getByEmployee",
  async ({ employeeId, status, limit, offset }, { rejectWithValue }) => {
    try {
      const params: any = {};
      if (status) params.status = status;
      if (limit) params.limit = limit;
      if (offset) params.offset = offset;

      const response = await GET<TaskListResponse>(
        `/projects/employees/${employeeId}/tasks`,
        { params }
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch employee tasks";
      return rejectWithValue(message);
    }
  }
);
