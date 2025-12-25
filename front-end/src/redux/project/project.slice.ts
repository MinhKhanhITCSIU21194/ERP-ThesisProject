import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Project, Sprint, Task } from "../../data/project/project";
import {
  createProject,
  getProjects,
  getProjectsByEmployeeId,
  getProjectById,
  updateProject,
  deleteProject,
  createSprint,
  getSprintsByProject,
  getSprintById,
  updateSprint,
  deleteSprint,
  createTask,
  getTasksBySprint,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByEmployee,
} from "../../services/project.service";

export interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  sprints: Sprint[];
  currentSprint: Sprint | null;
  tasks: Task[];
  myTasks: Task[];
  isLoading: boolean;
  error: string | undefined;
  success: boolean;
  totalProjects: number;
  totalSprints: number;
  totalTasks: number;
  totalMyTasks: number;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  sprints: [],
  currentSprint: null,
  tasks: [],
  myTasks: [],
  isLoading: false,
  error: undefined,
  success: false,
  totalProjects: 0,
  totalSprints: 0,
  totalTasks: 0,
  totalMyTasks: 0,
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    resetProjectState: (state) => {
      state.error = undefined;
      state.success = false;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
      state.sprints = [];
      state.currentSprint = null;
      state.tasks = [];
    },
    clearCurrentSprint: (state) => {
      state.currentSprint = null;
      state.tasks = [];
    },
  },
  extraReducers: (builder) => {
    // ========== PROJECT REDUCERS ==========

    // Create project
    builder
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
        state.success = false;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      });

    // Get projects
    builder
      .addCase(getProjects.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload.data;
        state.totalProjects = action.payload.total;
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get projects by employee ID
    builder
      .addCase(getProjectsByEmployeeId.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getProjectsByEmployeeId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload.data;
        state.totalProjects = action.payload.total;
      })
      .addCase(getProjectsByEmployeeId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get project by ID
    builder
      .addCase(getProjectById.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getProjectById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProject = action.payload;
      })
      .addCase(getProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update project
    builder
      .addCase(updateProject.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
        state.success = false;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.currentProject = action.payload;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      });

    // Delete project
    builder
      .addCase(deleteProject.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
        state.success = false;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      });

    // ========== SPRINT REDUCERS ==========

    // Create sprint
    builder
      .addCase(createSprint.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
        state.success = false;
      })
      .addCase(createSprint.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
      })
      .addCase(createSprint.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      });

    // Get sprints by project
    builder
      .addCase(getSprintsByProject.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getSprintsByProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sprints = action.payload.data;
        state.totalSprints = action.payload.total;
      })
      .addCase(getSprintsByProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get sprint by ID
    builder
      .addCase(getSprintById.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getSprintById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSprint = action.payload;
      })
      .addCase(getSprintById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update sprint
    builder
      .addCase(updateSprint.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
        state.success = false;
      })
      .addCase(updateSprint.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        if (state.currentSprint?.sprintId === action.payload.sprintId) {
          state.currentSprint = action.payload;
        }
      })
      .addCase(updateSprint.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      });

    // Delete sprint
    builder
      .addCase(deleteSprint.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
        state.success = false;
      })
      .addCase(deleteSprint.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
      })
      .addCase(deleteSprint.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      });

    // ========== TASK REDUCERS ==========

    // Create task
    builder
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
        state.success = false;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      });

    // Get tasks by sprint
    builder
      .addCase(getTasksBySprint.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getTasksBySprint.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.data;
        state.totalTasks = action.payload.total;
      })
      .addCase(getTasksBySprint.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get task by ID
    builder
      .addCase(getTaskById.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getTaskById.fulfilled, (state, action) => {
        state.isLoading = false;
        // Optionally update the task in the tasks array
      })
      .addCase(getTaskById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update task
    builder
      .addCase(updateTask.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
        state.success = false;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      });

    // Delete task
    builder
      .addCase(deleteTask.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
        state.success = false;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      });

    // Get tasks by employee
    builder
      .addCase(getTasksByEmployee.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getTasksByEmployee.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myTasks = action.payload.data;
        state.totalMyTasks = action.payload.total;
      })
      .addCase(getTasksByEmployee.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetProjectState, clearCurrentProject, clearCurrentSprint } =
  projectSlice.actions;
export const selectProject = (state: { project: ProjectState }) =>
  state.project;
export default projectSlice.reducer;
