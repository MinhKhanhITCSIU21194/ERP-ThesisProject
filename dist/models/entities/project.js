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
exports.Project = exports.ProjectPriority = exports.ProjectStatus = void 0;
const typeorm_1 = require("typeorm");
const employee_1 = require("./employee");
const sprint_1 = require("./sprint");
const project_member_1 = require("./project-member");
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["PLANNING"] = "PLANNING";
    ProjectStatus["ACTIVE"] = "ACTIVE";
    ProjectStatus["ON_HOLD"] = "ON_HOLD";
    ProjectStatus["COMPLETED"] = "COMPLETED";
    ProjectStatus["CANCELLED"] = "CANCELLED";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
var ProjectPriority;
(function (ProjectPriority) {
    ProjectPriority["LOW"] = "LOW";
    ProjectPriority["MEDIUM"] = "MEDIUM";
    ProjectPriority["HIGH"] = "HIGH";
    ProjectPriority["CRITICAL"] = "CRITICAL";
})(ProjectPriority || (exports.ProjectPriority = ProjectPriority = {}));
let Project = class Project {
    markAsRecent() {
        this.isRecent = true;
        this.lastAccessedAt = new Date();
    }
    markAsActive() {
        this.status = ProjectStatus.ACTIVE;
    }
    complete() {
        this.status = ProjectStatus.COMPLETED;
    }
    cancel() {
        this.status = ProjectStatus.CANCELLED;
    }
};
exports.Project = Project;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Project.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 200 }),
    __metadata("design:type", String)
], Project.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Project.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ProjectStatus,
        default: ProjectStatus.PLANNING,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Project.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ProjectPriority,
        default: ProjectPriority.MEDIUM,
    }),
    __metadata("design:type", String)
], Project.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true }),
    __metadata("design:type", Date)
], Project.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true }),
    __metadata("design:type", Date)
], Project.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Project.prototype, "projectManagerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_1.Employee, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "projectManagerId" }),
    __metadata("design:type", employee_1.Employee)
], Project.prototype, "projectManager", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], Project.prototype, "lastAccessedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], Project.prototype, "isRecent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => sprint_1.Sprint, (sprint) => sprint.project),
    __metadata("design:type", Array)
], Project.prototype, "sprints", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => project_member_1.ProjectMember, (member) => member.project),
    __metadata("design:type", Array)
], Project.prototype, "members", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Project.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Project.prototype, "updatedAt", void 0);
exports.Project = Project = __decorate([
    (0, typeorm_1.Entity)("projects")
], Project);
//# sourceMappingURL=project.js.map