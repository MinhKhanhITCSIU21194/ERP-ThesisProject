"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = exports.NotificationType = void 0;
const typeorm_1 = require("typeorm");
var NotificationType;
(function (NotificationType) {
    NotificationType["INFO"] = "info";
    NotificationType["WARNING"] = "warning";
    NotificationType["ERROR"] = "error";
    NotificationType["SUCCESS"] = "success";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
let Notification = class Notification {
    markAsRead() {
        this.isRead = true;
        this.readAt = new Date();
    }
    isUrgent() {
        return (this.type === NotificationType.ERROR ||
            this.type === NotificationType.WARNING);
    }
    getDisplayClass() {
        switch (this.type) {
            case NotificationType.SUCCESS:
                return "alert-success";
            case NotificationType.WARNING:
                return "alert-warning";
            case NotificationType.ERROR:
                return "alert-danger";
            default:
                return "alert-info";
        }
    }
};
exports.Notification = Notification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Notification.prototype, "notificationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: NotificationType,
        default: NotificationType.INFO,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], Notification.prototype, "isRead", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Notification.prototype, "recipientUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Notification.prototype, "sentByUserId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Notification.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], Notification.prototype, "readAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)("User", "receivedNotifications", { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "recipientUserId" }),
    __metadata("design:type", Object)
], Notification.prototype, "recipient", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)("User", "sentNotifications", { onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "sentByUserId" }),
    __metadata("design:type", Object)
], Notification.prototype, "sentBy", void 0);
exports.Notification = Notification = __decorate([
    (0, typeorm_1.Entity)("notifications"),
    (0, typeorm_1.Check)(`"type" IN ('info', 'warning', 'error', 'success')`)
], Notification);
//# sourceMappingURL=notification.js.map