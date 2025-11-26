import { AppDataSource } from "../config/typeorm";
import {
  Project,
  ProjectStatus,
  ProjectPriority,
  ProjectMember,
  ProjectMemberRole,
  Sprint,
  SprintStatus,
  Task,
  TaskStatus,
  TaskPriority,
  TaskType,
  SprintMember,
  SprintMemberRole,
  Employee,
  TaskComment,
  TaskAttachment,
  AttachmentType,
} from "../models";
import { notificationService } from "./notification.service";

export class ProjectService {
  private projectRepository = AppDataSource.getRepository(Project);
  private projectMemberRepository = AppDataSource.getRepository(ProjectMember);
  private sprintRepository = AppDataSource.getRepository(Sprint);
  private taskRepository = AppDataSource.getRepository(Task);
  private sprintMemberRepository = AppDataSource.getRepository(SprintMember);
  private employeeRepository = AppDataSource.getRepository(Employee);
  private commentRepository = AppDataSource.getRepository(TaskComment);
  private attachmentRepository = AppDataSource.getRepository(TaskAttachment);

  // ========== PROJECT METHODS ==========

  /**
   * Create a new project
   */
  async createProject(data: {
    name: string;
    description?: string;
    status?: ProjectStatus;
    priority?: ProjectPriority;
    startDate?: Date;
    endDate?: Date;
    projectManagerId: string;
    members?: Array<{ employeeId: string; role: string }>;
  }): Promise<Project> {
    const { members, ...projectData } = data;

    const project = this.projectRepository.create(projectData);
    const savedProject = await this.projectRepository.save(project);

    // Add members if provided
    if (members && members.length > 0) {
      for (const member of members) {
        const projectMember = this.projectMemberRepository.create({
          projectId: savedProject.projectId,
          employeeId: member.employeeId,
          role: member.role as any,
          joinedAt: new Date(),
        });
        await this.projectMemberRepository.save(projectMember);
      }
    }

    return savedProject;
  }

