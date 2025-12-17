"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const typeorm_1 = require("../config/typeorm");
const notification_1 = require("../models/entities/notification");
const user_1 = require("../models/entities/user");
const socket_1 = require("../config/socket");
class NotificationService {
    constructor() {
        this.notificationRepository = typeorm_1.AppDataSource.getRepository(notification_1.Notification);
        this.userRepository = typeorm_1.AppDataSource.getRepository(user_1.User);
    }
    async createNotification(data) {
        const notification = this.notificationRepository.create({
            title: data.title,
            message: data.message,
            type: data.type,
            recipientUserId: data.recipientUserId,
            sentByUserId: data.sentByUserId,
        });
        const savedNotification = await this.notificationRepository.save(notification);
        try {
            const socketService = (0, socket_1.getSocketService)();
            socketService.sendNotificationToUser(data.recipientUserId, savedNotification);
        }
        catch (error) {
            console.warn("Socket service not available for real-time notification:", error);
        }
        return savedNotification;
    }
    async createBulkNotifications(data) {
        const notifications = data.recipientUserIds.map((recipientId) => this.notificationRepository.create({
            title: data.title,
            message: data.message,
            type: data.type,
            recipientUserId: recipientId,
            sentByUserId: data.sentByUserId,
        }));
        const savedNotifications = await this.notificationRepository.save(notifications);
        try {
            const socketService = (0, socket_1.getSocketService)();
            savedNotifications.forEach((notification) => {
                socketService.sendNotificationToUser(notification.recipientUserId, notification);
            });
        }
        catch (error) {
            console.warn("Socket service not available for real-time notifications:", error);
        }
        return savedNotifications;
    }
    async getUserNotifications(userId, options) {
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
    async markAsRead(notificationId, userId) {
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
    async markAllAsRead(userId) {
        await this.notificationRepository
            .createQueryBuilder()
            .update(notification_1.Notification)
            .set({ isRead: true, readAt: new Date() })
            .where("recipientUserId = :userId", { userId })
            .andWhere("isRead = :isRead", { isRead: false })
            .execute();
    }
    async deleteNotification(notificationId, userId) {
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
    async deleteAllRead(userId) {
        await this.notificationRepository
            .createQueryBuilder()
            .delete()
            .from(notification_1.Notification)
            .where("recipientUserId = :userId", { userId })
            .andWhere("isRead = :isRead", { isRead: true })
            .execute();
    }
    async getUnreadCount(userId) {
        return await this.notificationRepository.count({
            where: {
                recipientUserId: userId,
                isRead: false,
            },
        });
    }
    async notifyLeaveRequestSubmitted(data) {
        return await this.createNotification({
            title: "New Leave Request",
            message: `${data.employeeName} has submitted a ${data.leaveType} request from ${data.startDate} to ${data.endDate}.`,
            type: notification_1.NotificationType.INFO,
            recipientUserId: data.approverUserId,
            sentByUserId: data.employeeUserId,
        });
    }
    async notifyLeaveRequestApproved(data) {
        return await this.createNotification({
            title: "Leave Request Approved",
            message: `Your ${data.leaveType} request from ${data.startDate} to ${data.endDate} has been approved by ${data.approverName}.`,
            type: notification_1.NotificationType.SUCCESS,
            recipientUserId: data.employeeUserId,
            sentByUserId: data.approverUserId,
        });
    }
    async notifyLeaveRequestRejected(data) {
        const message = data.reason
            ? `Your ${data.leaveType} request has been rejected by ${data.approverName}. Reason: ${data.reason}`
            : `Your ${data.leaveType} request has been rejected by ${data.approverName}.`;
        return await this.createNotification({
            title: "Leave Request Rejected",
            message,
            type: notification_1.NotificationType.WARNING,
            recipientUserId: data.employeeUserId,
            sentByUserId: data.approverUserId,
        });
    }
    async notifyAddedToProject(data) {
        const message = data.role
            ? `You have been added to project "${data.projectName}" as ${data.role} by ${data.managerName}.`
            : `You have been added to project "${data.projectName}" by ${data.managerName}.`;
        return await this.createNotification({
            title: "Added to Project",
            message,
            type: notification_1.NotificationType.INFO,
            recipientUserId: data.employeeUserId,
            sentByUserId: data.managerUserId,
        });
    }
    async notifyRemovedFromProject(data) {
        return await this.createNotification({
            title: "Removed from Project",
            message: `You have been removed from project "${data.projectName}" by ${data.managerName}.`,
            type: notification_1.NotificationType.WARNING,
            recipientUserId: data.employeeUserId,
            sentByUserId: data.managerUserId,
        });
    }
    async notifyContractExpiring(data) {
        return await this.createNotification({
            title: "Contract Expiring Soon",
            message: `Your contract will expire in ${data.daysRemaining} days (${data.endDate}). Please contact HR for renewal.`,
            type: notification_1.NotificationType.WARNING,
            recipientUserId: data.employeeUserId,
        });
    }
    async notifyProfileUpdated(data) {
        return await this.createNotification({
            title: "Profile Updated",
            message: `Your employee profile has been updated by ${data.updatedBy}.`,
            type: notification_1.NotificationType.INFO,
            recipientUserId: data.employeeUserId,
            sentByUserId: data.updaterUserId,
        });
    }
    async notifyDocumentSignature(data) {
        const message = data.dueDate
            ? `Document "${data.documentName}" requires your signature by ${data.dueDate}.`
            : `Document "${data.documentName}" requires your signature.`;
        return await this.createNotification({
            title: "Signature Required",
            message,
            type: notification_1.NotificationType.WARNING,
            recipientUserId: data.employeeUserId,
        });
    }
    async notifyTimesheetDue(data) {
        return await this.createNotification({
            title: "Timesheet Due",
            message: `Your timesheet for ${data.period} is due by ${data.dueDate}.`,
            type: notification_1.NotificationType.WARNING,
            recipientUserId: data.employeeUserId,
        });
    }
    async notifySalaryProcessed(data) {
        return await this.createNotification({
            title: "Salary Processed",
            message: `Your salary for ${data.period} (${data.amount}) has been processed and will be credited soon.`,
            type: notification_1.NotificationType.SUCCESS,
            recipientUserId: data.employeeUserId,
        });
    }
    async notifyTaskAssigned(data) {
        return await this.createNotification({
            title: "New Task Assigned",
            message: `You have been assigned a ${data.priority.toLowerCase()} priority task "${data.taskTitle}" in ${data.projectName} - ${data.sprintName} by ${data.assignedByName}.`,
            type: notification_1.NotificationType.INFO,
            recipientUserId: data.employeeUserId,
            sentByUserId: data.assignedByUserId,
        });
    }
    async notifyTaskReassigned(data) {
        const notifications = [];
        const newAssigneeNotification = await this.createNotification({
            title: "Task Reassigned to You",
            message: `Task "${data.taskTitle}" in ${data.projectName} - ${data.sprintName} has been reassigned to you by ${data.reassignedByName}.`,
            type: notification_1.NotificationType.INFO,
            recipientUserId: data.newEmployeeUserId,
            sentByUserId: data.reassignedByUserId,
        });
        notifications.push(newAssigneeNotification);
        if (data.oldEmployeeUserId) {
            const oldAssigneeNotification = await this.createNotification({
                title: "Task Reassigned",
                message: `Task "${data.taskTitle}" has been reassigned to another team member by ${data.reassignedByName}.`,
                type: notification_1.NotificationType.WARNING,
                recipientUserId: data.oldEmployeeUserId,
                sentByUserId: data.reassignedByUserId,
            });
            notifications.push(oldAssigneeNotification);
        }
        return notifications;
    }
    async notifyTaskStatusUpdated(data) {
        let notificationType = notification_1.NotificationType.INFO;
        let titlePrefix = "Task Status Updated";
        if (data.newStatus === "DONE") {
            notificationType = notification_1.NotificationType.SUCCESS;
            titlePrefix = "Task Completed";
        }
        else if (data.newStatus === "BLOCKED") {
            notificationType = notification_1.NotificationType.ERROR;
            titlePrefix = "Task Blocked";
        }
        else if (data.newStatus === "IN_REVIEW") {
            notificationType = notification_1.NotificationType.INFO;
            titlePrefix = "Task In Review";
        }
        return await this.createNotification({
            title: titlePrefix,
            message: `Task "${data.taskTitle}" in ${data.projectName} - ${data.sprintName} has been moved from ${data.oldStatus.replace("_", " ")} to ${data.newStatus.replace("_", " ")} by ${data.updatedByName}.`,
            type: notificationType,
            recipientUserId: data.employeeUserId,
            sentByUserId: data.updatedByUserId,
        });
    }
    async notifyTaskCompleted(data) {
        const recipientIds = data.teamMemberUserIds.filter((id) => id !== data.completedByUserId);
        if (recipientIds.length === 0) {
            return [];
        }
        return await this.createBulkNotifications({
            title: "Task Completed",
            message: `${data.completedByName} has completed task "${data.taskTitle}" in ${data.projectName} - ${data.sprintName}.`,
            type: notification_1.NotificationType.SUCCESS,
            recipientUserIds: recipientIds,
            sentByUserId: data.completedByUserId,
        });
    }
    async notifyAddedToSprint(data) {
        return await this.createNotification({
            title: "Added to Sprint",
            message: `You have been added to sprint "${data.sprintName}" in project "${data.projectName}" as ${data.role} by ${data.addedByName}.`,
            type: notification_1.NotificationType.INFO,
            recipientUserId: data.employeeUserId,
            sentByUserId: data.addedByUserId,
        });
    }
    async notifyRemovedFromSprint(data) {
        return await this.createNotification({
            title: "Removed from Sprint",
            message: `You have been removed from sprint "${data.sprintName}" in project "${data.projectName}" by ${data.removedByName}.`,
            type: notification_1.NotificationType.WARNING,
            recipientUserId: data.employeeUserId,
            sentByUserId: data.removedByUserId,
        });
    }
    async notifySprintStatusChanged(data) {
        let message = "";
        let type = notification_1.NotificationType.INFO;
        if (data.newStatus === "ACTIVE") {
            message = `Sprint "${data.sprintName}" in ${data.projectName} has started by ${data.changedByName}.`;
            type = notification_1.NotificationType.SUCCESS;
        }
        else if (data.newStatus === "COMPLETED") {
            message = `Sprint "${data.sprintName}" in ${data.projectName} has been completed by ${data.changedByName}.`;
            type = notification_1.NotificationType.SUCCESS;
        }
        else if (data.newStatus === "CANCELLED") {
            message = `Sprint "${data.sprintName}" in ${data.projectName} has been cancelled by ${data.changedByName}.`;
            type = notification_1.NotificationType.WARNING;
        }
        else {
            message = `Sprint "${data.sprintName}" in ${data.projectName} status changed to ${data.newStatus} by ${data.changedByName}.`;
        }
        const recipientIds = data.teamMemberUserIds.filter((id) => id !== data.changedByUserId);
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
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
//# sourceMappingURL=notification.service.js.map