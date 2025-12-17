import { Request, Response } from "express";
import { projectService } from "../services/project.service";
import {
  ProjectStatus,
  ProjectPriority,
  SprintStatus,
  TaskStatus,
  TaskPriority,
  TaskType,
} from "../models";
import { AuthRequest } from "../middleware/auth.middleware";

// ========== PROJECT CONTROLLERS ==========

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, status, priority, startDate, endDate, members } =
      req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Project name is required",
      });
    }

    // Get employee by user ID
    const employee = await projectService["employeeRepository"].findOne({
      where: { userId: req.user!.userId },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    const project = await projectService.createProject({
      name,
      description,
      status: status as ProjectStatus,
      priority: priority as ProjectPriority,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      projectManagerId: employee.employeeId,
      members: members || [],
    });

    // Automatically add the creator as a project manager member if not already included
    const isCreatorInMembers = members?.some(
      (m: any) => m.employeeId === employee.employeeId
    );

    if (!isCreatorInMembers) {
      await projectService.addProjectMember(
        {
          projectId: project.projectId,
          employeeId: employee.employeeId,
          role: "PROJECT_MANAGER" as any,
        },
        req.user!.userId
      );
    }

    return res.status(201).json({
      success: true,
      data: project,
      message: "Project created successfully",
    });
  } catch (error: any) {
    console.error("Error creating project:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create project",
    });
  }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const { status, employeeId, isRecent, limit, offset } = req.query;

    const { projects, total } = await projectService.getProjects({
      status: status as ProjectStatus,
      employeeId: employeeId as string,
      isRecent: isRecent === "true",
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    return res.status(200).json({
      success: true,
      data: projects,
      total,
    });
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch projects",
    });
  }
};

export const getProjectsByEmployeeId = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { employeeId } = req.params;
    const { status, isRecent, limit, offset } = req.query;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: "Employee ID is required",
      });
    }

    const { projects, total } = await projectService.getProjectsByEmployeeId({
      employeeId,
      status: status as ProjectStatus,
      isRecent: isRecent === "true",
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    return res.status(200).json({
      success: true,
      data: projects,
      total,
    });
  } catch (error: any) {
    console.error("Error fetching projects by employee ID:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch projects by employee ID",
    });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await projectService.getProjectById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    // Mark as recent when accessed
    await projectService.markProjectAsRecent(id);

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    console.error("Error fetching project:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch project",
    });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const project = await projectService.updateProject(id, updateData);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
      message: "Project updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating project:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to update project",
    });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await projectService.deleteProject(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting project:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to delete project",
    });
  }
};

// ========== SPRINT CONTROLLERS ==========

export const createSprint = async (req: Request, res: Response) => {
  try {
    const { name, goal, projectId, startDate, endDate, status } = req.body;

    if (!name || !projectId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "Name, projectId, startDate, and endDate are required",
      });
    }

    const sprint = await projectService.createSprint({
      name,
      goal,
      projectId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status as SprintStatus,
    });

    return res.status(201).json({
      success: true,
      data: sprint,
      message: "Sprint created successfully",
    });
  } catch (error: any) {
    console.error("Error creating sprint:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create sprint",
    });
  }
};

export const getSprintsByProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { status, limit, offset } = req.query;

    const { sprints, total } = await projectService.getSprintsByProject(
      projectId,
      {
        status: status as SprintStatus,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      }
    );

    return res.status(200).json({
      success: true,
      data: sprints,
      total,
    });
  } catch (error: any) {
    console.error("Error fetching sprints:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch sprints",
    });
  }
};

export const getSprintById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const sprint = await projectService.getSprintById(id);

    if (!sprint) {
      return res.status(404).json({
        success: false,
        error: "Sprint not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: sprint,
    });
  } catch (error: any) {
    console.error("Error fetching sprint:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch sprint",
    });
  }
};

export const updateSprint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const sprint = await projectService.updateSprint(id, updateData);

    if (!sprint) {
      return res.status(404).json({
        success: false,
        error: "Sprint not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: sprint,
      message: "Sprint updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating sprint:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to update sprint",
    });
  }
};

