"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.get("/", notification_controller_1.notificationController.getUserNotifications.bind(notification_controller_1.notificationController));
router.get("/unread-count", notification_controller_1.notificationController.getUnreadCount.bind(notification_controller_1.notificationController));
router.post("/", notification_controller_1.notificationController.createNotification.bind(notification_controller_1.notificationController));
router.post("/test", notification_controller_1.notificationController.sendTestNotification.bind(notification_controller_1.notificationController));
router.patch("/read-all", notification_controller_1.notificationController.markAllAsRead.bind(notification_controller_1.notificationController));
router.patch("/:id/read", notification_controller_1.notificationController.markAsRead.bind(notification_controller_1.notificationController));
router.delete("/read", notification_controller_1.notificationController.deleteAllRead.bind(notification_controller_1.notificationController));
router.delete("/:id", notification_controller_1.notificationController.deleteNotification.bind(notification_controller_1.notificationController));
exports.default = router;
//# sourceMappingURL=notifications.js.map