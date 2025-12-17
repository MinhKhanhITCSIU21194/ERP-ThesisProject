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
exports.LeaveRequest = exports.LeaveType = exports.LeaveRequestStatus = void 0;
const typeorm_1 = require("typeorm");
const employee_1 = require("./employee");
const user_1 = require("./user");
var LeaveRequestStatus;
(function (LeaveRequestStatus) {
    LeaveRequestStatus["PENDING"] = "PENDING";
    LeaveRequestStatus["APPROVED"] = "APPROVED";
    LeaveRequestStatus["REJECTED"] = "REJECTED";
    LeaveRequestStatus["CANCELLED"] = "CANCELLED";
})(LeaveRequestStatus || (exports.LeaveRequestStatus = LeaveRequestStatus = {}));
var LeaveType;
(function (LeaveType) {
    LeaveType["SICK"] = "SICK";
    LeaveType["PERSONAL"] = "PERSONAL";
    LeaveType["VACATION"] = "VACATION";
    LeaveType["OTHER"] = "OTHER";
})(LeaveType || (exports.LeaveType = LeaveType = {}));
let LeaveRequest = class LeaveRequest {
    approve(approverId, comment) {
        this.status = LeaveRequestStatus.APPROVED;
        this.approverComment = comment;
        this.approvedAt = new Date();
    }
    reject(approverId, comment) {
        this.status = LeaveRequestStatus.REJECTED;
        this.approverComment = comment;
        this.approvedAt = new Date();
    }
    cancel() {
        this.status = LeaveRequestStatus.CANCELLED;
    }
    canBeModified() {
        return this.status === LeaveRequestStatus.PENDING;
    }
};
exports.LeaveRequest = LeaveRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], LeaveRequest.prototype, "leaveRequestId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LeaveRequest.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_1.Employee, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "employeeId" }),
    __metadata("design:type", employee_1.Employee)
], LeaveRequest.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 3, scale: 1 }),
    __metadata("design:type", Number)
], LeaveRequest.prototype, "leavePeriodStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 3, scale: 1 }),
    __metadata("design:type", Number)
], LeaveRequest.prototype, "leavePeriodEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 4, scale: 1 }),
    __metadata("design:type", Number)
], LeaveRequest.prototype, "totalDays", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: LeaveType,
    }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "leaveType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: LeaveRequestStatus,
        default: LeaveRequestStatus.PENDING,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LeaveRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LeaveRequest.prototype, "approverId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.User, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "approverId" }),
    __metadata("design:type", user_1.User)
], LeaveRequest.prototype, "approver", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "approverComment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "updatedAt", void 0);
exports.LeaveRequest = LeaveRequest = __decorate([
    (0, typeorm_1.Entity)("leave_requests")
], LeaveRequest);
//# sourceMappingURL=leave-request.js.map