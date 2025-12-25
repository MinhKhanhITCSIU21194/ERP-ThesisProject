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
exports.ProjectMember = exports.ProjectMemberRole = void 0;
const typeorm_1 = require("typeorm");
const project_1 = require("./project");
const employee_1 = require("./employee");
var ProjectMemberRole;
(function (ProjectMemberRole) {
    ProjectMemberRole["PROJECT_MANAGER"] = "PROJECT_MANAGER";
    ProjectMemberRole["TECH_LEAD"] = "TECH_LEAD";
    ProjectMemberRole["DEVELOPER"] = "DEVELOPER";
    ProjectMemberRole["DESIGNER"] = "DESIGNER";
    ProjectMemberRole["QA"] = "QA";
    ProjectMemberRole["BUSINESS_ANALYST"] = "BUSINESS_ANALYST";
    ProjectMemberRole["PRODUCT_OWNER"] = "PRODUCT_OWNER";
    ProjectMemberRole["SCRUM_MASTER"] = "SCRUM_MASTER";
})(ProjectMemberRole || (exports.ProjectMemberRole = ProjectMemberRole = {}));
let ProjectMember = class ProjectMember {
    leave() {
        this.leftAt = new Date();
    }
    isActive() {
        return this.leftAt === null || this.leftAt === undefined;
    }
    rejoin() {
        this.leftAt = undefined;
        this.joinedAt = new Date();
    }
};
exports.ProjectMember = ProjectMember;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectMember.prototype, "memberId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ProjectMember.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_1.Project, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "projectId" }),
    __metadata("design:type", project_1.Project)
], ProjectMember.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ProjectMember.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_1.Employee, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "employeeId" }),
    __metadata("design:type", employee_1.Employee)
], ProjectMember.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ProjectMemberRole,
        default: ProjectMemberRole.DEVELOPER,
    }),
    __metadata("design:type", String)
], ProjectMember.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], ProjectMember.prototype, "joinedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Object)
], ProjectMember.prototype, "leftAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ProjectMember.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ProjectMember.prototype, "updatedAt", void 0);
exports.ProjectMember = ProjectMember = __decorate([
    (0, typeorm_1.Entity)("project_members"),
    (0, typeorm_1.Index)(["projectId", "employeeId"], { unique: true, where: '"leftAt" IS NULL' })
], ProjectMember);
//# sourceMappingURL=project-member.js.map