"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectController = exports.getProjectMembers = exports.updateProjectMemberRole = exports.removeProjectMember = exports.addProjectMember = exports.getSprintMembers = exports.updateSprintMemberRole = exports.removeSprintMember = exports.addSprintMember = exports.deleteAttachment = exports.getAttachmentsByTask = exports.addAttachment = exports.deleteComment = exports.updateComment = exports.getCommentsByTask = exports.addComment = exports.getTasksByEmployee = exports.deleteTask = exports.updateTask = exports.getTaskById = exports.getTasksBySprint = exports.createTask = exports.deleteSprint = exports.updateSprint = exports.getSprintById = exports.getSprintsByProject = exports.createSprint = exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getProjectsByEmployeeId = exports.getProjects = exports.createProject = void 0;
const project_service_1 = require("../services/project.service");
const createProject = async (req, res) => {
    try {
        const { name, description, status, priority, startDate, endDate } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                error: "Project name is required",
            });
        }
        const employee = await project_service_1.projectService["employeeRepository"].findOne({
            where: { userId: req.user.userId },
        });
        if (!employee) {
            return res.status(404).json({
                success: false,
                error: "Employee not found",
            });
        }
        const project = await project_service_1.projectService.createProject({
            name,
            description,
            status: status,
            priority: priority,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            projectManagerId: employee.employeeId,
        });
        await project_service_1.projectService.addProjectMember({
            projectId: project.projectId,
            employeeId: employee.employeeId,
            role: "PROJECT_MANAGER",
        }, req.user.userId);
        return res.status(201).json({
            success: true,
            data: project,
            message: "Project created successfully",
        });
    }
    catch (error) {
        console.error("Error creating project:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to create project",
        });
    }
};
exports.createProject = createProject;
const getProjects = async (req, res) => {
    try {
        const { status, employeeId, isRecent, limit, offset } = req.query;
        const { projects, total } = await project_service_1.projectService.getProjects({
            status: status,
            employeeId: employeeId,
            isRecent: isRecent === "true",
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined,
        });
        return res.status(200).json({
            success: true,
            data: projects,
            total,
        });
    }
    catch (error) {
        console.error("Error fetching projects:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch projects",
        });
    }
};
exports.getProjects = getProjects;
const getProjectsByEmployeeId = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { status, isRecent, limit, offset } = req.query;
        if (!employeeId) {
            return res.status(400).json({
                success: false,
                error: "Employee ID is required",
            });
        }
        const { projects, total } = await project_service_1.projectService.getProjectsByEmployeeId({
            employeeId,
            status: status,
            isRecent: isRecent === "true",
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined,
        });
        return res.status(200).json({
            success: true,
            data: projects,
            total,
        });
    }
    catch (error) {
        console.error("Error fetching projects by employee ID:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch projects by employee ID",
        });
    }
};
exports.getProjectsByEmployeeId = getProjectsByEmployeeId;
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await project_service_1.projectService.getProjectById(id);
        if (!project) {
            return res.status(404).json({
                success: false,
                error: "Project not found",
            });
        }
        await project_service_1.projectService.markProjectAsRecent(id);
        return res.status(200).json({
            success: true,
            data: project,
        });
    }
    catch (error) {
        console.error("Error fetching project:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch project",
        });
    }
};
exports.getProjectById = getProjectById;
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const project = await project_service_1.projectService.updateProject(id, updateData);
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
    }
    catch (error) {
        console.error("Error updating project:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to update project",
        });
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await project_service_1.projectService.deleteProject(id);
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
    }
    catch (error) {
        console.error("Error deleting project:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to delete project",
        });
    }
};
exports.deleteProject = deleteProject;
const createSprint = async (req, res) => {
    try {
        const { name, goal, projectId, startDate, endDate, status } = req.body;
        if (!name || !projectId || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: "Name, projectId, startDate, and endDate are required",
            });
        }
        const sprint = await project_service_1.projectService.createSprint({
            name,
            goal,
            projectId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            status: status,
        });
        return res.status(201).json({
            success: true,
            data: sprint,
            message: "Sprint created successfully",
        });
    }
    catch (error) {
        console.error("Error creating sprint:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to create sprint",
        });
    }
};
exports.createSprint = createSprint;
const getSprintsByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { status, limit, offset } = req.query;
        const { sprints, total } = await project_service_1.projectService.getSprintsByProject(projectId, {
            status: status,
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined,
        });
        return res.status(200).json({
            success: true,
            data: sprints,
            total,
        });
    }
    catch (error) {
        console.error("Error fetching sprints:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch sprints",
        });
    }
};
exports.getSprintsByProject = getSprintsByProject;
const getSprintById = async (req, res) => {
    try {
        const { id } = req.params;
        const sprint = await project_service_1.projectService.getSprintById(id);
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
    }
    catch (error) {
        console.error("Error fetching sprint:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch sprint",
        });
    }
};
exports.getSprintById = getSprintById;
const updateSprint = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const sprint = await project_service_1.projectService.updateSprint(id, updateData);
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
    }
    catch (error) {
        console.error("Error updating sprint:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to update sprint",
        });
    }
};
exports.updateSprint = updateSprint;
const deleteSprint = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await project_service_1.projectService.deleteSprint(id);
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
    }
    catch (error) {
        console.error("Error deleting sprint:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to delete sprint",
        });
    }
};
exports.deleteSprint = deleteSprint;
const createTask = async (req, res) => {
    try {
        const { title, description, sprintId, status, priority, taskType, assignedTo, storyPoints, estimatedHours, } = req.body;
        if (!title || !sprintId) {
            return res.status(400).json({
                success: false,
                error: "Title and sprintId are required",
            });
        }
        const task = await project_service_1.projectService.createTask({
            title,
            description,
            sprintId,
            status: status,
            priority: priority,
            taskType: taskType,
            assignedTo,
            storyPoints,
            estimatedHours,
        }, req.user?.userId);
        return res.status(201).json({
            success: true,
            data: task,
            message: "Task created successfully",
        });
    }
    catch (error) {
        console.error("Error creating task:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to create task",
        });
    }
};
exports.createTask = createTask;
const getTasksBySprint = async (req, res) => {
    try {
        const { sprintId } = req.params;
        const { status, assignedTo, limit, offset } = req.query;
        const { tasks, total } = await project_service_1.projectService.getTasksBySprint(sprintId, {
            status: status,
            assignedTo: assignedTo,
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined,
        });
        return res.status(200).json({
            success: true,
            data: tasks,
            total,
        });
    }
    catch (error) {
        console.error("Error fetching tasks:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch tasks",
        });
    }
};
exports.getTasksBySprint = getTasksBySprint;
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await project_service_1.projectService.getTaskById(id);
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
    }
    catch (error) {
        console.error("Error fetching task:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch task",
        });
    }
};
exports.getTaskById = getTaskById;
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const task = await project_service_1.projectService.updateTask(id, updateData, req.user?.userId);
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
    }
    catch (error) {
        console.error("Error updating task:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to update task",
        });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await project_service_1.projectService.deleteTask(id);
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
    }
    catch (error) {
        console.error("Error deleting task:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to delete task",
        });
    }
};
exports.deleteTask = deleteTask;
const getTasksByEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { status, limit, offset } = req.query;
        const { tasks, total } = await project_service_1.projectService.getTasksByEmployee(employeeId, {
            status: status,
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined,
        });
        return res.status(200).json({
            success: true,
            data: tasks,
            total,
        });
    }
    catch (error) {
        console.error("Error fetching employee tasks:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch employee tasks",
        });
    }
};
exports.getTasksByEmployee = getTasksByEmployee;
const addComment = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { content } = req.body;
        const authorId = req.user.userId;
        if (!content) {
            return res.status(400).json({
                success: false,
                error: "Comment content is required",
            });
        }
        const employee = await project_service_1.projectService["employeeRepository"].findOne({
            where: { userId: authorId },
        });
        if (!employee) {
            return res.status(404).json({
                success: false,
                error: "Employee not found",
            });
        }
        const comment = await project_service_1.projectService.addComment({
            taskId,
            authorId: employee.employeeId,
            content,
        });
        return res.status(201).json({
            success: true,
            data: comment,
            message: "Comment added successfully",
        });
    }
    catch (error) {
        console.error("Error adding comment:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to add comment",
        });
    }
};
exports.addComment = addComment;
const getCommentsByTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const comments = await project_service_1.projectService.getCommentsByTask(taskId);
        return res.status(200).json({
            success: true,
            data: comments,
        });
    }
    catch (error) {
        console.error("Error fetching comments:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch comments",
        });
    }
};
exports.getCommentsByTask = getCommentsByTask;
const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({
                success: false,
                error: "Comment content is required",
            });
        }
        const comment = await project_service_1.projectService.updateComment(commentId, content);
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
    }
    catch (error) {
        console.error("Error updating comment:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to update comment",
        });
    }
};
exports.updateComment = updateComment;
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const deleted = await project_service_1.projectService.deleteComment(commentId);
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
    }
    catch (error) {
        console.error("Error deleting comment:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to delete comment",
        });
    }
};
exports.deleteComment = deleteComment;
const addAttachment = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { fileName, filePath, fileSize, mimeType, type } = req.body;
        const uploadedByUserId = req.user.userId;
        const employee = await project_service_1.projectService["employeeRepository"].findOne({
            where: { userId: uploadedByUserId },
        });
        if (!employee) {
            return res.status(404).json({
                success: false,
                error: "Employee not found",
            });
        }
        const attachment = await project_service_1.projectService.addAttachment({
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
    }
    catch (error) {
        console.error("Error adding attachment:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to add attachment",
        });
    }
};
exports.addAttachment = addAttachment;
const getAttachmentsByTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const attachments = await project_service_1.projectService.getAttachmentsByTask(taskId);
        return res.status(200).json({
            success: true,
            data: attachments,
        });
    }
    catch (error) {
        console.error("Error fetching attachments:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch attachments",
        });
    }
};
exports.getAttachmentsByTask = getAttachmentsByTask;
const deleteAttachment = async (req, res) => {
    try {
        const { attachmentId } = req.params;
        const deleted = await project_service_1.projectService.deleteAttachment(attachmentId);
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
    }
    catch (error) {
        console.error("Error deleting attachment:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to delete attachment",
        });
    }
};
exports.deleteAttachment = deleteAttachment;
const addSprintMember = async (req, res) => {
    try {
        const { sprintId } = req.params;
        const { employeeId, role } = req.body;
        if (!employeeId) {
            return res.status(400).json({
                success: false,
                error: "Employee ID is required",
            });
        }
        const member = await project_service_1.projectService.addSprintMember({
            sprintId,
            employeeId,
            role,
        }, req.user?.userId);
        return res.status(201).json({
            success: true,
            data: member,
            message: "Sprint member added successfully",
        });
    }
    catch (error) {
        console.error("Error adding sprint member:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to add sprint member",
        });
    }
};
exports.addSprintMember = addSprintMember;
const removeSprintMember = async (req, res) => {
    try {
        const { sprintId, employeeId } = req.params;
        await project_service_1.projectService.removeSprintMember(sprintId, employeeId, req.user?.userId);
        return res.status(200).json({
            success: true,
            message: "Sprint member removed successfully",
        });
    }
    catch (error) {
        console.error("Error removing sprint member:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to remove sprint member",
        });
    }
};
exports.removeSprintMember = removeSprintMember;
const updateSprintMemberRole = async (req, res) => {
    try {
        const { sprintId, employeeId } = req.params;
        const { role } = req.body;
        if (!role) {
            return res.status(400).json({
                success: false,
                error: "Role is required",
            });
        }
        const member = await project_service_1.projectService.updateSprintMemberRole(sprintId, employeeId, role);
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
    }
    catch (error) {
        console.error("Error updating sprint member role:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to update sprint member role",
        });
    }
};
exports.updateSprintMemberRole = updateSprintMemberRole;
const getSprintMembers = async (req, res) => {
    try {
        const { sprintId } = req.params;
        const { activeOnly } = req.query;
        const members = activeOnly === "true"
            ? await project_service_1.projectService.getActiveSprintMembers(sprintId)
            : await project_service_1.projectService.getSprintMembers(sprintId);
        return res.status(200).json({
            success: true,
            data: members,
        });
    }
    catch (error) {
        console.error("Error fetching sprint members:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch sprint members",
        });
    }
};
exports.getSprintMembers = getSprintMembers;
const addProjectMember = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { employeeId, role } = req.body;
        if (!employeeId) {
            return res.status(400).json({
                success: false,
                error: "Employee ID is required",
            });
        }
        const member = await project_service_1.projectService.addProjectMember({
            projectId,
            employeeId,
            role,
        }, req.user?.userId);
        return res.status(201).json({
            success: true,
            data: member,
            message: "Project member added successfully",
        });
    }
    catch (error) {
        console.error("Error adding project member:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to add project member",
        });
    }
};
exports.addProjectMember = addProjectMember;
const removeProjectMember = async (req, res) => {
    try {
        const { projectId, employeeId } = req.params;
        await project_service_1.projectService.removeProjectMember(projectId, employeeId, req.user?.userId);
        return res.status(200).json({
            success: true,
            message: "Project member removed successfully",
        });
    }
    catch (error) {
        console.error("Error removing project member:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to remove project member",
        });
    }
};
exports.removeProjectMember = removeProjectMember;
const updateProjectMemberRole = async (req, res) => {
    try {
        const { projectId, employeeId } = req.params;
        const { role } = req.body;
        if (!role) {
            return res.status(400).json({
                success: false,
                error: "Role is required",
            });
        }
        const member = await project_service_1.projectService.updateProjectMemberRole(projectId, employeeId, role);
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
    }
    catch (error) {
        console.error("Error updating project member role:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to update project member role",
        });
    }
};
exports.updateProjectMemberRole = updateProjectMemberRole;
const getProjectMembers = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { activeOnly } = req.query;
        const members = activeOnly === "true"
            ? await project_service_1.projectService.getActiveProjectMembers(projectId)
            : await project_service_1.projectService.getProjectMembers(projectId);
        return res.status(200).json({
            success: true,
            data: members,
        });
    }
    catch (error) {
        console.error("Error fetching project members:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch project members",
        });
    }
};
exports.getProjectMembers = getProjectMembers;
exports.projectController = {
    createProject: exports.createProject,
    getProjects: exports.getProjects,
    getProjectsByEmployeeId: exports.getProjectsByEmployeeId,
    getProjectById: exports.getProjectById,
    updateProject: exports.updateProject,
    deleteProject: exports.deleteProject,
    addProjectMember: exports.addProjectMember,
    removeProjectMember: exports.removeProjectMember,
    updateProjectMemberRole: exports.updateProjectMemberRole,
    getProjectMembers: exports.getProjectMembers,
    createSprint: exports.createSprint,
    getSprintsByProject: exports.getSprintsByProject,
    getSprintById: exports.getSprintById,
    updateSprint: exports.updateSprint,
    deleteSprint: exports.deleteSprint,
    createTask: exports.createTask,
    getTasksBySprint: exports.getTasksBySprint,
    getTaskById: exports.getTaskById,
    updateTask: exports.updateTask,
    deleteTask: exports.deleteTask,
    getTasksByEmployee: exports.getTasksByEmployee,
    addSprintMember: exports.addSprintMember,
    removeSprintMember: exports.removeSprintMember,
    updateSprintMemberRole: exports.updateSprintMemberRole,
    getSprintMembers: exports.getSprintMembers,
    addComment: exports.addComment,
    getCommentsByTask: exports.getCommentsByTask,
    updateComment: exports.updateComment,
    deleteComment: exports.deleteComment,
    addAttachment: exports.addAttachment,
    getAttachmentsByTask: exports.getAttachmentsByTask,
    deleteAttachment: exports.deleteAttachment,
};
//# sourceMappingURL=project.controller.js.map