export const deleteSprint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await projectService.deleteSprint(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Sprint not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sprint deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting sprint:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to delete sprint",
    });
  }
};

// ========== TASK CONTROLLERS ==========

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      sprintId,
      status,
      priority,
      taskType,
      assignedTo,
      storyPoints,
      estimatedHours,
    } = req.body;

    if (!title || !sprintId) {
      return res.status(400).json({
        success: false,
        error: "Title and sprintId are required",
      });
    }

    const task = await projectService.createTask(
      {
        title,
        description,
        sprintId,
        status: status as TaskStatus,
        priority: priority as TaskPriority,
        taskType: taskType as TaskType,
        assignedTo,
        storyPoints,
        estimatedHours,
      },
      req.user?.userId
    );

    return res.status(201).json({
      success: true,
      data: task,
      message: "Task created successfully",
    });
  } catch (error: any) {
    console.error("Error creating task:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create task",
    });
  }
};

export const getTasksBySprint = async (req: Request, res: Response) => {
  try {
    const { sprintId } = req.params;
    const { status, assignedTo, limit, offset } = req.query;

    const { tasks, total } = await projectService.getTasksBySprint(sprintId, {
      status: status as TaskStatus,
      assignedTo: assignedTo as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    return res.status(200).json({
      success: true,
      data: tasks,
      total,
    });
  } catch (error: any) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch tasks",
    });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const task = await projectService.getTaskById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    console.error("Error fetching task:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch task",
    });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const task = await projectService.updateTask(
      id,
      updateData,
      req.user?.userId
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: task,
      message: "Task updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating task:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to update task",
    });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await projectService.deleteTask(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting task:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to delete task",
    });
  }
};

export const getTasksByEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { status, limit, offset } = req.query;

    const { tasks, total } = await projectService.getTasksByEmployee(
      employeeId,
      {
        status: status as TaskStatus,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      }
    );

    return res.status(200).json({
      success: true,
      data: tasks,
      total,
    });
  } catch (error: any) {
    console.error("Error fetching employee tasks:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch employee tasks",
    });
  }
};

// ========== COMMENT CONTROLLERS ==========

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    const authorId = req.user!.userId;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: "Comment content is required",
      });
    }

    // Get employee by user ID
    const employee = await projectService["employeeRepository"].findOne({
      where: { userId: authorId },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    const comment = await projectService.addComment({
      taskId,
      authorId: employee.employeeId,
      content,
    });

    return res.status(201).json({
      success: true,
      data: comment,
      message: "Comment added successfully",
    });
  } catch (error: any) {
    console.error("Error adding comment:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to add comment",
    });
  }
};

export const getCommentsByTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    const comments = await projectService.getCommentsByTask(taskId);

    return res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch comments",
    });
  }
};

export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: "Comment content is required",
      });
    }

    const comment = await projectService.updateComment(commentId, content);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: "Comment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: comment,
      message: "Comment updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating comment:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to update comment",
    });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;

    const deleted = await projectService.deleteComment(commentId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Comment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to delete comment",
    });
  }
};

// ========== ATTACHMENT CONTROLLERS ==========

export const addAttachment = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { fileName, filePath, fileSize, mimeType, type } = req.body;
    const uploadedByUserId = req.user!.userId;

    // Get employee by user ID
    const employee = await projectService["employeeRepository"].findOne({
      where: { userId: uploadedByUserId },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    const attachment = await projectService.addAttachment({
      taskId,
      uploadedById: employee.employeeId,
      fileName,
      filePath,
      fileSize,
      mimeType,
      type,
    });

    return res.status(201).json({
      success: true,
      data: attachment,
      message: "Attachment added successfully",
    });
  } catch (error: any) {
    console.error("Error adding attachment:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to add attachment",
    });
  }
};

export const getAttachmentsByTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    const attachments = await projectService.getAttachmentsByTask(taskId);

    return res.status(200).json({
      success: true,
      data: attachments,
    });
  } catch (error: any) {
    console.error("Error fetching attachments:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch attachments",
    });
  }
};

export const deleteAttachment = async (req: AuthRequest, res: Response) => {
  try {
    const { attachmentId } = req.params;

    const deleted = await projectService.deleteAttachment(attachmentId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Attachment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Attachment deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting attachment:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to delete attachment",
    });
  }
};

