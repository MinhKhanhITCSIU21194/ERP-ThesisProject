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
exports.Contract = exports.WorkingType = exports.ContractType = exports.ContractStatus = void 0;
const typeorm_1 = require("typeorm");
const employee_1 = require("./employee");
var ContractStatus;
(function (ContractStatus) {
    ContractStatus["PENDING"] = "PENDING";
    ContractStatus["ACTIVE"] = "ACTIVE";
    ContractStatus["EXPIRED"] = "EXPIRED";
    ContractStatus["TERMINATED"] = "TERMINATED";
})(ContractStatus || (exports.ContractStatus = ContractStatus = {}));
var ContractType;
(function (ContractType) {
    ContractType["FULL_TIME"] = "FULL_TIME";
    ContractType["PART_TIME"] = "PART_TIME";
    ContractType["CONTRACT"] = "CONTRACT";
    ContractType["INTERNSHIP"] = "INTERNSHIP";
    ContractType["TEMPORARY"] = "TEMPORARY";
    ContractType["FREELANCE"] = "FREELANCE";
})(ContractType || (exports.ContractType = ContractType = {}));
var WorkingType;
(function (WorkingType) {
    WorkingType["ONSITE"] = "ONSITE";
    WorkingType["REMOTE"] = "REMOTE";
    WorkingType["HYBRID"] = "HYBRID";
})(WorkingType || (exports.WorkingType = WorkingType = {}));
let Contract = class Contract {
    isExpiringSoon(days = 30) {
        if (!this.endDate || this.status !== ContractStatus.ACTIVE)
            return false;
        const endDate = new Date(this.endDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry > 0 && daysUntilExpiry <= days;
    }
    isExpired() {
        if (!this.endDate)
            return false;
        const endDate = new Date(this.endDate);
        const today = new Date();
        return today > endDate;
    }
};
exports.Contract = Contract;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Contract.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50, unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Contract.prototype, "contractNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Contract.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_1.Employee, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "employeeId" }),
    __metadata("design:type", employee_1.Employee)
], Contract.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ContractType,
    }),
    __metadata("design:type", String)
], Contract.prototype, "contractType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: WorkingType,
    }),
    __metadata("design:type", String)
], Contract.prototype, "workingType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ContractStatus,
        default: ContractStatus.PENDING,
    }),
    __metadata("design:type", String)
], Contract.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], Contract.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true }),
    __metadata("design:type", Date)
], Contract.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "contractFile", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "terms", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Contract.prototype, "salary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 10, default: "USD" }),
    __metadata("design:type", String)
], Contract.prototype, "salaryCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, default: "MONTHLY" }),
    __metadata("design:type", String)
], Contract.prototype, "salaryFrequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 40 }),
    __metadata("design:type", Number)
], Contract.prototype, "weeklyWorkHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Contract.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Contract.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], Contract.prototype, "deletedAt", void 0);
exports.Contract = Contract = __decorate([
    (0, typeorm_1.Entity)("contracts")
], Contract);
//# sourceMappingURL=contract.js.map