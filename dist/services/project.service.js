"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectService = exports.ProjectService = void 0;
const typeorm_1 = require("../config/typeorm");
const models_1 = require("../models");
const notification_service_1 = require("./notification.service");
class ProjectService {
    constructor() {
        this.projectRepository = typeorm_1.AppDataSource.getRepository(models_1.Project);
        this.projectMemberRepository = typeorm_1.AppDataSource.getRepository(models_1.ProjectMember);
        this.sprintRepository = typeorm_1.AppDataSource.getRepository(models_1.Sprint);
        this.taskRepository = typeorm_1.AppDataSource.getRepository(models_1.Task);
        this.sprintMemberRepository = typeorm_1.AppDataSource.getRepository(models_1.SprintMember);
        this.employeeRepository = typeorm_1.AppDataSource.getRepository(models_1.Employee);
        this.commentRepository = typeorm_1.AppDataSource.getRepository(models_1.TaskComment);
        this.attachmentRepository = typeorm_1.AppDataSource.getRepository(models_1.TaskAttachment);
    }
    async createProject(data) {
        const { members, ...projectData } = data;
        const project = this.projectRepository.create(projectData);
        const savedProject = await this.projectRepository.save(project);
        if (members && members.length > 0) {
            for (const member of members) {
                const projectMember = this.projectMemberRepository.create({
                    projectId: savedProject.projectId,
                    employeeId: member.employeeId,
                    role: member.role,
                    joinedAt: new Date(),
                });
                await this.projectMemberRepository.save(projectMember);
            }
        }
        return savedProject;
    }
    async getProjects(options) {
        const queryBuilder = this.projectRepository
            .createQueryBuilder("project")
            .leftJoin("project.projectManager", "manager")
            .addSelect([
            "manager.employeeId",
            "manager.firstName",
            "manager.lastName",
        ])
            .leftJoinAndSelect("project.sprints", "sprints")
            .leftJoinAndSelect("project.members", "projectMembers")
            .leftJoinAndSelect("projectMembers.employee", "memberEmployee")
            .orderBy("project.lastAccessedAt", "DESC")
            .addOrderBy("project.createdAt", "DESC");
        if (options?.status) {
            queryBuilder.andWhere("project.status = :status", {
                status: options.status,
            });
        }
        if (options?.employeeId) {
            queryBuilder.andWhere("(projectMembers.employeeId = :employeeId AND projectMembers.leftAt IS NULL)", { employeeId: options.employeeId });
        }
        if (options?.isRecent !== undefined) {
            queryBuilder.andWhere("project.isRecent = :isRecent", {
                isRecent: options.isRecent,
            });
        }
        const total = await queryBuilder.getCount();
        if (options?.limit) {
            queryBuilder.limit(options.limit);
        }
        if (options?.offset) {
            queryBuilder.offset(options.offset);
        }
        const projects = await queryBuilder.getMany();
        return { projects, total };
    }
    async getProjectsByEmployeeId(options) {
        const queryBuilder = this.projectRepository
            .createQueryBuilder("project")
            .leftJoin("project.members", "projectMembers")
            .leftJoin("project.projectManager", "manager")
            .addSelect([
            "manager.employeeId",
            "manager.firstName",
            "manager.lastName",
        ])
            .leftJoinAndSelect("project.sprints", "sprints")
            .leftJoinAndSelect("project.members", "allMembers")
            .leftJoinAndSelect("allMembers.employee", "memberEmployee")
            .where("(projectMembers.employeeId = :employeeId AND projectMembers.leftAt IS NULL) OR project.projectManagerId = :employeeId", { employeeId: options.employeeId })
            .orderBy("project.lastAccessedAt", "DESC")
            .addOrderBy("project.createdAt", "DESC");
        if (options.status) {
            queryBuilder.andWhere("project.status = :status", {
                status: options.status,
            });
        }
        if (options.isRecent !== undefined) {
            queryBuilder.andWhere("project.isRecent = :isRecent", {
                isRecent: options.isRecent,
            });
        }
        const total = await queryBuilder.getCount();
        if (options.limit) {
            queryBuilder.limit(options.limit);
        }
        if (options.offset) {
            queryBuilder.offset(options.offset);
        }
        const projects = await queryBuilder.getMany();
        return { projects, total };
    }
    async getProjectById(projectId) {
        const project = await this.projectRepository.findOne({
            where: { projectId },
            relations: [
                "projectManager",
                "members",
                "members.employee",
                "sprints",
                "sprints.tasks",
                "sprints.members",
                "sprints.members.employee",
            ],
        });
        if (!project)
            return null;
        if (project.members) {
            project.members = project.members.filter((m) => !m.leftAt);
        }
        return project;
    }
    async updateProject(projectId, data) {
        const project = await this.projectRepository.findOne({
            where: { projectId },
            relations: ["members"],
        });
        console.log("Members input:", data.members);
        console.log("Existing members:", project);
        if (!project)
            return null;
        if (data.members !== undefined) {
            const newMembers = data.members;
            console.log(newMembers);
            const existingMembers = project.members || [];
            const existingMemberIds = existingMembers
                .filter((m) => !m.leftAt)
                .map((m) => m.employeeId);
            const newMemberIds = newMembers.map((m) => m.employeeId);
            console.log(existingMemberIds);
            for (const existingMember of existingMembers) {
                if (!existingMember.leftAt &&
                    !newMemberIds.includes(existingMember.employeeId)) {
                    existingMember.leftAt = new Date();
                    await this.projectMemberRepository.save(existingMember);
                }
            }
            for (const newMember of newMembers) {
                const existingMember = existingMembers.find((m) => m.employeeId === newMember.employeeId);
                if (existingMember) {
                    if (existingMember.leftAt) {
                        existingMember.leftAt = null;
                    }
                    existingMember.role = newMember.role;
                    await this.projectMemberRepository.save(existingMember);
                }
                else {
                    const projectMember = this.projectMemberRepository.create({
                        projectId: project.projectId,
                        employeeId: newMember.employeeId,
                        role: newMember.role,
                        joinedAt: new Date(),
                    });
                    await this.projectMemberRepository.save(projectMember);
                }
            }
            delete data.members;
        }
        Object.assign(project, data);
        await this.projectRepository.save(project);
        const updatedProject = await this.projectRepository.findOne({
            where: { projectId },
            relations: [
                "projectManager",
                "members",
                "members.employee",
                "sprints",
                "sprints.tasks",
                "sprints.members",
                "sprints.members.employee",
            ],
        });
        if (!updatedProject)
            return null;
        if (updatedProject.members) {
            updatedProject.members = updatedProject.members.filter((m) => !m.leftAt);
        }
        return updatedProject;
    }
    async markProjectAsRecent(projectId) {
        const project = await this.projectRepository.findOne({
            where: { projectId },
        });
        if (!project)
            return null;
        project.markAsRecent();
        return await this.projectRepository.save(project);
    }
    async deleteProject(projectId) {
        const result = await this.projectRepository.delete(projectId);
        return result.affected !== 0;
    }
    async createSprint(data) {
        const sprint = this.sprintRepository.create(data);
        return await this.sprintRepository.save(sprint);
    }
    async getSprintsByProject(projectId, options) {
        const queryBuilder = this.sprintRepository
            .createQueryBuilder("sprint")
            .leftJoinAndSelect("sprint.tasks", "tasks")
            .leftJoinAndSelect("tasks.assignee", "assignee")
            .leftJoinAndSelect("sprint.members", "members")
            .leftJoinAndSelect("members.employee", "employee")
            .where("sprint.projectId = :projectId", { projectId })
            .orderBy("sprint.startDate", "ASC");
        if (options?.status) {
            queryBuilder.andWhere("sprint.status = :status", {
                status: options.status,
            });
        }
        const total = await queryBuilder.getCount();
        if (options?.limit) {
            queryBuilder.limit(options.limit);
        }
        if (options?.offset) {
            queryBuilder.offset(options.offset);
        }
        const sprints = await queryBuilder.getMany();
        return { sprints, total };
    }
    async getSprintById(sprintId) {
        return await this.sprintRepository.findOne({
            where: { sprintId },
            relations: [
                "project",
                "tasks",
                "tasks.assignee",
                "members",
                "members.employee",
            ],
        });
    }
    async updateSprint(sprintId, data) {
        const sprint = await this.sprintRepository.findOne({
            where: { sprintId },
        });
        if (!sprint)
            return null;
        Object.assign(sprint, data);
        return await this.sprintRepository.save(sprint);
    }
    async deleteSprint(sprintId) {
        const result = await this.sprintRepository.delete(sprintId);
        return result.affected !== 0;
    }
    async createTask(data, createdByUserId) {
        const task = this.taskRepository.create(data);
        const savedTask = await this.taskRepository.save(task);
        if (data.assignedTo) {
            try {
                const employee = await this.employeeRepository.findOne({
                    where: { employeeId: data.assignedTo },
                    relations: ["user"],
                });
                if (employee?.user) {
                    const sprint = await this.sprintRepository.findOne({
                        where: { sprintId: data.sprintId },
                        relations: ["project"],
                    });
                    if (sprint) {
                        const createdBy = createdByUserId
                            ? await typeorm_1.AppDataSource.getRepository("User").findOne({
                                where: { userId: createdByUserId },
                            })
                            : null;
                        await notification_service_1.notificationService.notifyTaskAssigned({
                            employeeUserId: employee.user.userId,
                            taskTitle: data.title,
                            taskId: savedTask.taskId,
                            projectName: sprint.project.name,
                            sprintName: sprint.name,
                            priority: data.priority || models_1.TaskPriority.MEDIUM,
                            assignedByName: createdBy
                                ? `${createdBy.firstName} ${createdBy.lastName}`
                                : "System",
                            assignedByUserId: createdByUserId,
                        });
                    }
                }
            }
            catch (error) {
                console.error("Error sending task assignment notification:", error);
            }
        }
        return savedTask;
    }
    async getTasksBySprint(sprintId, options) {
        const queryBuilder = this.taskRepository
            .createQueryBuilder("task")
            .leftJoin("task.assignee", "assignee")
            .addSelect([
            "assignee.employeeId",
            "assignee.firstName",
            "assignee.lastName",
        ])
            .where("task.sprintId = :sprintId", { sprintId })
            .orderBy("task.createdAt", "DESC");
        if (options?.status) {
            queryBuilder.andWhere("task.status = :status", {
                status: options.status,
            });
        }
        if (options?.assignedTo) {
            queryBuilder.andWhere("task.assignedTo = :assignedTo", {
                assignedTo: options.assignedTo,
            });
        }
        const total = await queryBuilder.getCount();
        if (options?.limit) {
            queryBuilder.limit(options.limit);
        }
        if (options?.offset) {
            queryBuilder.offset(options.offset);
        }
        const tasks = await queryBuilder.getMany();
        return { tasks, total };
    }
    async getTaskById(taskId) {
        return await this.taskRepository.findOne({
            where: { taskId },
            relations: [
                "sprint",
                "sprint.project",
                "assignee",
                "comments",
                "comments.author",
                "attachments",
                "attachments.uploadedBy",
            ],
        });
    }
    async updateTask(taskId, data, updatedByUserId) {
        const task = await this.taskRepository.findOne({
            where: { taskId },
            relations: ["sprint", "sprint.project", "assignee", "assignee.user"],
        });
        if (!task)
            return null;
        const oldStatus = task.status;
        const oldAssignedTo = task.assignedTo;
        Object.assign(task, data);
        const updatedTask = await this.taskRepository.save(task);
        try {
            const updatedBy = updatedByUserId
                ? await typeorm_1.AppDataSource.getRepository("User").findOne({
                    where: { userId: updatedByUserId },
                })
                : null;
            const updatedByName = updatedBy
                ? `${updatedBy.firstName} ${updatedBy.lastName}`
                : "System";
            if (data.status && oldStatus !== data.status && task.assignee?.user) {
                await notification_service_1.notificationService.notifyTaskStatusUpdated({
                    employeeUserId: task.assignee.user.userId,
                    taskTitle: task.title,
                    taskId: task.taskId,
                    oldStatus,
                    newStatus: data.status,
                    projectName: task.sprint.project.name,
                    sprintName: task.sprint.name,
                    updatedByName,
                    updatedByUserId,
                });
                if (data.status === models_1.TaskStatus.DONE) {
                    const sprintMembers = await this.getActiveSprintMembers(task.sprintId);
                    const memberUserIds = sprintMembers
                        .map((m) => m.employee?.user?.userId)
                        .filter(Boolean);
                    if (memberUserIds.length > 0 && updatedByUserId) {
                        await notification_service_1.notificationService.notifyTaskCompleted({
                            teamMemberUserIds: memberUserIds,
                            taskTitle: task.title,
                            taskId: task.taskId,
                            completedByName: updatedByName,
                            completedByUserId: updatedByUserId,
                            projectName: task.sprint.project.name,
                            sprintName: task.sprint.name,
                        });
                    }
                }
            }
            if (data.assignedTo &&
                oldAssignedTo !== data.assignedTo &&
                data.assignedTo) {
                const newEmployee = await this.employeeRepository.findOne({
                    where: { employeeId: data.assignedTo },
                    relations: ["user"],
                });
                const oldEmployee = oldAssignedTo
                    ? await this.employeeRepository.findOne({
                        where: { employeeId: oldAssignedTo },
                        relations: ["user"],
                    })
                    : null;
                if (newEmployee?.user) {
                    await notification_service_1.notificationService.notifyTaskReassigned({
                        newEmployeeUserId: newEmployee.user.userId,
                        oldEmployeeUserId: oldEmployee?.user?.userId,
                        taskTitle: task.title,
                        taskId: task.taskId,
                        projectName: task.sprint.project.name,
                        sprintName: task.sprint.name,
                        reassignedByName: updatedByName,
                        reassignedByUserId: updatedByUserId,
                    });
                }
            }
        }
        catch (error) {
            console.error("Error sending task update notifications:", error);
        }
        return updatedTask;
    }
    async deleteTask(taskId) {
        const result = await this.taskRepository.delete(taskId);
        return result.affected !== 0;
    }
    async getTasksByEmployee(employeeId, options) {
        const queryBuilder = this.taskRepository
            .createQueryBuilder("task")
            .leftJoinAndSelect("task.sprint", "sprint")
            .leftJoinAndSelect("sprint.project", "project")
            .where("task.assignedTo = :employeeId", { employeeId })
            .orderBy("task.createdAt", "DESC");
        if (options?.status) {
            queryBuilder.andWhere("task.status = :status", {
                status: options.status,
            });
        }
        const total = await queryBuilder.getCount();
        if (options?.limit) {
            queryBuilder.limit(options.limit);
        }
        if (options?.offset) {
            queryBuilder.offset(options.offset);
        }
        const tasks = await queryBuilder.getMany();
        return { tasks, total };
    }
    async addSprintMember(data, addedByUserId) {
        const existing = await this.sprintMemberRepository.findOne({
            where: {
                sprintId: data.sprintId,
                employeeId: data.employeeId,
            },
        });
        if (existing && !existing.leftAt) {
            throw new Error("Employee is already a member of this sprint");
        }
        const member = this.sprintMemberRepository.create({
            sprintId: data.sprintId,
            employeeId: data.employeeId,
            role: data.role || models_1.SprintMemberRole.DEVELOPER,
        });
        const savedMember = await this.sprintMemberRepository.save(member);
        try {
            const employee = await this.employeeRepository.findOne({
                where: { employeeId: data.employeeId },
                relations: ["user"],
            });
            const sprint = await this.sprintRepository.findOne({
                where: { sprintId: data.sprintId },
                relations: ["project"],
            });
            if (employee?.user && sprint) {
                const addedBy = addedByUserId
                    ? await typeorm_1.AppDataSource.getRepository("User").findOne({
                        where: { userId: addedByUserId },
                    })
                    : null;
                const addedByName = addedBy
                    ? `${addedBy.firstName} ${addedBy.lastName}`
                    : "System";
                await notification_service_1.notificationService.notifyAddedToSprint({
                    employeeUserId: employee.user.userId,
                    sprintName: sprint.name,
                    projectName: sprint.project.name,
                    role: savedMember.role,
                    addedByName,
                    addedByUserId,
                });
            }
        }
        catch (error) {
            console.error("Error sending sprint member notification:", error);
        }
        return savedMember;
    }
    async removeSprintMember(sprintId, employeeId, removedByUserId) {
        const member = await this.sprintMemberRepository
            .createQueryBuilder("member")
            .where("member.sprintId = :sprintId", { sprintId })
            .andWhere("member.employeeId = :employeeId", { employeeId })
            .andWhere("member.leftAt IS NULL")
            .getOne();
        if (member) {
            member.leave();
            await this.sprintMemberRepository.save(member);
            try {
                const employee = await this.employeeRepository.findOne({
                    where: { employeeId },
                    relations: ["user"],
                });
                const sprint = await this.sprintRepository.findOne({
                    where: { sprintId },
                    relations: ["project"],
                });
                if (employee?.user && sprint) {
                    const removedBy = removedByUserId
                        ? await typeorm_1.AppDataSource.getRepository("User").findOne({
                            where: { userId: removedByUserId },
                        })
                        : null;
                    const removedByName = removedBy
                        ? `${removedBy.firstName} ${removedBy.lastName}`
                        : "System";
                    await notification_service_1.notificationService.notifyRemovedFromSprint({
                        employeeUserId: employee.user.userId,
                        sprintName: sprint.name,
                        projectName: sprint.project.name,
                        removedByName,
                        removedByUserId,
                    });
                }
            }
            catch (error) {
                console.error("Error sending sprint removal notification:", error);
            }
        }
    }
    async updateSprintMemberRole(sprintId, employeeId, role) {
        const member = await this.sprintMemberRepository
            .createQueryBuilder("member")
            .where("member.sprintId = :sprintId", { sprintId })
            .andWhere("member.employeeId = :employeeId", { employeeId })
            .andWhere("member.leftAt IS NULL")
            .getOne();
        if (!member)
            return null;
        member.role = role;
        return await this.sprintMemberRepository.save(member);
    }
    async getSprintMembers(sprintId) {
        return await this.sprintMemberRepository.find({
            where: { sprintId },
            relations: ["employee"],
            order: { joinedAt: "ASC" },
        });
    }
    async getActiveSprintMembers(sprintId) {
        return await this.sprintMemberRepository
            .createQueryBuilder("member")
            .leftJoinAndSelect("member.employee", "employee")
            .where("member.sprintId = :sprintId", { sprintId })
            .andWhere("member.leftAt IS NULL")
            .orderBy("member.joinedAt", "ASC")
            .getMany();
    }
    async addComment(data) {
        const comment = this.commentRepository.create(data);
        return await this.commentRepository.save(comment);
    }
    async getCommentsByTask(taskId) {
        return await this.commentRepository.find({
            where: { taskId },
            relations: ["author"],
            order: { createdAt: "ASC" },
        });
    }
    async updateComment(commentId, content) {
        const comment = await this.commentRepository.findOne({
            where: { commentId },
        });
        if (!comment)
            return null;
        comment.content = content;
        return await this.commentRepository.save(comment);
    }
    async deleteComment(commentId) {
        const result = await this.commentRepository.delete(commentId);
        return (result.affected ?? 0) > 0;
    }
    async addAttachment(data) {
        const attachment = this.attachmentRepository.create(data);
        return await this.attachmentRepository.save(attachment);
    }
    async getAttachmentsByTask(taskId) {
        return await this.attachmentRepository.find({
            where: { taskId },
            relations: ["uploadedBy"],
            order: { uploadedAt: "DESC" },
        });
    }
    async deleteAttachment(attachmentId) {
        const result = await this.attachmentRepository.delete(attachmentId);
        return (result.affected ?? 0) > 0;
    }
    async getAttachmentById(attachmentId) {
        return await this.attachmentRepository.findOne({
            where: { attachmentId },
            relations: ["uploadedBy", "task"],
        });
    }
    async addProjectMember(data, addedByUserId) {
        const existing = await this.projectMemberRepository.findOne({
            where: {
                projectId: data.projectId,
                employeeId: data.employeeId,
            },
        });
        if (existing && !existing.leftAt) {
            throw new Error("Employee is already a member of this project");
        }
        const member = this.projectMemberRepository.create({
            projectId: data.projectId,
            employeeId: data.employeeId,
            role: data.role || models_1.ProjectMemberRole.DEVELOPER,
            joinedAt: new Date(),
        });
        const savedMember = await this.projectMemberRepository.save(member);
        try {
            const employee = await this.employeeRepository.findOne({
                where: { employeeId: data.employeeId },
                relations: ["user"],
            });
            const project = await this.projectRepository.findOne({
                where: { projectId: data.projectId },
            });
            if (employee?.user && project) {
                const addedBy = addedByUserId
                    ? await typeorm_1.AppDataSource.getRepository("User").findOne({
                        where: { userId: addedByUserId },
                    })
                    : null;
                const addedByName = addedBy
                    ? `${addedBy.firstName} ${addedBy.lastName}`
                    : "System";
                await notification_service_1.notificationService.notifyAddedToProject({
                    employeeUserId: employee.user.userId,
                    projectName: project.name,
                    role: savedMember.role,
                    managerName: addedByName,
                    managerUserId: addedByUserId || "",
                });
            }
        }
        catch (error) {
            console.error("Error sending project member notification:", error);
        }
        return savedMember;
    }
    async removeProjectMember(projectId, employeeId, removedByUserId) {
        const member = await this.projectMemberRepository
            .createQueryBuilder("member")
            .where("member.projectId = :projectId", { projectId })
            .andWhere("member.employeeId = :employeeId", { employeeId })
            .andWhere("member.leftAt IS NULL")
            .getOne();
        if (member) {
            member.leave();
            await this.projectMemberRepository.save(member);
            try {
                const employee = await this.employeeRepository.findOne({
                    where: { employeeId },
                    relations: ["user"],
                });
                const project = await this.projectRepository.findOne({
                    where: { projectId },
                });
                if (employee?.user && project) {
                    const removedBy = removedByUserId
                        ? await typeorm_1.AppDataSource.getRepository("User").findOne({
                            where: { userId: removedByUserId },
                        })
                        : null;
                    await notification_service_1.notificationService.notifyRemovedFromProject({
                        employeeUserId: employee.user.userId,
                        projectName: project.name,
                        managerName: removedBy
                            ? `${removedBy.firstName} ${removedBy.lastName}`
                            : "System",
                        managerUserId: removedByUserId || "",
                    });
                }
            }
            catch (error) {
                console.error("Error sending remove member notification:", error);
            }
        }
    }
    async updateProjectMemberRole(projectId, employeeId, role) {
        const member = await this.projectMemberRepository
            .createQueryBuilder("member")
            .where("member.projectId = :projectId", { projectId })
            .andWhere("member.employeeId = :employeeId", { employeeId })
            .andWhere("member.leftAt IS NULL")
            .getOne();
        if (!member)
            return null;
        member.role = role;
        return await this.projectMemberRepository.save(member);
    }
    async getProjectMembers(projectId) {
        return await this.projectMemberRepository.find({
            where: { projectId },
            relations: ["employee", "employee.user"],
            order: { joinedAt: "ASC" },
        });
    }
    async getActiveProjectMembers(projectId) {
        return await this.projectMemberRepository
            .createQueryBuilder("member")
            .leftJoinAndSelect("member.employee", "employee")
            .leftJoinAndSelect("employee.user", "user")
            .where("member.projectId = :projectId", { projectId })
            .andWhere("member.leftAt IS NULL")
            .orderBy("member.joinedAt", "ASC")
            .getMany();
    }
}
exports.ProjectService = ProjectService;
exports.projectService = new ProjectService();
//# sourceMappingURL=project.service.js.map