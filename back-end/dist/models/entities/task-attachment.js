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
exports.TaskAttachment = exports.AttachmentType = void 0;
const typeorm_1 = require("typeorm");
const task_1 = require("./task");
const employee_1 = require("./employee");
var AttachmentType;
(function (AttachmentType) {
    AttachmentType["IMAGE"] = "IMAGE";
    AttachmentType["DOCUMENT"] = "DOCUMENT";
    AttachmentType["OTHER"] = "OTHER";
})(AttachmentType || (exports.AttachmentType = AttachmentType = {}));
let TaskAttachment = class TaskAttachment {
};
exports.TaskAttachment = TaskAttachment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], TaskAttachment.prototype, "attachmentId", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid"),
    __metadata("design:type", String)
], TaskAttachment.prototype, "taskId", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid"),
    __metadata("design:type", String)
], TaskAttachment.prototype, "uploadedById", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TaskAttachment.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TaskAttachment.prototype, "filePath", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TaskAttachment.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TaskAttachment.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: AttachmentType,
        default: AttachmentType.OTHER,
    }),
    __metadata("design:type", String)
], TaskAttachment.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TaskAttachment.prototype, "uploadedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => task_1.Task, (task) => task.attachments, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "taskId" }),
    __metadata("design:type", task_1.Task)
], TaskAttachment.prototype, "task", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_1.Employee),
    (0, typeorm_1.JoinColumn)({ name: "uploadedById" }),
    __metadata("design:type", employee_1.Employee)
], TaskAttachment.prototype, "uploadedBy", void 0);
exports.TaskAttachment = TaskAttachment = __decorate([
    (0, typeorm_1.Entity)("task_attachments")
], TaskAttachment);
//# sourceMappingURL=task-attachment.js.map