// ========== SPRINT MEMBER CONTROLLERS ==========

export const addSprintMember = async (req: AuthRequest, res: Response) => {
  try {
    const { sprintId } = req.params;
    const { employeeId, role } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: "Employee ID is required",
      });
    }

    const member = await projectService.addSprintMember(
      {
        sprintId,
        employeeId,
        role,
      },
      req.user?.userId
    );

    return res.status(201).json({
      success: true,
      data: member,
      message: "Sprint member added successfully",
    });
  } catch (error: any) {
    console.error("Error adding sprint member:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to add sprint member",
    });
  }
};

export const removeSprintMember = async (req: AuthRequest, res: Response) => {
  try {
    const { sprintId, employeeId } = req.params;

    await projectService.removeSprintMember(
      sprintId,
      employeeId,
      req.user?.userId
    );

    return res.status(200).json({
      success: true,
      message: "Sprint member removed successfully",
    });
  } catch (error: any) {
    console.error("Error removing sprint member:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to remove sprint member",
    });
  }
};

export const updateSprintMemberRole = async (req: Request, res: Response) => {
  try {
    const { sprintId, employeeId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        error: "Role is required",
      });
    }

    const member = await projectService.updateSprintMemberRole(
      sprintId,
      employeeId,
      role
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        error: "Sprint member not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: member,
      message: "Sprint member role updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating sprint member role:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to update sprint member role",
    });
  }
};

export const getSprintMembers = async (req: Request, res: Response) => {
  try {
    const { sprintId } = req.params;
    const { activeOnly } = req.query;

    const members =
      activeOnly === "true"
        ? await projectService.getActiveSprintMembers(sprintId)
        : await projectService.getSprintMembers(sprintId);

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error: any) {
    console.error("Error fetching sprint members:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch sprint members",
    });
  }
};

// ========== PROJECT MEMBER CONTROLLERS ==========

export const addProjectMember = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { employeeId, role } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: "Employee ID is required",
      });
    }

    const member = await projectService.addProjectMember(
      {
        projectId,
        employeeId,
        role,
      },
      req.user?.userId
    );

    return res.status(201).json({
      success: true,
      data: member,
      message: "Project member added successfully",
    });
  } catch (error: any) {
    console.error("Error adding project member:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to add project member",
    });
  }
};

export const removeProjectMember = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, employeeId } = req.params;

    await projectService.removeProjectMember(
      projectId,
      employeeId,
      req.user?.userId
    );

    return res.status(200).json({
      success: true,
      message: "Project member removed successfully",
    });
  } catch (error: any) {
    console.error("Error removing project member:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to remove project member",
    });
  }
};

export const updateProjectMemberRole = async (req: Request, res: Response) => {
  try {
    const { projectId, employeeId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        error: "Role is required",
      });
    }

    const member = await projectService.updateProjectMemberRole(
      projectId,
      employeeId,
      role
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        error: "Project member not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: member,
      message: "Project member role updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating project member role:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to update project member role",
    });
  }
};

export const getProjectMembers = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { activeOnly } = req.query;

    const members =
      activeOnly === "true"
        ? await projectService.getActiveProjectMembers(projectId)
        : await projectService.getProjectMembers(projectId);

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error: any) {
    console.error("Error fetching project members:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch project members",
    });
  }
};

export const projectController = {
  // Projects
  createProject,
  getProjects,
  getProjectsByEmployeeId,
  getProjectById,
  updateProject,
  deleteProject,

  // Project Members
  addProjectMember,
  removeProjectMember,
  updateProjectMemberRole,
  getProjectMembers,

  // Sprints
  createSprint,
  getSprintsByProject,
  getSprintById,
  updateSprint,
  deleteSprint,

  // Tasks
  createTask,
  getTasksBySprint,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByEmployee,

  // Sprint Members
  addSprintMember,
  removeSprintMember,
  updateSprintMemberRole,
  getSprintMembers,

  // Comments
  addComment,
  getCommentsByTask,
  updateComment,
  deleteComment,

  // Attachments
  addAttachment,
  getAttachmentsByTask,
  deleteAttachment,
};
