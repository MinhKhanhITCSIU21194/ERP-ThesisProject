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
exports.SprintMember = exports.SprintMemberRole = void 0;
const typeorm_1 = require("typeorm");
const sprint_1 = require("./sprint");
const employee_1 = require("./employee");
var SprintMemberRole;
(function (SprintMemberRole) {
    SprintMemberRole["DEVELOPER"] = "DEVELOPER";
    SprintMemberRole["TESTER"] = "TESTER";
    SprintMemberRole["REVIEWER"] = "REVIEWER";
    SprintMemberRole["SCRUM_MASTER"] = "SCRUM_MASTER";
    SprintMemberRole["PRODUCT_OWNER"] = "PRODUCT_OWNER";
    SprintMemberRole["OBSERVER"] = "OBSERVER";
})(SprintMemberRole || (exports.SprintMemberRole = SprintMemberRole = {}));
let SprintMember = class SprintMember {
    isActive() {
        return !this.leftAt || new Date() < this.leftAt;
    }
    leave() {
        this.leftAt = new Date();
    }
};
exports.SprintMember = SprintMember;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], SprintMember.prototype, "sprintMemberId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], SprintMember.prototype, "sprintId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sprint_1.Sprint, (sprint) => sprint.members, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "sprintId" }),
    __metadata("design:type", sprint_1.Sprint)
], SprintMember.prototype, "sprint", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], SprintMember.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_1.Employee, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "employeeId" }),
    __metadata("design:type", employee_1.Employee)
], SprintMember.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: SprintMemberRole,
        default: SprintMemberRole.DEVELOPER,
    }),
    __metadata("design:type", String)
], SprintMember.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SprintMember.prototype, "joinedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], SprintMember.prototype, "leftAt", void 0);
exports.SprintMember = SprintMember = __decorate([
    (0, typeorm_1.Entity)("sprint_members"),
    (0, typeorm_1.Index)(["sprintId", "employeeId"], { unique: true, where: '"leftAt" IS NULL' })
], SprintMember);
//# sourceMappingURL=sprint-member.js.map