  /**
   * Get all projects with optional filters
   */
  async getProjects(options?: {
    status?: ProjectStatus;
    employeeId?: string;
    isRecent?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ projects: Project[]; total: number }> {
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
      // Filter projects where the employee is a project member (including project manager role)
      queryBuilder.andWhere(
        "(projectMembers.employeeId = :employeeId AND projectMembers.leftAt IS NULL)",
        { employeeId: options.employeeId }
      );
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

  /**
   * Get all projects for a specific employee
   */
  async getProjectsByEmployeeId(options: {
    employeeId: string;
    status?: ProjectStatus;
    isRecent?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ projects: Project[]; total: number }> {
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
      .where(
        "(projectMembers.employeeId = :employeeId AND projectMembers.leftAt IS NULL) OR project.projectManagerId = :employeeId",
        { employeeId: options.employeeId }
      )
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

  /**
   * Get a single project by ID
   */
  async getProjectById(projectId: string): Promise<Project | null> {
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
    if (!project) return null;
    if (project.members) {
      project.members = project.members.filter((m) => !m.leftAt);
    }
    return project;
  }

  /**
   * Update a project
   */
  async updateProject(
    projectId: string,
    data: Partial<Project> & {
      members?: Array<{ employeeId: string; role: string }>;
    }
  ): Promise<Project | null> {
    const project = await this.projectRepository.findOne({
      where: { projectId },
      relations: ["members"],
    });
    console.log("Members input:", data.members);
    console.log("Existing members:", project);
    if (!project) return null;

    // Handle members synchronization if provided
    if (data.members !== undefined) {
      const newMembers = data.members;
      console.log(newMembers);
      const existingMembers = project.members || [];

      // Get current active member IDs
      const existingMemberIds = existingMembers
        .filter((m) => !m.leftAt)
        .map((m) => m.employeeId);
      const newMemberIds = newMembers.map((m) => m.employeeId);

      console.log(existingMemberIds);

      // Remove members not in the new list (mark as left)
      for (const existingMember of existingMembers) {
        if (
          !existingMember.leftAt &&
          !newMemberIds.includes(existingMember.employeeId)
        ) {
          existingMember.leftAt = new Date();
          await this.projectMemberRepository.save(existingMember);
        }
      }

      // Add new members or update/reactivate roles
      for (const newMember of newMembers) {
        const existingMember = existingMembers.find(
          (m) => m.employeeId === newMember.employeeId
        );

        if (existingMember) {
          // Reactivate if previously left
          if (existingMember.leftAt) {
            existingMember.leftAt = null;
          }
          // Always update role
          existingMember.role = newMember.role as any;
          await this.projectMemberRepository.save(existingMember);
        } else {
          // Add new member (ensure projectId is set)
          const projectMember = this.projectMemberRepository.create({
            projectId: project.projectId,
            employeeId: newMember.employeeId,
            role: newMember.role as any,
            joinedAt: new Date(),
          });
          await this.projectMemberRepository.save(projectMember);
        }
      }

      // Remove members from data object to avoid TypeORM issues
      delete data.members;
    }

    // Update other project fields
    Object.assign(project, data);
    await this.projectRepository.save(project);

    // Reload project with full relations
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
    if (!updatedProject) return null;
    // Only return active members
    if (updatedProject.members) {
      updatedProject.members = updatedProject.members.filter((m) => !m.leftAt);
    }
    return updatedProject;
  }

  /**
   * Mark project as recent
   */
  async markProjectAsRecent(projectId: string): Promise<Project | null> {
    const project = await this.projectRepository.findOne({
      where: { projectId },
    });

    if (!project) return null;

    project.markAsRecent();
    return await this.projectRepository.save(project);
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<boolean> {
    const result = await this.projectRepository.delete(projectId);
    return result.affected !== 0;
  }

  // ========== SPRINT METHODS ==========

  /**
   * Create a new sprint
   */
  async createSprint(data: {
    name: string;
    goal?: string;
    projectId: string;
    startDate: Date;
    endDate: Date;
    status?: SprintStatus;
  }): Promise<Sprint> {
    const sprint = this.sprintRepository.create(data);
    return await this.sprintRepository.save(sprint);
  }

  /**
   * Get sprints for a project
   */
  async getSprintsByProject(
    projectId: string,
    options?: {
      status?: SprintStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ sprints: Sprint[]; total: number }> {
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

  /**
   * Get a single sprint by ID
   */
  async getSprintById(sprintId: string): Promise<Sprint | null> {
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

  /**
   * Update a sprint
   */
  async updateSprint(
    sprintId: string,
    data: Partial<Sprint>
  ): Promise<Sprint | null> {
    const sprint = await this.sprintRepository.findOne({
      where: { sprintId },
    });

    if (!sprint) return null;

    Object.assign(sprint, data);
    return await this.sprintRepository.save(sprint);
  }

  /**
   * Delete a sprint
   */
  async deleteSprint(sprintId: string): Promise<boolean> {
    const result = await this.sprintRepository.delete(sprintId);
    return result.affected !== 0;
  }

  // ========== TASK METHODS ==========

  /**
   * Create a new task
   */
  async createTask(
    data: {
      title: string;
      description?: string;
      sprintId: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      taskType?: TaskType;
      assignedTo?: string;
      storyPoints?: number;
      estimatedHours?: number;
    },
    createdByUserId?: string
  ): Promise<Task> {
    const task = this.taskRepository.create(data);
    const savedTask = await this.taskRepository.save(task);

    // Send notification if task is assigned to an employee
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
              ? await AppDataSource.getRepository("User").findOne({
                  where: { userId: createdByUserId },
                })
              : null;

            await notificationService.notifyTaskAssigned({
              employeeUserId: employee.user.userId,
              taskTitle: data.title,
              taskId: savedTask.taskId,
              projectName: sprint.project.name,
              sprintName: sprint.name,
              priority: data.priority || TaskPriority.MEDIUM,
              assignedByName: createdBy
                ? `${createdBy.firstName} ${createdBy.lastName}`
                : "System",
              assignedByUserId: createdByUserId,
            });
          }
        }
      } catch (error) {
        console.error("Error sending task assignment notification:", error);
        // Don't fail the task creation if notification fails
      }
    }

    return savedTask;
  }

  /**
   * Get tasks for a sprint
   */
  async getTasksBySprint(
    sprintId: string,
    options?: {
      status?: TaskStatus;
      assignedTo?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ tasks: Task[]; total: number }> {
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

  /**
   * Get a single task by ID
   */
  async getTaskById(taskId: string): Promise<Task | null> {
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

  /**
   * Update a task
   */
  async updateTask(
    taskId: string,
    data: Partial<Task>,
    updatedByUserId?: string
  ): Promise<Task | null> {
    const task = await this.taskRepository.findOne({
      where: { taskId },
      relations: ["sprint", "sprint.project", "assignee", "assignee.user"],
    });

    if (!task) return null;

    const oldStatus = task.status;
    const oldAssignedTo = task.assignedTo;

    Object.assign(task, data);
    const updatedTask = await this.taskRepository.save(task);

    // Send notifications for changes
    try {
      const updatedBy = updatedByUserId
        ? await AppDataSource.getRepository("User").findOne({
            where: { userId: updatedByUserId },
          })
        : null;
      const updatedByName = updatedBy
        ? `${updatedBy.firstName} ${updatedBy.lastName}`
        : "System";

      // Notify on status change
      if (data.status && oldStatus !== data.status && task.assignee?.user) {
        await notificationService.notifyTaskStatusUpdated({
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

        // If task is completed, notify sprint members
        if (data.status === TaskStatus.DONE) {
          const sprintMembers = await this.getActiveSprintMembers(
            task.sprintId
          );
          const memberUserIds = sprintMembers
            .map((m) => m.employee?.user?.userId)
            .filter(Boolean) as string[];

          if (memberUserIds.length > 0 && updatedByUserId) {
            await notificationService.notifyTaskCompleted({
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

      // Notify on reassignment
      if (
        data.assignedTo &&
        oldAssignedTo !== data.assignedTo &&
        data.assignedTo
      ) {
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
          await notificationService.notifyTaskReassigned({
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
    } catch (error) {
      console.error("Error sending task update notifications:", error);
      // Don't fail the task update if notification fails
    }

    return updatedTask;
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<boolean> {
    const result = await this.taskRepository.delete(taskId);
    return result.affected !== 0;
  }

  /**
   * Get tasks assigned to an employee
   */
  async getTasksByEmployee(
    employeeId: string,
    options?: {
      status?: TaskStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ tasks: Task[]; total: number }> {
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

  // ========== SPRINT MEMBER METHODS ==========

  /**
   * Add a member to a sprint
   */
  async addSprintMember(
    data: {
      sprintId: string;
      employeeId: string;
      role?: SprintMemberRole;
    },
    addedByUserId?: string
  ): Promise<SprintMember> {
    // Check if member already exists
    const existing = await this.sprintMemberRepository.findOne({
      where: {
        sprintId: data.sprintId,
        employeeId: data.employeeId,
      },
    });

    if (existing && !existing.leftAt) {
      throw new Error("Employee is already a member of this sprint");
    }

    // If they left before, create new membership
    const member = this.sprintMemberRepository.create({
      sprintId: data.sprintId,
      employeeId: data.employeeId,
      role: data.role || SprintMemberRole.DEVELOPER,
    });

    const savedMember = await this.sprintMemberRepository.save(member);

    // Send notification
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
          ? await AppDataSource.getRepository("User").findOne({
              where: { userId: addedByUserId },
            })
          : null;
        const addedByName = addedBy
          ? `${addedBy.firstName} ${addedBy.lastName}`
          : "System";

        await notificationService.notifyAddedToSprint({
          employeeUserId: employee.user.userId,
          sprintName: sprint.name,
          projectName: sprint.project.name,
          role: savedMember.role,
          addedByName,
          addedByUserId,
        });
      }
    } catch (error) {
      console.error("Error sending sprint member notification:", error);
      // Don't fail the operation if notification fails
    }

    return savedMember;
  }

  /**
   * Remove a member from a sprint
   */
  async removeSprintMember(
    sprintId: string,
    employeeId: string,
    removedByUserId?: string
  ): Promise<void> {
    const member = await this.sprintMemberRepository
      .createQueryBuilder("member")
      .where("member.sprintId = :sprintId", { sprintId })
      .andWhere("member.employeeId = :employeeId", { employeeId })
      .andWhere("member.leftAt IS NULL")
      .getOne();

    if (member) {
      member.leave();
      await this.sprintMemberRepository.save(member);

      // Send notification
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
            ? await AppDataSource.getRepository("User").findOne({
                where: { userId: removedByUserId },
              })
            : null;
          const removedByName = removedBy
            ? `${removedBy.firstName} ${removedBy.lastName}`
            : "System";

          await notificationService.notifyRemovedFromSprint({
            employeeUserId: employee.user.userId,
            sprintName: sprint.name,
            projectName: sprint.project.name,
            removedByName,
            removedByUserId,
          });
        }
      } catch (error) {
        console.error("Error sending sprint removal notification:", error);
        // Don't fail the operation if notification fails
      }
    }
  }

  /**
   * Update sprint member role
   */
  async updateSprintMemberRole(
    sprintId: string,
    employeeId: string,
    role: SprintMemberRole
  ): Promise<SprintMember | null> {
    const member = await this.sprintMemberRepository
      .createQueryBuilder("member")
      .where("member.sprintId = :sprintId", { sprintId })
      .andWhere("member.employeeId = :employeeId", { employeeId })
      .andWhere("member.leftAt IS NULL")
      .getOne();

    if (!member) return null;

    member.role = role;
    return await this.sprintMemberRepository.save(member);
  }

  /**
   * Get all members of a sprint
   */
  async getSprintMembers(sprintId: string): Promise<SprintMember[]> {
    return await this.sprintMemberRepository.find({
      where: { sprintId },
      relations: ["employee"],
      order: { joinedAt: "ASC" },
    });
  }

  /**
   * Get active members of a sprint
   */
  async getActiveSprintMembers(sprintId: string): Promise<SprintMember[]> {
    return await this.sprintMemberRepository
      .createQueryBuilder("member")
      .leftJoinAndSelect("member.employee", "employee")
      .where("member.sprintId = :sprintId", { sprintId })
      .andWhere("member.leftAt IS NULL")
      .orderBy("member.joinedAt", "ASC")
      .getMany();
  }

  // ========== COMMENT METHODS ==========

  /**
   * Add a comment to a task
   */
  async addComment(data: {
    taskId: string;
    authorId: string;
    content: string;
  }): Promise<TaskComment> {
    const comment = this.commentRepository.create(data);
    return await this.commentRepository.save(comment);
  }

  /**
   * Get all comments for a task
   */
  async getCommentsByTask(taskId: string): Promise<TaskComment[]> {
    return await this.commentRepository.find({
      where: { taskId },
      relations: ["author"],
      order: { createdAt: "ASC" },
    });
  }

  /**
   * Update a comment
   */
  async updateComment(
    commentId: string,
    content: string
  ): Promise<TaskComment | null> {
    const comment = await this.commentRepository.findOne({
      where: { commentId },
    });
    if (!comment) return null;

    comment.content = content;
    return await this.commentRepository.save(comment);
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<boolean> {
    const result = await this.commentRepository.delete(commentId);
    return (result.affected ?? 0) > 0;
  }

  // ========== ATTACHMENT METHODS ==========

  /**
   * Add an attachment to a task
   */
  async addAttachment(data: {
    taskId: string;
    uploadedById: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    type: AttachmentType;
  }): Promise<TaskAttachment> {
    const attachment = this.attachmentRepository.create(data);
    return await this.attachmentRepository.save(attachment);
  }

  /**
   * Get all attachments for a task
   */
  async getAttachmentsByTask(taskId: string): Promise<TaskAttachment[]> {
    return await this.attachmentRepository.find({
      where: { taskId },
      relations: ["uploadedBy"],
      order: { uploadedAt: "DESC" },
    });
  }

  /**
   * Delete an attachment
   */
  async deleteAttachment(attachmentId: string): Promise<boolean> {
    const result = await this.attachmentRepository.delete(attachmentId);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Get attachment by ID
   */
  async getAttachmentById(
    attachmentId: string
  ): Promise<TaskAttachment | null> {
    return await this.attachmentRepository.findOne({
      where: { attachmentId },
      relations: ["uploadedBy", "task"],
    });
  }

  // ========== PROJECT MEMBER METHODS ==========

  /**
   * Add a member to a project
   */
  async addProjectMember(
    data: {
      projectId: string;
      employeeId: string;
      role?: ProjectMemberRole;
    },
    addedByUserId?: string
  ): Promise<ProjectMember> {
    // Check if member already exists
    const existing = await this.projectMemberRepository.findOne({
      where: {
        projectId: data.projectId,
        employeeId: data.employeeId,
      },
    });

    if (existing && !existing.leftAt) {
      throw new Error("Employee is already a member of this project");
    }

    // If they left before, create new membership
    const member = this.projectMemberRepository.create({
      projectId: data.projectId,
      employeeId: data.employeeId,
      role: data.role || ProjectMemberRole.DEVELOPER,
      joinedAt: new Date(),
    });

    const savedMember = await this.projectMemberRepository.save(member);

    // Send notification
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
          ? await AppDataSource.getRepository("User").findOne({
              where: { userId: addedByUserId },
            })
          : null;
        const addedByName = addedBy
          ? `${addedBy.firstName} ${addedBy.lastName}`
          : "System";

        await notificationService.notifyAddedToProject({
          employeeUserId: employee.user.userId,
          projectName: project.name,
          role: savedMember.role,
          managerName: addedByName,
          managerUserId: addedByUserId || "",
        });
      }
    } catch (error) {
      console.error("Error sending project member notification:", error);
      // Don't fail the operation if notification fails
    }

    return savedMember;
  }

  /**
   * Remove a member from a project
   */
  async removeProjectMember(
    projectId: string,
    employeeId: string,
    removedByUserId?: string
  ): Promise<void> {
    const member = await this.projectMemberRepository
      .createQueryBuilder("member")
      .where("member.projectId = :projectId", { projectId })
      .andWhere("member.employeeId = :employeeId", { employeeId })
      .andWhere("member.leftAt IS NULL")
      .getOne();

    if (member) {
      member.leave();
      await this.projectMemberRepository.save(member);

      // Send notification
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
            ? await AppDataSource.getRepository("User").findOne({
                where: { userId: removedByUserId },
              })
            : null;

          await notificationService.notifyRemovedFromProject({
            employeeUserId: employee.user.userId,
            projectName: project.name,
            managerName: removedBy
              ? `${removedBy.firstName} ${removedBy.lastName}`
              : "System",
            managerUserId: removedByUserId || "",
          });
        }
      } catch (error) {
        console.error("Error sending remove member notification:", error);
      }
    }
  }

  /**
   * Update a project member's role
   */
  async updateProjectMemberRole(
    projectId: string,
    employeeId: string,
    role: ProjectMemberRole
  ): Promise<ProjectMember | null> {
    const member = await this.projectMemberRepository
      .createQueryBuilder("member")
      .where("member.projectId = :projectId", { projectId })
      .andWhere("member.employeeId = :employeeId", { employeeId })
      .andWhere("member.leftAt IS NULL")
      .getOne();

    if (!member) return null;

    member.role = role;
    return await this.projectMemberRepository.save(member);
  }

  /**
   * Get all members of a project
   */
  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    return await this.projectMemberRepository.find({
      where: { projectId },
      relations: ["employee", "employee.user"],
      order: { joinedAt: "ASC" },
    });
  }

  /**
   * Get active members of a project
   */
  async getActiveProjectMembers(projectId: string): Promise<ProjectMember[]> {
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

export const projectService = new ProjectService();
