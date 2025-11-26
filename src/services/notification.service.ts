import { AppDataSource } from "../config/typeorm";
import {
  Notification,
  NotificationType,
} from "../models/entities/notification";
import { User } from "../models/entities/user";
import { getSocketService } from "../config/socket";

export class NotificationService {
  private notificationRepository = AppDataSource.getRepository(Notification);
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Create a new notification
   */
  async createNotification(data: {
    title: string;
    message: string;
    type: NotificationType;
    recipientUserId: string;
    sentByUserId?: string;
    metadata?: any;
  }): Promise<Notification> {
    const notification = this.notificationRepository.create({
      title: data.title,
      message: data.message,
      type: data.type,
      recipientUserId: data.recipientUserId,
      sentByUserId: data.sentByUserId,
    });

    const savedNotification = await this.notificationRepository.save(
      notification
    );

    // Send real-time notification via Socket.IO
    try {
      const socketService = getSocketService();
      socketService.sendNotificationToUser(
        data.recipientUserId,
        savedNotification
      );
    } catch (error) {
      console.warn(
        "Socket service not available for real-time notification:",
        error
      );
    }

    return savedNotification;
  }

  /**
   * Create bulk notifications for multiple recipients
   */
  async createBulkNotifications(data: {
    title: string;
    message: string;
    type: NotificationType;
    recipientUserIds: string[];
    sentByUserId?: string;
  }): Promise<Notification[]> {
    const notifications = data.recipientUserIds.map((recipientId) =>
      this.notificationRepository.create({
        title: data.title,
        message: data.message,
        type: data.type,
        recipientUserId: recipientId,
        sentByUserId: data.sentByUserId,
      })
    );

    const savedNotifications = await this.notificationRepository.save(
      notifications
    );

    // Send real-time notifications via Socket.IO
    try {
      const socketService = getSocketService();
      savedNotifications.forEach((notification) => {
        socketService.sendNotificationToUser(
          notification.recipientUserId,
          notification
        );
      });
    } catch (error) {
      console.warn(
        "Socket service not available for real-time notifications:",
        error
      );
    }

    return savedNotifications;
  }

  /**
   * Get all notifications for a user
   */
  async getUserNotifications(
    userId: string,
    options?: {
      unreadOnly?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
  }> {
    const query = this.notificationRepository
      .createQueryBuilder("notification")
      .leftJoinAndSelect("notification.sentBy", "sentBy")
      .where("notification.recipientUserId = :userId", { userId })
      .orderBy("notification.createdAt", "DESC");

    if (options?.unreadOnly) {
      query.andWhere("notification.isRead = :isRead", { isRead: false });
    }

    const total = await query.getCount();

    if (options?.limit) {
      query.take(options.limit);
    }

    if (options?.offset) {
      query.skip(options.offset);
    }

    const notifications = await query.getMany();

    // Get unread count
    const unreadCount = await this.notificationRepository.count({
      where: {
        recipientUserId: userId,
        isRead: false,
      },
    });

    return {
      notifications,
      total,
      unreadCount,
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(
    notificationId: number,
    userId: string
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: {
        notificationId,
        recipientUserId: userId,
      },
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    notification.markAsRead();
    return await this.notificationRepository.save(notification);
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true, readAt: new Date() })
      .where("recipientUserId = :userId", { userId })
      .andWhere("isRead = :isRead", { isRead: false })
      .execute();
  }

  /**
   * Delete a notification
   */
  async deleteNotification(
    notificationId: number,
    userId: string
  ): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: {
        notificationId,
        recipientUserId: userId,
      },
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    await this.notificationRepository.remove(notification);
  }

