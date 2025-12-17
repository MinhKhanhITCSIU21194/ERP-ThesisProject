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
exports.Task = exports.TaskType = exports.TaskPriority = exports.TaskStatus = void 0;
const typeorm_1 = require("typeorm");
const sprint_1 = require("./sprint");
const employee_1 = require("./employee");
const task_comment_1 = require("./task-comment");
const task_attachment_1 = require("./task-attachment");
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["TODO"] = "TODO";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["IN_REVIEW"] = "IN_REVIEW";
    TaskStatus["DONE"] = "DONE";
    TaskStatus["BLOCKED"] = "BLOCKED";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "LOW";
    TaskPriority["MEDIUM"] = "MEDIUM";
    TaskPriority["HIGH"] = "HIGH";
    TaskPriority["CRITICAL"] = "CRITICAL";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
var TaskType;
(function (TaskType) {
    TaskType["STORY"] = "STORY";
    TaskType["BUG"] = "BUG";
    TaskType["TASK"] = "TASK";
    TaskType["EPIC"] = "EPIC";
})(TaskType || (exports.TaskType = TaskType = {}));
let Task = class Task {
    moveToInProgress() {
        this.status = TaskStatus.IN_PROGRESS;
    }
    moveToReview() {
        this.status = TaskStatus.IN_REVIEW;
    }
    complete() {
        this.status = TaskStatus.DONE;
    }
    block() {
        this.status = TaskStatus.BLOCKED;
    }
    assign(employeeId) {
        this.assignedTo = employeeId;
    }
};
exports.Task = Task;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Task.prototype, "taskId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 200 }),
    __metadata("design:type", String)
], Task.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Task.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Task.prototype, "sprintId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sprint_1.Sprint, (sprint) => sprint.tasks, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "sprintId" }),
    __metadata("design:type", sprint_1.Sprint)
], Task.prototype, "sprint", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: TaskStatus,
        default: TaskStatus.TODO,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Task.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: TaskPriority,
        default: TaskPriority.MEDIUM,
    }),
    __metadata("design:type", String)
], Task.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: TaskType,
        default: TaskType.TASK,
    }),
    __metadata("design:type", String)
], Task.prototype, "taskType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Task.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_1.Employee, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "assignedTo" }),
    __metadata("design:type", employee_1.Employee)
], Task.prototype, "assignee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], Task.prototype, "storyPoints", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], Task.prototype, "estimatedHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], Task.prototype, "actualHours", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Task.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Task.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_comment_1.TaskComment, (comment) => comment.task),
    __metadata("design:type", Array)
], Task.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_attachment_1.TaskAttachment, (attachment) => attachment.task),
    __metadata("design:type", Array)
], Task.prototype, "attachments", void 0);
exports.Task = Task = __decorate([
    (0, typeorm_1.Entity)("tasks")
], Task);
//# sourceMappingURL=task.js.map