  /**
   * Delete all read notifications for a user
   */
  async deleteAllRead(userId: string): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .from(Notification)
      .where("recipientUserId = :userId", { userId })
      .andWhere("isRead = :isRead", { isRead: true })
      .execute();
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: {
        recipientUserId: userId,
        isRead: false,
      },
    });
  }

  // ========================================================================
  // Notification Templates - Specific use cases
  // ========================================================================

  /**
   * Notify when leave request is submitted
   */
  async notifyLeaveRequestSubmitted(data: {
    approverUserId: string;
    employeeName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    employeeUserId: string;
  }): Promise<Notification> {
    return await this.createNotification({
      title: "New Leave Request",
      message: `${data.employeeName} has submitted a ${data.leaveType} request from ${data.startDate} to ${data.endDate}.`,
      type: NotificationType.INFO,
      recipientUserId: data.approverUserId,
      sentByUserId: data.employeeUserId,
    });
  }

  /**
   * Notify when leave request is approved
   */
  async notifyLeaveRequestApproved(data: {
    employeeUserId: string;
    approverName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    approverUserId: string;
  }): Promise<Notification> {
    return await this.createNotification({
      title: "Leave Request Approved",
      message: `Your ${data.leaveType} request from ${data.startDate} to ${data.endDate} has been approved by ${data.approverName}.`,
      type: NotificationType.SUCCESS,
      recipientUserId: data.employeeUserId,
      sentByUserId: data.approverUserId,
    });
  }

  /**
   * Notify when leave request is rejected
   */
  async notifyLeaveRequestRejected(data: {
    employeeUserId: string;
    approverName: string;
    leaveType: string;
    reason?: string;
    approverUserId: string;
  }): Promise<Notification> {
    const message = data.reason
      ? `Your ${data.leaveType} request has been rejected by ${data.approverName}. Reason: ${data.reason}`
      : `Your ${data.leaveType} request has been rejected by ${data.approverName}.`;

    return await this.createNotification({
      title: "Leave Request Rejected",
      message,
      type: NotificationType.WARNING,
      recipientUserId: data.employeeUserId,
      sentByUserId: data.approverUserId,
    });
  }

  /**
   * Notify when employee is added to a project
   */
  async notifyAddedToProject(data: {
    employeeUserId: string;
    projectName: string;
    role?: string;
    managerName: string;
    managerUserId: string;
  }): Promise<Notification> {
    const message = data.role
      ? `You have been added to project "${data.projectName}" as ${data.role} by ${data.managerName}.`
      : `You have been added to project "${data.projectName}" by ${data.managerName}.`;

    return await this.createNotification({
      title: "Added to Project",
      message,
      type: NotificationType.INFO,
      recipientUserId: data.employeeUserId,
      sentByUserId: data.managerUserId,
    });
  }

  /**
   * Notify when employee is removed from a project
   */
  async notifyRemovedFromProject(data: {
    employeeUserId: string;
    projectName: string;
    managerName: string;
    managerUserId: string;
  }): Promise<Notification> {
    return await this.createNotification({
      title: "Removed from Project",
      message: `You have been removed from project "${data.projectName}" by ${data.managerName}.`,
      type: NotificationType.WARNING,
      recipientUserId: data.employeeUserId,
      sentByUserId: data.managerUserId,
    });
  }

  /**
   * Notify when contract is expiring soon
   */
  async notifyContractExpiring(data: {
    employeeUserId: string;
    daysRemaining: number;
    endDate: string;
  }): Promise<Notification> {
    return await this.createNotification({
      title: "Contract Expiring Soon",
      message: `Your contract will expire in ${data.daysRemaining} days (${data.endDate}). Please contact HR for renewal.`,
      type: NotificationType.WARNING,
      recipientUserId: data.employeeUserId,
    });
  }

  /**
   * Notify when employee profile is updated
   */
  async notifyProfileUpdated(data: {
    employeeUserId: string;
    updatedBy: string;
    updaterUserId: string;
  }): Promise<Notification> {
    return await this.createNotification({
      title: "Profile Updated",
      message: `Your employee profile has been updated by ${data.updatedBy}.`,
      type: NotificationType.INFO,
      recipientUserId: data.employeeUserId,
      sentByUserId: data.updaterUserId,
    });
  }

  /**
   * Notify when document requires signature
   */
  async notifyDocumentSignature(data: {
    employeeUserId: string;
    documentName: string;
    dueDate?: string;
  }): Promise<Notification> {
    const message = data.dueDate
      ? `Document "${data.documentName}" requires your signature by ${data.dueDate}.`
      : `Document "${data.documentName}" requires your signature.`;

    return await this.createNotification({
      title: "Signature Required",
      message,
      type: NotificationType.WARNING,
      recipientUserId: data.employeeUserId,
    });
  }

  /**
   * Notify when timesheet is due
   */
  async notifyTimesheetDue(data: {
    employeeUserId: string;
    period: string;
    dueDate: string;
  }): Promise<Notification> {
    return await this.createNotification({
      title: "Timesheet Due",
      message: `Your timesheet for ${data.period} is due by ${data.dueDate}.`,
      type: NotificationType.WARNING,
      recipientUserId: data.employeeUserId,
    });
  }

  /**
   * Notify when salary is processed
   */
  async notifySalaryProcessed(data: {
    employeeUserId: string;
    period: string;
    amount: string;
  }): Promise<Notification> {
    return await this.createNotification({
      title: "Salary Processed",
      message: `Your salary for ${data.period} (${data.amount}) has been processed and will be credited soon.`,
      type: NotificationType.SUCCESS,
      recipientUserId: data.employeeUserId,
    });
  }

  // ========================================================================
  // Project Management Notifications
  // ========================================================================

  /**
   * Notify when a task is assigned to an employee
   */
  async notifyTaskAssigned(data: {
    employeeUserId: string;
    taskTitle: string;
    taskId: string;
    projectName: string;
    sprintName: string;
    priority: string;
    assignedByName: string;
    assignedByUserId?: string;
  }): Promise<Notification> {
    return await this.createNotification({
      title: "New Task Assigned",
      message: `You have been assigned a ${data.priority.toLowerCase()} priority task "${
        data.taskTitle
      }" in ${data.projectName} - ${data.sprintName} by ${
        data.assignedByName
      }.`,
      type: NotificationType.INFO,
      recipientUserId: data.employeeUserId,
      sentByUserId: data.assignedByUserId,
    });
  }

  /**
   * Notify when a task is reassigned to another employee
   */
  async notifyTaskReassigned(data: {
    newEmployeeUserId: string;
    oldEmployeeUserId?: string;
    taskTitle: string;
    taskId: string;
    projectName: string;
    sprintName: string;
    reassignedByName: string;
    reassignedByUserId?: string;
  }): Promise<Notification[]> {
    const notifications: Notification[] = [];

    // Notify the new assignee
    const newAssigneeNotification = await this.createNotification({
      title: "Task Reassigned to You",
      message: `Task "${data.taskTitle}" in ${data.projectName} - ${data.sprintName} has been reassigned to you by ${data.reassignedByName}.`,
      type: NotificationType.INFO,
      recipientUserId: data.newEmployeeUserId,
      sentByUserId: data.reassignedByUserId,
    });
    notifications.push(newAssigneeNotification);

    // Notify the old assignee if exists
    if (data.oldEmployeeUserId) {
      const oldAssigneeNotification = await this.createNotification({
        title: "Task Reassigned",
        message: `Task "${data.taskTitle}" has been reassigned to another team member by ${data.reassignedByName}.`,
        type: NotificationType.WARNING,
        recipientUserId: data.oldEmployeeUserId,
        sentByUserId: data.reassignedByUserId,
      });
      notifications.push(oldAssigneeNotification);
    }

    return notifications;
  }

  /**
   * Notify when task status is updated
   */
  async notifyTaskStatusUpdated(data: {
    employeeUserId: string;
    taskTitle: string;
    taskId: string;
    oldStatus: string;
    newStatus: string;
    projectName: string;
    sprintName: string;
    updatedByName: string;
    updatedByUserId?: string;
  }): Promise<Notification> {
    let notificationType = NotificationType.INFO;
    let titlePrefix = "Task Status Updated";

    // Set notification type based on new status
    if (data.newStatus === "DONE") {
      notificationType = NotificationType.SUCCESS;
      titlePrefix = "Task Completed";
    } else if (data.newStatus === "BLOCKED") {
      notificationType = NotificationType.ERROR;
      titlePrefix = "Task Blocked";
    } else if (data.newStatus === "IN_REVIEW") {
      notificationType = NotificationType.INFO;
      titlePrefix = "Task In Review";
    }

    return await this.createNotification({
      title: titlePrefix,
      message: `Task "${data.taskTitle}" in ${data.projectName} - ${
        data.sprintName
      } has been moved from ${data.oldStatus.replace(
        "_",
        " "
      )} to ${data.newStatus.replace("_", " ")} by ${data.updatedByName}.`,
      type: notificationType,
      recipientUserId: data.employeeUserId,
      sentByUserId: data.updatedByUserId,
    });
  }

  /**
   * Notify project team when a task is completed
   */
  async notifyTaskCompleted(data: {
    teamMemberUserIds: string[];
    taskTitle: string;
    taskId: string;
    completedByName: string;
    completedByUserId: string;
    projectName: string;
    sprintName: string;
  }): Promise<Notification[]> {
    // Don't notify the person who completed the task
    const recipientIds = data.teamMemberUserIds.filter(
      (id) => id !== data.completedByUserId
    );

    if (recipientIds.length === 0) {
      return [];
    }

    return await this.createBulkNotifications({
      title: "Task Completed",
      message: `${data.completedByName} has completed task "${data.taskTitle}" in ${data.projectName} - ${data.sprintName}.`,
      type: NotificationType.SUCCESS,
      recipientUserIds: recipientIds,
      sentByUserId: data.completedByUserId,
    });
  }

  /**
   * Notify when added to sprint as a member
   */
  async notifyAddedToSprint(data: {
    employeeUserId: string;
    sprintName: string;
    projectName: string;
    role: string;
    addedByName: string;
    addedByUserId?: string;
  }): Promise<Notification> {
    return await this.createNotification({
      title: "Added to Sprint",
      message: `You have been added to sprint "${data.sprintName}" in project "${data.projectName}" as ${data.role} by ${data.addedByName}.`,
      type: NotificationType.INFO,
      recipientUserId: data.employeeUserId,
      sentByUserId: data.addedByUserId,
    });
  }

  /**
   * Notify when removed from sprint
   */
  async notifyRemovedFromSprint(data: {
    employeeUserId: string;
    sprintName: string;
    projectName: string;
    removedByName: string;
    removedByUserId?: string;
  }): Promise<Notification> {
    return await this.createNotification({
      title: "Removed from Sprint",
      message: `You have been removed from sprint "${data.sprintName}" in project "${data.projectName}" by ${data.removedByName}.`,
      type: NotificationType.WARNING,
      recipientUserId: data.employeeUserId,
      sentByUserId: data.removedByUserId,
    });
  }

  /**
   * Notify when sprint status changes
   */
  async notifySprintStatusChanged(data: {
    teamMemberUserIds: string[];
    sprintName: string;
    projectName: string;
    newStatus: string;
    changedByName: string;
    changedByUserId: string;
  }): Promise<Notification[]> {
    let message = "";
    let type = NotificationType.INFO;

    if (data.newStatus === "ACTIVE") {
      message = `Sprint "${data.sprintName}" in ${data.projectName} has started by ${data.changedByName}.`;
      type = NotificationType.SUCCESS;
    } else if (data.newStatus === "COMPLETED") {
      message = `Sprint "${data.sprintName}" in ${data.projectName} has been completed by ${data.changedByName}.`;
      type = NotificationType.SUCCESS;
    } else if (data.newStatus === "CANCELLED") {
      message = `Sprint "${data.sprintName}" in ${data.projectName} has been cancelled by ${data.changedByName}.`;
      type = NotificationType.WARNING;
    } else {
      message = `Sprint "${data.sprintName}" in ${data.projectName} status changed to ${data.newStatus} by ${data.changedByName}.`;
    }

    // Don't notify the person who made the change
    const recipientIds = data.teamMemberUserIds.filter(
      (id) => id !== data.changedByUserId
    );

    if (recipientIds.length === 0) {
      return [];
    }

    return await this.createBulkNotifications({
      title: "Sprint Status Changed",
      message,
      type,
      recipientUserIds: recipientIds,
      sentByUserId: data.changedByUserId,
    });
  }
}

export const notificationService = new NotificationService();
